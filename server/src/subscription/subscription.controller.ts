import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { AuthService } from '../auth/auth.service';
import Stripe from 'stripe';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('subscription')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest) {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      throw new UnauthorizedException('Missing Stripe signature');
    }

    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!req.rawBody) {
      throw new UnauthorizedException('Missing raw body');
    }

    let event: Stripe.Event;

    try {
      event = this.subscriptionService.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new UnauthorizedException('Invalid signature');
    }

    await this.subscriptionService.handleWebhookEvent(event);

    return { received: true };
  }
}
