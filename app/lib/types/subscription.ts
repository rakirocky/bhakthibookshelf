export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  is_active: boolean;
}

export type SubscriptionPaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface Subscription {
  id: number;
  customer_id: number;
  plan_id: number;
  plan_name: string;
  amount: number;
  payment_status: SubscriptionPaymentStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface AdminSubscriptionRow extends Subscription {
  customer_name: string | null;
  customer_phone: string;
  promoter_name: string | null;
  promoter_code: string | null;
}
