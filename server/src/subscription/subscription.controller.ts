import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { AuthService } from '../auth/auth.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly authService: AuthService,
  ) {}

  private async getUserIdFromRequest(req: Request): Promise<string> {
    const accessToken = req.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.authService.getCurrentUser(accessToken);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user.id;
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activateSubscription(@Req() req: Request) {
    const userId = await this.getUserIdFromRequest(req);
    const accessToken = req.cookies?.access_token;
    const user = await this.authService.getCurrentUser(accessToken);

    if (!user || !user.email) {
      throw new UnauthorizedException('User not found');
    }

    return this.subscriptionService.activateSubscription(userId, user.email);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(@Req() req: Request) {
    const userId = await this.getUserIdFromRequest(req);

    return this.subscriptionService.cancelSubscription(userId);
  }
}
