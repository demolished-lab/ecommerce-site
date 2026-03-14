from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import UUID


# ============== Cart Item Schemas ==============
class CartItemCustomization(BaseModel):
    key: str
    value: str
    price_adjustment: Optional[Decimal] = Decimal("0")


class CartItemBase(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = Field(1, ge=1, le=99)


class CartItemCreate(CartItemBase):
    customizations: Optional[List[CartItemCustomization]] = []
    is_gift: bool = False
    gift_message: Optional[str] = Field(None, max_length=500)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=0, le=99)


class CartItemRemove(BaseModel):
    item_id: UUID


class CartItemResponse(BaseModel):
    id: UUID
    cart_id: UUID
    product_id: UUID
    variant_id: Optional[UUID]

    product_name: str
    product_image: Optional[str]
    variant_name: Optional[str]

    quantity: int
    max_quantity: int
    unit_price: Decimal
    original_price: Optional[Decimal]
    total_price: Decimal

    customizations: Optional[List[Dict[str, Any]]]
    is_gift: bool
    gift_message: Optional[str]

    is_available: bool
    availability_message: Optional[str]

    added_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Cart Schemas ==============
class CartShippingEstimate(BaseModel):
    country: str
    postal_code: Optional[str] = None


class CartResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    session_id: Optional[str]

    currency: str
    coupon_code: Optional[str]
    coupon_discount: Decimal

    items: List[CartItemResponse]
    item_count: int
    unique_item_count: int

    subtotal: Decimal
    tax_amount: Decimal
    shipping_estimate: Decimal
    total: Decimal

    shipping_country: Optional[str]
    shipping_postal: Optional[str]

    expires_at: Optional[datetime]
    last_activity_at: datetime

    class Config:
        from_attributes = True


class CartSummary(BaseModel):
    item_count: int
    subtotal: Decimal
    total: Decimal
    currency: str


class CartMergeRequest(BaseModel):
    """Merge guest cart with user cart on login"""

    session_id: str


class CartValidationError(BaseModel):
    item_id: UUID
    product_name: str
    error_type: str  # out_of_stock, price_changed, unavailable
    error_message: str
    available_quantity: Optional[int] = None
    new_price: Optional[Decimal] = None


class CartValidationResponse(BaseModel):
    is_valid: bool
    errors: List[CartValidationError]
    cart: CartResponse


class ApplyCouponRequest(BaseModel):
    coupon_code: str = Field(..., min_length=3, max_length=50)


class ApplyCouponResponse(BaseModel):
    success: bool
    message: str
    coupon_code: Optional[str]
    discount_amount: Decimal
    new_total: Decimal


class SavedForLaterItem(BaseModel):
    """Item saved for later (from cart)"""

    id: UUID
    product_id: UUID
    product_name: str
    product_image: Optional[str]
    unit_price: Decimal
    saved_at: datetime

    class Config:
        from_attributes = True


class MoveToCartRequest(BaseModel):
    """Move saved item back to cart"""

    saved_item_id: UUID
    quantity: int = Field(1, ge=1, le=99)
