import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { SubscriptionService } from '../subscription.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private subcriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies?.access_token;

    if (!accessToken) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.authService.getCurrentUser(accessToken);

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const subsciptionStatus =
      await this.subcriptionService.getSubscriptionStatus(user.id);

    if (subsciptionStatus !== 'pro') {
      throw new ForbiddenException(
        'This feature requires a Pro subscription. Please upgrade to continue.',
      );
    }

    return true;
  }
}
