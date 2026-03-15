export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  quantity: number;
  max_quantity: number;
  unit_price: number;
  original_price?: number;
  total_price: number;
  customizations?: { [key: string]: any };
  is_gift: boolean;
  gift_message?: string;
  is_available: boolean;
  availability_message?: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  currency: string;
  coupon_code?: string;
  coupon_discount: number;
  items: CartItem[];
  item_count: number;
  unique_item_count: number;
  subtotal: number;
  tax_amount: number;
  shipping_estimate: number;
  total: number;
  shipping_country?: string;
  shipping_postal?: string;
}

export interface CartAddItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  product_name?: string;
  product_image?: string;
  unit_price?: number;
  customizations?: { key: string; value: string; price_adjustment?: number }[];
  is_gift?: boolean;
  gift_message?: string;
}

export interface CartUpdateItem {
  item_id: string;
  quantity: number;
}

export interface CouponApply {
  coupon_code: string;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  coupon_code?: string;
  discount_amount: number;
  new_total: number;
}
