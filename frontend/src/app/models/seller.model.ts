export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  store_description?: string;
  store_logo?: string;
  store_banner?: string;
  business_name: string;
  business_type: string;
  business_email: string;
  business_phone: string;
  address_city: string;
  address_state: string;
  address_country: string;
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "active"
    | "suspended"
    | "rejected"
    | "deactivated";
  tier: "bronze" | "silver" | "gold" | "platinum";
  commission_rate: number;
  is_verified: boolean;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  review_count: number;
  created_at: string;
}

export interface SellerApplication {
  store_name: string;
  store_description?: string;
  business_name: string;
  business_type: string;
  business_registration_number?: string;
  tax_id?: string;
  vat_number?: string;
  business_email: string;
  business_phone: string;
  support_email?: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal: string;
  address_country: string;
  return_policy?: string;
  shipping_policy?: string;
  processing_time_days: number;
}

export interface SellerDashboardStats {
  total_products: number;
  active_products: number;
  out_of_stock_products: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  revenue_this_month: number;
  revenue_last_month: number;
  revenue_change_percent: number;
  total_customers: number;
  repeat_customers: number;
  average_order_value: number;
  average_rating: number;
  review_count: number;
}
