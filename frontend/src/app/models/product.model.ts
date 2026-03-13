export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  subcategories?: Category[];
}

export interface ProductImage {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  medium_url?: string;
  large_url?: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  variant_name: string;
  sku?: string;
  options: { [key: string]: string };
  price_adjustment: number;
  stock_quantity: number;
  is_active: boolean;
  image_url?: string;
}

export interface ProductReview {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  images: string[];
  seller_response?: string;
  seller_response_at?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  stock_quantity: number;
  status: 'draft' | 'pending' | 'active' | 'out_of_stock' | 'suspended' | 'discontinued';
  condition: 'new' | 'used' | 'refurbished' | 'open_box';
  is_featured: boolean;
  is_digital: boolean;
  weight?: number;
  dimensions?: { length?: number; width?: number; height?: number };
  requires_shipping: boolean;
  view_count: number;
  sales_count: number;
  average_rating: number;
  review_count: number;
  attributes: { [key: string]: any };
  tags: string[];

  seller_id: string;
  seller_name: string;
  seller_slug: string;
  seller_logo?: string;
  seller_rating: number;

  category_id: string;
  category_name: string;

  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview[];

  created_at: string;
  updated_at: string;

  // Computed
  is_in_stock: boolean;
  discount_percentage: number;
}

export interface ProductCreate {
  title: string;
  description: string;
  short_description?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  category_id: string;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  condition: string;
  is_digital: boolean;
  weight?: number;
  requires_shipping: boolean;
  meta_title?: string;
  meta_description?: string;
  attributes?: { [key: string]: any };
  tags?: string[];
}

export interface ProductFilters {
  category_id?: string;
  seller_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: string;
  in_stock?: boolean;
  is_featured?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
