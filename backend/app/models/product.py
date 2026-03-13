import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, Integer, Float, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.config.database import Base


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    OUT_OF_STOCK = "out_of_stock"
    SUSPENDED = "suspended"
    DISCONTINUED = "discontinued"


class ProductCondition(str, enum.Enum):
    NEW = "new"
    USED = "used"
    REFURBISHED = "refurbished"
    OPEN_BOX = "open_box"


class Category(Base):
    __tablename__ = "categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)

    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)

    level = Column(Integer, default=0)  # 0 = root, 1 = subcategory, etc.
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    attributes_schema = Column(JSON, default=list)  # [{name, type, required, options}]

    meta_title = Column(String(70), nullable=True)
    meta_description = Column(String(160), nullable=True)
    keywords = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parent = relationship("Category", remote_side=[id], backref="subcategories")
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)

    # Basic Info
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=True)

    # Pricing
    price = Column(Numeric(12, 2), nullable=False)
    compare_at_price = Column(Numeric(12, 2), nullable=True)  # Original price for showing discount
    cost_price = Column(Numeric(12, 2), nullable=True)  # For seller's reference
    currency = Column(String(3), default="USD")

    # Inventory
    sku = Column(String(100), unique=True, nullable=True)
    barcode = Column(String(100), nullable=True)
    stock_quantity = Column(Integer, default=0)
    stock_track_quantity = Column(Boolean, default=True)
    stock_allow_backorders = Column(Boolean, default=False)
    low_stock_threshold = Column(Integer, default=5)

    # Status & Visibility
    status = Column(SQLEnum(ProductStatus), default=ProductStatus.DRAFT, nullable=False)
    condition = Column(SQLEnum(ProductCondition), default=ProductCondition.NEW, nullable=False)
    is_featured = Column(Boolean, default=False)
    is_digital = Column(Boolean, default=False)  # Digital product flag
    weight = Column(Float, nullable=True)  # in kg
    dimensions = Column(JSON, nullable=True)  # {length, width, height} in cm

    # Shipping
    requires_shipping = Column(Boolean, default=True)
    shipping_weight = Column(Float, nullable=True)
    shipping_class = Column(String(50), nullable=True)

    # SEO
    meta_title = Column(String(70), nullable=True)
    meta_description = Column(String(160), nullable=True)
    keywords = Column(String(255), nullable=True)

    # Attributes
    attributes = Column(JSON, default=dict)  # {color: "red", size: "XL", material: "cotton"}
    tags = Column(JSON, default=list)  # ["summer", "sale", "trending"]

    # Statistics
    view_count = Column(Integer, default=0)
    sales_count = Column(Integer, default=0)
    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    # Timestamps
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    seller = relationship("Seller", back_populates="products")
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("ProductReview", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")

    def is_in_stock(self):
        if self.stock_track_quantity:
            return self.stock_quantity > 0 or self.stock_allow_backorders
        return True

    def get_discount_percentage(self):
        if self.compare_at_price and self.compare_at_price > self.price:
            return round(((self.compare_at_price - self.price) / self.compare_at_price) * 100, 2)
        return 0


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)

    variant_name = Column(String(100), nullable=False)  # e.g., "Red / XL"
    sku = Column(String(100), unique=True, nullable=True)
    barcode = Column(String(100), nullable=True)

    # Variant attributes
    options = Column(JSON, nullable=False)  # {color: "red", size: "XL"}

    price_adjustment = Column(Numeric(10, 2), default=0)  # +/- from base price
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    image_url = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="variants")

    def get_price(self):
        return self.product.price + self.price_adjustment if self.product else self.price_adjustment


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)

    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    medium_url = Column(String(500), nullable=True)
    large_url = Column(String(500), nullable=True)

    alt_text = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)

    file_size = Column(Integer, nullable=True)  # in bytes
    dimensions = Column(JSON, nullable=True)  # {width, height}

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="images")


class ProductReview(Base):
    __tablename__ = "product_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)  # Verified purchase

    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String(200), nullable=True)
    review_text = Column(Text, nullable=True)

    # Additional ratings
    value_for_money = Column(Integer, nullable=True)
    quality = Column(Integer, nullable=True)
    shipping = Column(Integer, nullable=True)

    is_verified_purchase = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)  # Moderation
    helpful_count = Column(Integer, default=0)

    images = Column(JSON, default=list)  # Review images

    seller_response = Column(Text, nullable=True)
    seller_response_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
