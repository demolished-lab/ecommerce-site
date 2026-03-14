from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
import re

from app.models.seller import SellerStatus, SellerTier


# ============== Seller Document Schemas ==============
class SellerDocumentBase(BaseModel):
    document_type: str
    document_name: str
    expires_at: Optional[datetime] = None


class SellerDocumentResponse(SellerDocumentBase):
    id: UUID
    seller_id: UUID
    file_url: str
    file_size: Optional[int]
    mime_type: Optional[str]
    is_verified: bool
    verified_at: Optional[datetime]
    rejection_reason: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ============== Seller Schemas ==============
class SocialLinks(BaseModel):
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None


class SellerBase(BaseModel):
    store_name: str = Field(..., min_length=3, max_length=150)
    store_description: Optional[str] = Field(None, max_length=5000)
    business_name: str = Field(..., min_length=2, max_length=200)
    business_type: str = Field(
        ...,
        pattern="^(LLC|Corporation|Sole Proprietorship|Partnership|Non-Profit|Other)$",
    )


class SellerCreate(BaseModel):
    store_name: str = Field(..., min_length=3, max_length=150)
    store_description: Optional[str] = Field(None, max_length=5000)
    business_name: str = Field(..., min_length=2, max_length=200)
    business_type: str = Field(..., min_length=2, max_length=50)
    business_registration_number: Optional[str] = Field(None, max_length=100)
    tax_id: Optional[str] = Field(None, max_length=50)
    vat_number: Optional[str] = Field(None, max_length=50)

    business_email: EmailStr
    business_phone: str = Field(..., min_length=10, max_length=20)
    support_email: Optional[EmailStr] = None

    address_street: str = Field(..., min_length=5, max_length=255)
    address_city: str = Field(..., min_length=2, max_length=100)
    address_state: str = Field(..., min_length=2, max_length=100)
    address_postal: str = Field(..., min_length=3, max_length=20)
    address_country: str = "USA"

    return_policy: Optional[str] = None
    shipping_policy: Optional[str] = None
    processing_time_days: int = Field(1, ge=0, le=30)

    social_links: Optional[SocialLinks] = None

    @validator("store_name")
    def validate_store_name(cls, v):
        if not re.match(r'^[\w\s\-&\'"\.]{3,150}$', v):
            raise ValueError("Store name contains invalid characters")
        return v.strip()


class SellerUpdate(BaseModel):
    store_description: Optional[str] = Field(None, max_length=5000)
    store_logo: Optional[str] = None
    store_banner: Optional[str] = None

    business_email: Optional[EmailStr] = None
    business_phone: Optional[str] = Field(None, min_length=10, max_length=20)
    support_email: Optional[EmailStr] = None

    address_street: Optional[str] = Field(None, min_length=5, max_length=255)
    address_city: Optional[str] = Field(None, min_length=2, max_length=100)
    address_state: Optional[str] = Field(None, min_length=2, max_length=100)
    address_postal: Optional[str] = Field(None, min_length=3, max_length=20)

    return_policy: Optional[str] = None
    shipping_policy: Optional[str] = None
    processing_time_days: Optional[int] = Field(None, ge=0, le=30)

    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    social_links: Optional[SocialLinks] = None


class SellerResponse(BaseModel):
    id: UUID
    user_id: UUID

    store_name: str
    store_slug: str
    store_description: Optional[str]
    store_logo: Optional[str]
    store_banner: Optional[str]

    business_name: str
    business_type: str
    business_email: str
    business_phone: str

    address_city: str
    address_state: str
    address_country: str

    status: SellerStatus
    tier: SellerTier
    commission_rate: float
    is_verified: bool
    verified_at: Optional[datetime]

    total_products: int
    total_orders: int
    total_revenue: float
    average_rating: float
    review_count: int

    return_policy: Optional[str]
    shipping_policy: Optional[str]
    processing_time_days: int

    social_links: Optional[Dict[str, Any]]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SellerPublicProfile(BaseModel):
    """Public seller profile shown to buyers"""

    id: UUID
    store_name: str
    store_slug: str
    store_description: Optional[str]
    store_logo: Optional[str]
    store_banner: Optional[str]

    business_name: str
    business_type: str

    address_city: str
    address_state: str
    address_country: str

    is_verified: bool
    tier: SellerTier

    total_products: int
    total_orders: int
    average_rating: float
    review_count: int

    return_policy: Optional[str]
    shipping_policy: Optional[str]
    processing_time_days: int

    social_links: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class SellerDetailResponse(SellerResponse):
    documents: List[SellerDocumentResponse] = []


class SellerDashboardStats(BaseModel):
    total_products: int
    active_products: int
    out_of_stock_products: int

    total_orders: int
    pending_orders: int
    processing_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int

    total_revenue: float
    revenue_this_month: float
    revenue_last_month: float
    revenue_change_percent: float

    total_customers: int
    repeat_customers: int

    average_order_value: float
    average_rating: float
    review_count: int


class SellerSalesReport(BaseModel):
    period: str
    total_sales: float
    total_orders: int
    total_items: int
    average_order_value: float
    commission_paid: float
    net_revenue: float

    daily_breakdown: List[Dict[str, Any]]
    top_products: List[Dict[str, Any]]
    top_categories: List[Dict[str, Any]]


# ============== Admin Seller Management ==============
class SellerAdminUpdate(BaseModel):
    status: Optional[SellerStatus] = None
    tier: Optional[SellerTier] = None
    commission_rate: Optional[float] = Field(None, ge=0, le=1)
    is_verified: Optional[bool] = None


class SellerReviewRequest(BaseModel):
    action: str  # approve, reject, request_info
    reason: Optional[str] = None
    notes: Optional[str] = None


class SellerFilters(BaseModel):
    status: Optional[SellerStatus] = None
    tier: Optional[SellerTier] = None
    is_verified: Optional[bool] = None
    search: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
