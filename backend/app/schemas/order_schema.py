from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import UUID

from app.models.order import OrderStatus, PaymentMethod, PaymentStatus


# ============== Order Item Schemas ==============
class OrderItemCustomization(BaseModel):
    key: str
    value: str


class OrderItemResponse(BaseModel):
    id: UUID
    order_id: UUID
    product_id: UUID
    variant_id: Optional[UUID]

    product_name: str
    product_sku: Optional[str]
    product_image: Optional[str]
    variant_name: Optional[str]

    unit_price: Decimal
    original_price: Optional[Decimal]
    quantity: int
    total_price: Decimal

    status: OrderStatus
    fulfilled_quantity: int
    returned_quantity: int

    tax_rate: float
    tax_amount: Decimal
    shipping_cost: Decimal

    customizations: Optional[List[Dict[str, Any]]]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Payment Schemas ==============
class PaymentResponse(BaseModel):
    id: UUID
    order_id: UUID
    payment_method: PaymentMethod
    provider: Optional[str]
    status: PaymentStatus
    amount: Decimal
    currency: str
    fee_amount: Decimal
    card_last_four: Optional[str]
    card_brand: Optional[str]
    processed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    payment_method: PaymentMethod
    payment_token: Optional[str] = None  # Stripe token, PayPal nonce, etc.
    save_payment_method: bool = False


class PaymentIntentResponse(BaseModel):
    """For payment providers that require client-side confirmation"""
    client_secret: str
    publishable_key: str
    payment_intent_id: str
    amount: Decimal
    currency: str


class RefundRequest(BaseModel):
    amount: Optional[Decimal] = None  # None = full refund
    reason: str
    items: Optional[List[UUID]] = None  # Specific items to refund


class RefundResponse(BaseModel):
    refund_id: UUID
    amount: Decimal
    status: str
    processed_at: datetime


# ============== Order Status History ==============
class OrderStatusHistoryResponse(BaseModel):
    id: UUID
    from_status: Optional[OrderStatus]
    to_status: OrderStatus
    reason: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    changed_by: Optional[UUID]

    class Config:
        from_attributes = True


# ============== Shipping Address ==============
class ShippingAddress(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    street_address: str = Field(..., min_length=5, max_length=255)
    apartment: Optional[str] = Field(None, max_length=50)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    country: str = Field(default="USA")


# ============== Order Create ==============
class OrderCreate(BaseModel):
    shipping_address_id: UUID
    shipping_method: Optional[str] = None
    customer_notes: Optional[str] = None
    is_gift: bool = False
    gift_message: Optional[str] = Field(None, max_length=500)
    gift_wrap: bool = False
    coupon_code: Optional[str] = None

    payment_method: PaymentMethod
    save_address: bool = False

    # For new address
    shipping_address: Optional[ShippingAddress] = None


class OrderCreateGuest(BaseModel):
    """Order creation for guest checkout"""
    email: str
    shipping_address: ShippingAddress
    shipping_method: Optional[str] = None
    customer_notes: Optional[str] = None
    is_gift: bool = False
    gift_message: Optional[str] = None
    gift_wrap: bool = False
    coupon_code: Optional[str] = None
    payment_method: PaymentMethod


# ============== Order Response ==============
class OrderSummaryResponse(BaseModel):
    """Minimal order info for lists"""
    id: UUID
    order_number: str
    status: OrderStatus
    total_amount: Decimal
    currency: str
    item_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class OrderDetailResponse(BaseModel):
    id: UUID
    order_number: str

    status: OrderStatus
    status_display: str

    user_id: UUID
    seller_id: UUID
    seller_name: str

    subtotal: Decimal
    shipping_cost: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    coupon_discount: Decimal
    total_amount: Decimal
    currency: str

    items: List[OrderItemResponse]
    payments: List[PaymentResponse]
    status_history: List[OrderStatusHistoryResponse]

    shipping_address: Dict[str, Any]
    shipping_method: Optional[str]
    shipping_carrier: Optional[str]
    tracking_number: Optional[str]
    tracking_url: Optional[str]
    shipped_at: Optional[datetime]
    estimated_delivery: Optional[datetime]
    delivered_at: Optional[datetime]

    customer_notes: Optional[str]
    seller_notes: Optional[str]
    is_gift: bool
    gift_message: Optional[str]
    gift_wrap: bool

    created_at: datetime
    updated_at: datetime
    cancelled_at: Optional[datetime]
    cancel_reason: Optional[str]
    completed_at: Optional[datetime]

    can_cancel: bool
    can_refund: bool
    can_track: bool

    class Config:
        from_attributes = True


# ============== Order Update ==============
class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    reason: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None

    @validator('status')
    def validate_status_transition(cls, v, values):
        # Could add validation for valid transitions
        return v


class OrderTrackingUpdate(BaseModel):
    shipping_carrier: str
    tracking_number: str
    tracking_url: Optional[str] = None


# ============== Order Filters ==============
class OrderFilters(BaseModel):
    status: Optional[OrderStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search: Optional[str] = None  # Order number, product name
    sort_by: str = "created_at"
    sort_order: str = "desc"


class SellerOrderFilters(OrderFilters):
    """Additional filters for seller orders"""
    payment_status: Optional[PaymentStatus] = None


# ============== Order Statistics ==============
class OrderStatistics(BaseModel):
    total_orders: int
    total_revenue: Decimal
    average_order_value: Decimal
    orders_by_status: Dict[str, int]
    revenue_by_month: List[Dict[str, Any]]


class SalesReport(BaseModel):
    period: str
    total_sales: Decimal
    total_orders: int
    total_items: int
    average_order_value: Decimal
    commission_earned: Decimal
    net_sales: Decimal
    daily_breakdown: List[Dict[str, Any]]


# ============== Shipping Estimate ==============
class ShippingEstimateRequest(BaseModel):
    shipping_country: str
    shipping_postal: Optional[str] = None
    items: Optional[List[UUID]] = None  # Specific cart items, None = all


class ShippingRate(BaseModel):
    method: str
    name: str
    cost: Decimal
    estimated_days: int
    is_express: bool


class ShippingEstimateResponse(BaseModel):
    rates: List[ShippingRate]
    selected_method: Optional[str]
    shipping_cost: Decimal
