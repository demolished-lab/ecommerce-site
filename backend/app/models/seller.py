import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum as SQLEnum,
    Integer,
    Float,
    JSON,
)
from app.config.database import UUID
from sqlalchemy.orm import relationship
import enum

from app.config.database import Base


class SellerStatus(str, enum.Enum):
    PENDING = "pending"  # Applied but not reviewed
    UNDER_REVIEW = "under_review"  # Being reviewed by admin
    APPROVED = "approved"  # Approved but onboarding not complete
    ACTIVE = "active"  # Fully active
    SUSPENDED = "suspended"  # Temporarily suspended
    REJECTED = "rejected"  # Application rejected
    DEACTIVATED = "deactivated"  # Permanently deactivated


class SellerTier(str, enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class Seller(Base):
    __tablename__ = "sellers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False
    )

    # Store Information
    store_name = Column(String(150), unique=True, nullable=False, index=True)
    store_slug = Column(String(150), unique=True, nullable=False, index=True)
    store_description = Column(Text, nullable=True)
    store_logo = Column(String(500), nullable=True)
    store_banner = Column(String(500), nullable=True)

    # Business Information
    business_name = Column(String(200), nullable=False)
    business_type = Column(
        String(50), nullable=False
    )  # LLC, Corporation, Sole Proprietorship, etc.
    business_registration_number = Column(String(100), nullable=True)
    tax_id = Column(String(50), nullable=True)
    vat_number = Column(String(50), nullable=True)

    # Contact Information
    business_email = Column(String(255), nullable=False)
    business_phone = Column(String(20), nullable=False)
    support_email = Column(String(255), nullable=True)

    # Address
    address_street = Column(String(255), nullable=False)
    address_city = Column(String(100), nullable=False)
    address_state = Column(String(100), nullable=False)
    address_postal = Column(String(20), nullable=False)
    address_country = Column(String(100), default="USA")

    # Status & Tier
    status = Column(SQLEnum(SellerStatus), default=SellerStatus.PENDING, nullable=False)
    tier = Column(SQLEnum(SellerTier), default=SellerTier.BRONZE, nullable=False)

    # Commission & Pricing
    commission_rate = Column(Float, default=0.10)  # 10% default commission
    subscription_plan = Column(String(50), default="free")
    subscription_expires_at = Column(DateTime, nullable=True)

    # Performance Metrics
    total_products = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    response_time_hours = Column(Float, nullable=True)  # Average response time

    # Policies
    return_policy = Column(Text, nullable=True)
    shipping_policy = Column(Text, nullable=True)
    processing_time_days = Column(Integer, default=1)

    # Verification
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Payout Information
    payout_method = Column(String(50), nullable=True)  # bank_transfer, paypal, stripe
    payout_details = Column(JSON, nullable=True)  # Encrypted payout info

    # SEO & Social
    meta_title = Column(String(70), nullable=True)
    meta_description = Column(String(160), nullable=True)
    social_links = Column(JSON, default=dict)  # {facebook, instagram, twitter, etc.}

    # Timestamps
    applied_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime, nullable=True)
    activated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deactivated_at = Column(DateTime, nullable=True)
    deactivation_reason = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="seller_profile", foreign_keys=[user_id])
    products = relationship(
        "Product", back_populates="seller", cascade="all, delete-orphan"
    )
    documents = relationship(
        "SellerDocument", back_populates="seller", cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="seller")

    def is_active(self):
        return self.status == SellerStatus.ACTIVE

    def can_sell(self):
        return self.status in [SellerStatus.ACTIVE, SellerStatus.APPROVED]


class SellerDocument(Base):
    __tablename__ = "seller_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("sellers.id"), nullable=False)

    document_type = Column(
        String(50), nullable=False
    )  # id_proof, business_license, tax_document, etc.
    document_name = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)  # in bytes
    mime_type = Column(String(100), nullable=True)

    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(UUID(as_uuid=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)

    # Relationships
    seller = relationship("Seller", back_populates="documents")
