import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorageService } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import { SubscriptionService } from '../../subscription/subscription.service';

@Injectable()
export class SubscriptionThrottlerGuard extends ThrottlerGuard {
  constructor(
    storageService: ThrottlerStorageService,
    reflector: Reflector,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
  ) {
    super([{ ttl: 3600, limit: 100 }], storageService, reflector);
  }

  protected async getTracker(req: Request): Promise<string> {
    // Use user ID as tracker if authenticated, otherwise use IP
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      const user = await this.authService.getCurrentUser(accessToken);
      if (user) {
        return `user:${user.id}`;
      }
    }
    return `ip:${req.ip}`;
  }

  protected async getLimit(context: ExecutionContext): Promise<number> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.access_token;

    // Default limit for unauthenticated users (same as free)
    let limit = 5;

    if (accessToken) {
      const user = await this.authService.getCurrentUser(accessToken);
      if (user) {
        const subscriptionStatus =
          await this.subscriptionService.getSubscriptionStatus(user.id);
        limit = subscriptionStatus === 'pro' ? 100 : 50;
      }
    }

    return limit;
  }
}
