export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  delivery_instructions?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
