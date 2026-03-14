export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: { field?: string; message: string; code?: string }[];
  timestamp: string;
}

export interface FilterParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
}

export interface DashboardMetric {
  label: string;
  value: number;
  change?: number;
  change_label?: string;
  icon?: string;
  color?: string;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  is_read: boolean;
  created_at: string;
}
