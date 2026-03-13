from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import UUID

from app.models.product import ProductStatus, ProductCondition


# ============== Category Schemas ==============
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    parent_id: Optional[UUID] = None
    icon: Optional[str] = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    attributes_schema: Optional[List[Dict[str, Any]]] = []
    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    keywords: Optional[str] = Field(None, max_length=255)


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    parent_id: Optional[UUID] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: UUID
    slug: str
    image_url: Optional[str]
    level: int
    is_active: bool
    is_featured: bool
    subcategories: List['CategoryResponse'] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryTreeResponse(CategoryResponse):
    subcategories: List['CategoryTreeResponse'] = []


# ============== Product Image Schemas ==============
class ProductImageBase(BaseModel):
    alt_text: Optional[str] = Field(None, max_length=255)
    sort_order: int = 0
    is_primary: bool = False


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageResponse(ProductImageBase):
    id: UUID
    product_id: UUID
    image_url: str
    thumbnail_url: Optional[str]
    medium_url: Optional[str]
    large_url: Optional[str]
    dimensions: Optional[Dict[str, int]]
    uploaded_at: datetime

    class Config:
        from_attributes = True


# ============== Product Variant Schemas ==============
class ProductVariantBase(BaseModel):
    variant_name: str = Field(..., min_length=1, max_length=100)
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    options: Dict[str, str]  # {color: "red", size: "XL"}
    price_adjustment: Decimal = Field(0)
    stock_quantity: int = Field(0, ge=0)
    is_active: bool = True


class ProductVariantCreate(ProductVariantBase):
    image_url: Optional[str] = None


class ProductVariantUpdate(BaseModel):
    variant_name: Optional[str] = Field(None, max_length=100)
    sku: Optional[str] = Field(None, max_length=100)
    price_adjustment: Optional[Decimal] = Field(None)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    image_url: Optional[str] = None


class ProductVariantResponse(ProductVariantBase):
    id: UUID
    product_id: UUID
    image_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Product Review Schemas ==============
class ProductReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    review_text: Optional[str] = None
    value_for_money: Optional[int] = Field(None, ge=1, le=5)
    quality: Optional[int] = Field(None, ge=1, le=5)
    shipping: Optional[int] = Field(None, ge=1, le=5)


class ProductReviewCreate(ProductReviewBase):
    order_id: Optional[UUID] = None
    images: Optional[List[str]] = []


class ProductReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=200)
    review_text: Optional[str] = None


class ProductReviewResponse(ProductReviewBase):
    id: UUID
    product_id: UUID
    user_id: UUID
    order_id: Optional[UUID]
    user_name: str
    user_avatar: Optional[str]
    is_verified_purchase: bool
    is_approved: bool
    helpful_count: int
    images: List[str]
    seller_response: Optional[str]
    seller_response_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== Product Schemas ==============
class ProductDimensions(BaseModel):
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    weight: Optional[float] = None


class ProductBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    short_description: Optional[str] = Field(None, max_length=500)
    price: Decimal = Field(..., gt=0)
    compare_at_price: Optional[Decimal] = Field(None)
    cost_price: Optional[Decimal] = Field(None)
    category_id: UUID


class ProductCreate(ProductBase):
    sku: Optional[str] = Field(None, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    stock_quantity: int = Field(0, ge=0)
    stock_track_quantity: bool = True
    stock_allow_backorders: bool = False
    low_stock_threshold: int = 5

    condition: ProductCondition = ProductCondition.NEW
    is_digital: bool = False
    weight: Optional[float] = None
    dimensions: Optional[ProductDimensions] = None

    requires_shipping: bool = True
    shipping_weight: Optional[float] = None
    shipping_class: Optional[str] = None

    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    keywords: Optional[str] = Field(None, max_length=255)

    attributes: Optional[Dict[str, Any]] = {}
    tags: Optional[List[str]] = []

    variants: Optional[List[ProductVariantCreate]] = []


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    price: Optional[Decimal] = Field(None, gt=0)
    compare_at_price: Optional[Decimal] = Field(None)
    category_id: Optional[UUID] = None

    stock_quantity: Optional[int] = Field(None, ge=0)
    stock_track_quantity: Optional[bool] = None
    stock_allow_backorders: Optional[bool] = None
    low_stock_threshold: Optional[int] = None

    status: Optional[ProductStatus] = None
    condition: Optional[ProductCondition] = None
    is_featured: Optional[bool] = None
    weight: Optional[float] = None
    dimensions: Optional[ProductDimensions] = None

    requires_shipping: Optional[bool] = None
    shipping_weight: Optional[float] = None

    meta_title: Optional[str] = Field(None, max_length=70)
    meta_description: Optional[str] = Field(None, max_length=160)
    keywords: Optional[str] = Field(None, max_length=255)

    attributes: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None


class ProductListItem(BaseModel):
    id: UUID
    title: str
    slug: str
    price: Decimal
    compare_at_price: Optional[Decimal]
    currency: str
    stock_quantity: int
    status: ProductStatus
    is_featured: bool
    primary_image: Optional[str]
    category_name: str
    seller_id: UUID
    seller_name: str
    average_rating: float
    review_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductDetailResponse(ProductBase):
    id: UUID
    slug: str
    seller_id: UUID
    seller_name: str
    seller_slug: str
    seller_logo: Optional[str]
    seller_rating: float

    sku: Optional[str]
    barcode: Optional[str]
    stock_quantity: int
    stock_track_quantity: bool
    stock_allow_backorders: bool
    is_in_stock: bool

    status: ProductStatus
    condition: ProductCondition
    is_featured: bool
    is_digital: bool
    weight: Optional[float]
    dimensions: Optional[Dict[str, Any]]

    requires_shipping: bool
    shipping_weight: Optional[float]
    shipping_class: Optional[str]

    view_count: int
    sales_count: int
    average_rating: float
    review_count: int

    attributes: Dict[str, Any]
    tags: List[str]

    images: List[ProductImageResponse]
    variants: List[ProductVariantResponse]
    reviews: List[ProductReviewResponse]

    meta_title: Optional[str]
    meta_description: Optional[str]
    keywords: Optional[str]

    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    discount_percentage: float

    class Config:
        from_attributes = True


class ProductFilters(BaseModel):
    category_id: Optional[UUID] = None
    seller_id: Optional[UUID] = None
    status: Optional[ProductStatus] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    condition: Optional[ProductCondition] = None
    is_featured: Optional[bool] = None
    in_stock: Optional[bool] = None
    search: Optional[str] = None
    tags: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    sort_by: str = "created_at"  # created_at, price, popularity, rating
    sort_order: str = "desc"


class ProductSearchResult(BaseModel):
    id: UUID
    title: str
    slug: str
    price: Decimal
    primary_image: Optional[str]
    category_name: str
    seller_name: str
    relevance_score: float
