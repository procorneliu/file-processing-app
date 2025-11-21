import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SubscriptionData } from './subscription.types';
import { SubscriptionWebhookHandler } from './subscription.webhook-handler';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  public readonly stripe: Stripe;
  private supabase: SupabaseClient;
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;
  private readonly stripePriceId: string;
  private readonly clientUrl: string;
  private webhookHandler: SubscriptionWebhookHandler;

  constructor(private configService: ConfigService) {
    this.clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');

    this.supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    this.supabaseKey = this.configService.getOrThrow<string>('SUPABASE_KEY');

    const stripeSecretKey =
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY');
    this.stripePriceId =
      this.configService.getOrThrow<string>('STRIPE_PRICE_ID');

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });

    this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.webhookHandler = new SubscriptionWebhookHandler(
      this.stripe,
      this.supabase,
      this.storeSubscriptionData.bind(this),
      this.updateSubscriptionStatus.bind(this),
    );
  }

  // Activate user subscription
  async activateSubscription(userId: string, userEmail: string) {
    try {
      // Check if user already has an active subscription
      const existingSubscription = await this.getUserSubscription(userId);

      if (existingSubscription?.status === 'active') {
        throw new BadRequestException(
          'User already has an active subscription',
        );
      }

      // Create or retrieve Stripe customer
      let customerId = existingSubscription?.stripe_customer_id;

      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: userEmail,
          metadata: {
            userId,
          },
        });
        customerId = customer.id;
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        line_items: [
          {
            price: this.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: `${this.clientUrl}/dashboard?subscription=success`,
        cancel_url: `${this.clientUrl}/dashboard?subscription=cancelled`,
        metadata: {
          userId,
        },
      });

      // Store customer ID in Supabase (subscription will be stored via webhook)
      await this.storeSubscriptionData(userId, {
        stripe_customer_id: customerId,
        status: 'pending',
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      this.logger.error('Error activating subscription:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create subscription');
    }
  }

  // Cancel user subscription
  async cancelSubscription(userId: string) {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (!subscription?.stripe_subscription_id) {
        throw new BadRequestException('No active subscription found');
      }

      // Cancel subscription in Stripe
      await this.stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        },
      );

      // Update status in Supabase
      await this.updateSubscriptionStatus(
        userId,
        subscription.stripe_subscription_id,
        'cancel_at_period_end',
      );

      return {
        message:
          'Subscription will be cancelled at the end of the billing period',
      };
    } catch (error) {
      this.logger.error('Error cancelling subscription:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel subscription');
    }
  }

  // Checking if user has subscription active
  async getUserSubscription(userId: string): Promise<SubscriptionData> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        this.logger.error('Error fetching subscription:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    } catch (error) {
      this.logger.error('Error fetching subscription:', error);
      return null;
    }
  }

  // Add user subscription data in SUPABASE Table
  private async storeSubscriptionData(
    userId: string,
    data: {
      stripe_customer_id: string;
      stripe_subscription_id?: string;
      status: string;
    },
  ) {
    try {
      const { error } = await this.supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: data.stripe_customer_id,
        stripe_subscription_id: data.stripe_subscription_id || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        this.logger.error('Error storing subscription data:', error);
        throw error;
      }
    } catch (error) {
      this.logger.error('Error storing subscription data:', error);
      throw error;
    }
  }

  // Update user subscription status in SUPABASE Table
  private async updateSubscriptionStatus(
    userId: string,
    subscriptionId: string,
    status: string,
  ) {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('stripe_subscription_id', subscriptionId);

      if (error) {
        this.logger.error('Error updating subscription status:', error);
        throw error;
      }
    } catch (error) {
      this.logger.error('Error updating subscription status:', error);
      throw error;
    }
  }

  // Get user subscription plan status
  async getSubscriptionStatus(userId: string): Promise<'free' | 'pro'> {
    const subscription = await this.getUserSubscription(userId);

    if (
      subscription &&
      (subscription.status === 'active' || subscription.status === 'trialing')
    ) {
      return 'pro';
    }

    return 'free';
  }

  // Handle Stripe webhook events
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    return this.webhookHandler.handleWebhookEvent(event);
  }
}
