import { Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  isCheckoutSession,
  isSubscription,
  extractCustomerId,
  extractSubscriptionId,
  extractCustomerIdFromSubscription,
} from './subscription.helpers';

type StoreSubscriptionDataFn = (
  userId: string,
  data: {
    stripe_customer_id: string;
    stripe_subscription_id?: string;
    status: string;
  },
) => Promise<void>;

type UpdateSubscriptionStatusFn = (
  userId: string,
  subscriptionId: string,
  status: string,
) => Promise<void>;

export class SubscriptionWebhookHandler {
  private readonly logger = new Logger(SubscriptionWebhookHandler.name);

  constructor(
    private readonly stripe: Stripe,
    private readonly supabase: SupabaseClient,
    private readonly storeSubscriptionData: StoreSubscriptionDataFn,
    private readonly updateSubscriptionStatus: UpdateSubscriptionStatusFn,
  ) {}

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event);
          break;
        default:
          this.logger.debug(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error('Error handling webhook event:', error);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(
    event: Stripe.Event,
  ): Promise<void> {
    const session = event.data.object;
    if (isCheckoutSession(session)) {
      const customerId = extractCustomerId(session.customer);
      const subscriptionId = extractSubscriptionId(session.subscription);
      const userId = session.metadata?.userId;

      if (!userId || !subscriptionId || !customerId) {
        this.logger.warn(
          'Missing userId, subscriptionId, or customerId in checkout session',
        );
        return;
      }

      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);

      await this.storeSubscriptionData(userId, {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: subscription.status,
      });

      this.logger.log(
        `Subscription activated for user ${userId}: ${subscriptionId}`,
      );
    }
  }

  private async handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object;
    if (isSubscription(subscription)) {
      const customerId = extractCustomerIdFromSubscription(
        subscription.customer,
      );

      if (!customerId) {
        this.logger.warn('Missing customerId in subscription');
        return;
      }

      const { data: subscriptionData } = await this.supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (!subscriptionData) {
        this.logger.warn(`No subscription found for customer ${customerId}`);
        return;
      }

      await this.updateSubscriptionStatus(
        subscriptionData.user_id,
        subscription.id,
        subscription.status,
      );

      this.logger.log(
        `Subscription updated for user ${subscriptionData.user_id}: ${subscription.status}`,
      );
    }
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object;
    if (isSubscription(subscription)) {
      const customerId = extractCustomerIdFromSubscription(
        subscription.customer,
      );

      if (!customerId) {
        this.logger.warn('Missing customerId in subscription');
        return;
      }

      const { data: subscriptionData } = await this.supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (subscriptionData) {
        await this.updateSubscriptionStatus(
          subscriptionData.user_id,
          subscription.id,
          'canceled',
        );

        this.logger.log(
          `Subscription canceled for user ${subscriptionData.user_id}`,
        );
      }
    }
  }
}
