export interface StoreSettings {
  id: number;
  store_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  gst_number: string | null;
  /** Show prices/cart/buy inside the Android app (see migration 025). */
  app_commerce_enabled: boolean;
  updated_at: string;
}

export interface UpdateSettingsRequest {
  store_name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  gst_number?: string;
}
