import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.config.database import Base


class UserRole(str, enum.Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    role = Column(SQLEnum(UserRole), default=UserRole.BUYER, nullable=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.ACTIVE, nullable=False)

    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255), nullable=True)

    last_login_at = Column(DateTime, nullable=True)
    login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")
    seller_profile = relationship("Seller", back_populates="user", uselist=False)
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    reviews = relationship("ProductReview", back_populates="user")

    def is_active(self):
        return self.status == UserStatus.ACTIVE and self.deleted_at is None

    def is_seller(self):
        return self.role == UserRole.SELLER and self.seller_profile is not None

    def is_admin(self):
        return self.role == UserRole.ADMIN

    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class AddressType(str, enum.Enum):
    HOME = "home"
    WORK = "work"
    OTHER = "other"


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    address_type = Column(SQLEnum(AddressType), default=AddressType.HOME)
    is_default = Column(Boolean, default=False)

    street_address = Column(String(255), nullable=False)
    apartment = Column(String(50), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False, default="USA")

    latitude = Column(String(20), nullable=True)
    longitude = Column(String(20), nullable=True)

    phone = Column(String(20), nullable=True)
    delivery_instructions = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="addresses")
