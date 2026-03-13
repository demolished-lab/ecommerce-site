import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, Integer, Float, Numeric, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.config.database import Base


class OrderStatus(str, enum.Enum):
    # Initial states
    CREATED = "created"
    PENDING_PAYMENT = "pending_payment"
    PAYMENT_FAILED = "payment_failed"

    # Processing states
    PAYMENT_COMPLETED = "payment_completed"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    READY_TO_SHIP = "ready_to_ship"

    # Shipping states
    SHIPPED = "shipped"
    IN_TRANSIT = "in_transit"
    OUT_FOR_DELIVERY = "out_for_delivery"

    # Final states
    DELIVERED = "delivered"
    COMPLETED = "completed"

    # Exception states
    CANCELLED = "cancelled"
    REFUND_REQUESTED = "refund_requested"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    DISPUTED = "disputed"
    RETURNED = "returned"


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    BANK_TRANSFER = "bank_transfer"
    CASH_ON_DELIVERY = "cash_on_delivery"
    CRYPTOCURRENCY = "cryptocurrency"
    GIFT_CARD = "gift_card"
    STORE_CREDIT = "store_credit"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    CANCELLED = "cancelled"


class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(50), unique=True, nullable=False, index=True)

    # Relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=False)
    shipping_address_id = Column(UUID(as_uuid=True), ForeignKey("user_addresses.id"), nullable=False)

    # Order Status
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.CREATED, nullable=False)
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")

    # Pricing Breakdown
    subtotal = Column(Numeric(12, 2), nullable=False)  # Sum of items
    shipping_cost = Column(Numeric(10, 2), default=0)
    tax_amount = Column(Numeric(10, 2), default=0)
    discount_amount = Column(Numeric(10, 2), default=0)
    coupon_code = Column(String(50), nullable=True)
    coupon_discount = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD")

    # Shipping Information
    shipping_method = Column(String(100), nullable=True)
    shipping_carrier = Column(String(100), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    tracking_url = Column(String(500), nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)

    # Billing Information (snapshot at time of order)
    billing_name = Column(String(200), nullable=True)
    billing_email = Column(String(255), nullable=True)
    billing_phone = Column(String(20), nullable=True)
    billing_address = Column(JSON, nullable=True)

    # Shipping Address Snapshot
    shipping_name = Column(String(200), nullable=True)
    shipping_address = Column(JSON, nullable=True)

    # Notes
    customer_notes = Column(Text, nullable=True)
    seller_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)

    # Gift Options
    is_gift = Column(Boolean, default=False)
    gift_message = Column(Text, nullable=True)
    gift_wrap = Column(Boolean, default=False)

    # IP & Device info for fraud detection
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cancelled_at = Column(DateTime, nullable=True)
    cancel_reason = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="orders")
    seller = relationship("Seller", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

    def can_cancel(self):
        return self.status in [
            OrderStatus.CREATED,
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.PAYMENT_COMPLETED,
            OrderStatus.CONFIRMED
        ]

    def can_refund(self):
        return self.status in [
            OrderStatus.PAYMENT_COMPLETED,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED
        ]

    def get_total_items(self):
        return sum(item.quantity for item in self.items)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=True)

    # Product Snapshot (in case product changes after order)
    product_name = Column(String(200), nullable=False)
    product_sku = Column(String(100), nullable=True)
    product_image = Column(String(500), nullable=True)
    variant_name = Column(String(100), nullable=True)

    # Pricing
    unit_price = Column(Numeric(10, 2), nullable=False)  # Price at time of order
    original_price = Column(Numeric(10, 2), nullable=True)  # For showing savings
    quantity = Column(Integer, nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)

    # Item Status
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.CREATED)
    fulfilled_quantity = Column(Integer, default=0)
    returned_quantity = Column(Integer, default=0)

    # Tax
    tax_rate = Column(Float, default=0)
    tax_amount = Column(Numeric(10, 2), default=0)

    # Shipping
    shipping_cost = Column(Numeric(10, 2), default=0)
    weight = Column(Float, nullable=True)

    # Customizations
    customizations = Column(JSON, nullable=True)  # {engraving: "John", color: "red"}

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)

    from_status = Column(SQLEnum(OrderStatus), nullable=True)
    to_status = Column(SQLEnum(OrderStatus), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason = Column(Text, nullable=True)

    context = Column(JSON, default=dict)  # Additional context

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="status_history")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)

    # Payment Info
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_provider = Column(String(50), nullable=True)  # stripe, paypal, etc.
    provider_payment_id = Column(String(255), nullable=True)  # External payment ID
    provider_charge_id = Column(String(255), nullable=True)

    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING)

    # Amounts
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default="USD")
    fee_amount = Column(Numeric(10, 2), default=0)  # Payment processor fee
    net_amount = Column(Numeric(12, 2), nullable=True)

    # Card Info (masked)
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(50), nullable=True)

    # Billing Details
    billing_name = Column(String(200), nullable=True)
    billing_email = Column(String(255), nullable=True)

    # Error Info
    error_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)

    # Refund Info
    refunded_amount = Column(Numeric(12, 2), default=0)
    refund_reason = Column(Text, nullable=True)

    # Timestamps
    processed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Raw response from provider (for debugging)
    raw_response = Column(JSON, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="payments")

    def is_successful(self):
        return self.status == PaymentStatus.COMPLETED

    def get_remaining_refund_amount(self):
        return self.amount - self.refunded_amount
