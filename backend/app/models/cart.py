import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Numeric, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.config.database import Base


class Cart(Base):
    __tablename__ = "carts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=True)
    session_id = Column(String(255), unique=True, nullable=True, index=True)  # For guest users

    # Cart Settings
    currency = Column(String(3), default="USD")
    coupon_code = Column(String(50), nullable=True)
    coupon_discount = Column(Numeric(10, 2), default=0)

    # Calculated totals (updated on cart changes)
    subtotal = Column(Numeric(12, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    shipping_estimate = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(12, 2), default=0)

    # Metadata
    item_count = Column(Integer, default=0)  # Total quantity of all items
    unique_item_count = Column(Integer, default=0)  # Number of unique products

    # Shipping estimation
    shipping_country = Column(String(100), nullable=True)
    shipping_postal = Column(String(20), nullable=True)

    # Abandoned cart recovery
    abandoned_email_sent = Column(DateTime, nullable=True)
    recovered_at = Column(DateTime, nullable=True)
    converted_to_order_id = Column(UUID(as_uuid=True), nullable=True)

    # Expiration
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

    def is_expired(self):
        return self.expires_at and self.expires_at < datetime.utcnow()

    def is_guest_cart(self):
        return self.user_id is None

    def touch(self):
        """Update last activity timestamp"""
        self.last_activity_at = datetime.utcnow()
        self.expires_at = datetime.utcnow() + timedelta(days=30)


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cart_id = Column(UUID(as_uuid=True), ForeignKey("carts.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=True)

    # Quantity
    quantity = Column(Integer, default=1, nullable=False)
    max_quantity = Column(Integer, default=99)  # Limit per customer

    # Pricing (snapshot at time of adding/updating)
    unit_price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2), nullable=True)  # Before discount
    total_price = Column(Numeric(12, 2), nullable=False)

    # Product info snapshot
    product_name = Column(String(200), nullable=False)
    product_image = Column(String(500), nullable=True)
    variant_name = Column(String(100), nullable=True)

    # Customizations
    customizations = Column(JSON, nullable=True)

    # Gift options
    is_gift = Column(Boolean, default=False)
    gift_message = Column(String(500), nullable=True)

    # Saved for later
    saved_for_later = Column(Boolean, default=False)

    # Availability
    is_available = Column(Boolean, default=True)
    availability_message = Column(String(255), nullable=True)

    added_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")

    def calculate_total(self):
        return self.unit_price * self.quantity

    def is_in_stock(self):
        if not self.product:
            return False
        if self.variant_id:
            variant = next((v for v in self.product.variants if v.id == self.variant_id), None)
            if variant:
                return variant.stock_quantity >= self.quantity
        return self.product.stock_quantity >= self.quantity
