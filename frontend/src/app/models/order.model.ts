export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  variant_name?: string;
  unit_price: number;
  original_price?: number;
  quantity: number;
  total_price: number;
  status: string;
  fulfilled_quantity: number;
  returned_quantity: number;
  tax_rate: number;
  tax_amount: number;
  shipping_cost: number;
  customizations?: { [key: string]: any };
}

export interface Payment {
  id: string;
  payment_method: string;
  provider?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  fee_amount: number;
  card_last_four?: string;
  card_brand?: string;
  processed_at?: string;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  from_status?: string;
  to_status: string;
  reason?: string;
  created_at: string;
  changed_by?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  status_display: string;

  user_id: string;
  seller_id: string;
  seller_name: string;

  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  coupon_discount: number;
  total_amount: number;
  currency: string;

  items: OrderItem[];
  payments: Payment[];
  status_history: OrderStatusHistory[];

  shipping_address: {
    full_name: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };

  shipping_method?: string;
  shipping_carrier?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string;
  estimated_delivery?: string;
  delivered_at?: string;

  customer_notes?: string;
  seller_notes?: string;

  is_gift: boolean;
  gift_message?: string;
  gift_wrap: boolean;

  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancel_reason?: string;

  can_cancel: boolean;
  can_refund: boolean;
  can_track: boolean;
}

export interface OrderCreate {
  shipping_address_id: string;
  shipping_method?: string;
  customer_notes?: string;
  is_gift?: boolean;
  gift_message?: string;
  gift_wrap?: boolean;
  coupon_code?: string;
  payment_method: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'bank_transfer' | 'cash_on_delivery';
}

export interface ShippingAddress {
  full_name: string;
  email?: string;
  phone?: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ShippingRate {
  method: string;
  name: string;
  cost: number;
  estimated_days: number;
  is_express: boolean;
}
