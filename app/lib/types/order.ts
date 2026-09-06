export interface OrderItem {

    book_id:number;

    quantity:number;

    price:number;

}

export type OrderStatus =
  | "CREATED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export const ORDER_STATUSES: OrderStatus[] = [
  "CREATED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export interface AdminOrderSummary {
  id: number;
  order_number: string;
  customer_name: string;
  email: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface AdminOrderItem {
  id: number;
  book_id: number;
  book_title: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gst_number: string | null;
  payment_method: string | null;
  items: AdminOrderItem[];
}

export interface CreateOrderRequest {

    customer_name:string;

    email:string;

    mobile:string;

    address:string;

    city:string;

    state:string;

    pincode:string;

    country:string;

    gst_number?:string;

    total_amount:number;

    items:OrderItem[];

}
