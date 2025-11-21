export type SubscriptionData = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string | null;
  updated_at: string | null;
} | null;
