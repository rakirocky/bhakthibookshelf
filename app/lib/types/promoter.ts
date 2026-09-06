export interface Promoter {
  id: number;
  name: string;
  code: string;
  contact_phone: string | null;
  contact_email: string | null;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface PromoterWithStats extends Promoter {
  paid_order_count: number;
  paid_order_revenue: number;
  paid_subscription_count: number;
  paid_subscription_revenue: number;
  paid_revenue: number;
  commission_owed: number;
}

export interface CreatePromoterRequest {
  name: string;
  code: string;
  contact_phone?: string;
  contact_email?: string;
  commission_rate?: number;
}
