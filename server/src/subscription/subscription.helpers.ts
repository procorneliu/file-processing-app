import Stripe from 'stripe';

export function isCheckoutSession(
  obj: Stripe.Event.Data.Object,
): obj is Stripe.Checkout.Session {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'object' in obj &&
    obj.object === 'checkout.session'
  );
}

export function isSubscription(
  obj: Stripe.Event.Data.Object,
): obj is Stripe.Subscription {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'object' in obj &&
    obj.object === 'subscription'
  );
}

export function extractCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) {
    return null;
  }
  if (typeof customer === 'string') {
    return customer;
  }
  if ('id' in customer) {
    return customer.id;
  }
  return null;
}

export function extractSubscriptionId(
  subscription: string | Stripe.Subscription | null,
): string | null {
  if (!subscription) {
    return null;
  }
  if (typeof subscription === 'string') {
    return subscription;
  }
  if ('id' in subscription) {
    return subscription.id;
  }
  return null;
}

export function extractCustomerIdFromSubscription(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
): string | null {
  if (typeof customer === 'string') {
    return customer;
  }
  if ('id' in customer) {
    return customer.id;
  }
  return null;
}
