import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.config.database import Base


class AdminLogAction(str, enum.Enum):
    # User actions
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_SUSPENDED = "user_suspended"
    USER_REACTIVATED = "user_reactivated"

    # Seller actions
    SELLER_APPROVED = "seller_approved"
    SELLER_REJECTED = "seller_rejected"
    SELLER_SUSPENDED = "seller_suspended"
    SELLER_DEACTIVATED = "seller_deactivated"
    SELLER_TIER_CHANGED = "seller_tier_changed"
    SELLER_COMMISSION_CHANGED = "seller_commission_changed"

    # Product actions
    PRODUCT_APPROVED = "product_approved"
    PRODUCT_REJECTED = "product_rejected"
    PRODUCT_SUSPENDED = "product_suspended"
    PRODUCT_FEATURED = "product_featured"

    # Order actions
    ORDER_STATUS_CHANGED = "order_status_changed"
    ORDER_CANCELLED = "order_cancelled"
    ORDER_REFUNDED = "order_refunded"

    # Dispute actions
    DISPUTE_OPENED = "dispute_opened"
    DISPUTE_RESOLVED = "dispute_resolved"
    DISPUTE_ESCALATED = "dispute_escalated"

    # System actions
    SETTING_UPDATED = "setting_updated"
    CATEGORY_CREATED = "category_created"
    CATEGORY_UPDATED = "category_updated"
    CATEGORY_DELETED = "category_deleted"

    # Security actions
    LOGIN_FAILED = "login_failed"
    PASSWORD_RESET = "password_reset"
    PERMISSION_CHANGED = "permission_changed"


class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    action = Column(SQLEnum(AdminLogAction), nullable=False)
    entity_type = Column(String(50), nullable=False)  # user, seller, product, order, etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False)

    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)

    # IP & Device
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Index for faster querying
    # (default btree index is used automatically by most columns)
    # __table_args__ purposely left empty


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    data_type = Column(String(20), default="string")  # string, integer, float, boolean, json

    # Metadata
    description = Column(Text, nullable=True)
    category = Column(String(50), default="general")  # general, payment, shipping, email, security
    is_editable = Column(Boolean, default=True)
    is_secret = Column(Boolean, default=False)  # Mask in UI

    updated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def typed_value(self):
        """Convert stored value to proper type"""
        if self.data_type == "boolean":
            return self.value.lower() == "true"
        elif self.data_type == "integer":
            return int(self.value) if self.value else 0
        elif self.data_type == "float":
            return float(self.value) if self.value else 0.0
        elif self.data_type == "json":
            import json
            return json.loads(self.value) if self.value else {}
        return self.value


class DisputeStatus(str, enum.Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    WAITING_SELLER = "waiting_seller"
    WAITING_BUYER = "waiting_buyer"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    CLOSED = "closed"


class DisputeResolution(str, enum.Enum):
    PENDING = "pending"
    BUYER_FAVOR = "buyer_favor"
    SELLER_FAVOR = "seller_favor"
    SPLIT = "split"
    REFUNDED = "refunded"
    REPLACEMENT = "replacement"
    NO_ACTION = "no_action"


class DisputePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dispute_number = Column(String(50), unique=True, nullable=False)

    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id"), nullable=True)

    opened_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # Buyer
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=False)

    status = Column(SQLEnum(DisputeStatus), default=DisputeStatus.OPEN)
    priority = Column(SQLEnum(DisputePriority), default=DisputePriority.MEDIUM)
    resolution = Column(SQLEnum(DisputeResolution), default=DisputeResolution.PENDING)

    # Dispute Details
    dispute_type = Column(String(50), nullable=False)  # not_received, damaged, wrong_item, not_as_described, etc.
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    expected_resolution = Column(Text, nullable=True)  # What buyer wants

    # Evidence
    evidence = Column(JSON, default=list)  # [{type, url, description, uploaded_at}]
    shipping_proof = Column(JSON, nullable=True)  # Tracking, photos, etc.

    # Communication
    messages = Column(JSON, default=list)  # [{sender_id, message, attachments, created_at}]

    # Resolution
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # Admin
    resolution_notes = Column(Text, nullable=True)
    resolution_amount = Column(Numeric(10, 2), nullable=True)  # Refund amount if any
    resolved_at = Column(DateTime, nullable=True)

    # Timestamps
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    waiting_seller_since = Column(DateTime, nullable=True)
    waiting_buyer_since = Column(DateTime, nullable=True)
    auto_close_at = Column(DateTime, nullable=True)  # Auto-close if no activity

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Discount Type
    discount_type = Column(String(20), nullable=False)  # percentage, fixed_amount, free_shipping
    discount_value = Column(Numeric(10, 2), nullable=False)
    max_discount = Column(Numeric(10, 2), nullable=True)  # For percentage discounts
    min_purchase = Column(Numeric(10, 2), default=0)

    # Usage
    usage_limit = Column(Integer, nullable=True)  # null = unlimited
    usage_count = Column(Integer, default=0)
    usage_limit_per_user = Column(Integer, default=1)

    # Scope
    applies_to = Column(String(20), default="cart")  # cart, product, category, seller
    applicable_ids = Column(JSON, default=list)  # IDs of products/categories/sellers
    excluded_ids = Column(JSON, default=list)

    # Eligibility
    user_roles = Column(JSON, default=list)  # ["buyer", "seller"]
    new_users_only = Column(Boolean, default=False)

    # Schedule
    starts_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def is_valid(self):
        if not self.is_active:
            return False
        now = datetime.utcnow()
        if self.starts_at and now < self.starts_at:
            return False
        if self.expires_at and now > self.expires_at:
            return False
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        return True
