import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.config.database import Base


class NotificationType(str, enum.Enum):
    # Order notifications
    ORDER_CREATED = "order_created"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    ORDER_CANCELLED = "order_cancelled"
    ORDER_REFUNDED = "order_refunded"

    # Payment notifications
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    REFUND_PROCESSED = "refund_processed"

    # Product notifications
    PRODUCT_LOW_STOCK = "product_low_stock"
    PRODUCT_OUT_OF_STOCK = "product_out_of_stock"
    PRODUCT_REVIEWED = "product_reviewed"
    PRODUCT_SUSPENDED = "product_suspended"

    # Seller notifications
    SELLER_APPLICATION_STATUS = "seller_application_status"
    NEW_ORDER_RECEIVED = "new_order_received"
    SELLER_PAYMENT_SENT = "seller_payment_sent"

    # System notifications
    WELCOME = "welcome"
    PASSWORD_CHANGED = "password_changed"
    EMAIL_VERIFIED = "email_verified"
    ACCOUNT_SUSPENDED = "account_suspended"
    SECURITY_ALERT = "security_alert"

    # Marketing
    PROMOTION = "promotion"
    NEW_ARRIVAL = "new_arrival"
    PRICE_DROP = "price_drop"
    BACK_IN_STOCK = "back_in_stock"


class NotificationChannel(str, enum.Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)

    type = Column(SQLEnum(NotificationType), nullable=False)
    channel = Column(SQLEnum(NotificationChannel), default=NotificationChannel.IN_APP)

    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    # Related entity
    entity_type = Column(String(50), nullable=True)  # order, product, seller, etc.
    entity_id = Column(UUID(as_uuid=True), nullable=True)

    # Action
    action_url = Column(String(500), nullable=True)
    action_text = Column(String(100), nullable=True)

    # Metadata
    data = Column(JSON, default=dict)
    image_url = Column(String(500), nullable=True)

    # Status
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime, nullable=True)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime, nullable=True)
    send_failed = Column(Boolean, default=False)
    fail_reason = Column(Text, nullable=True)

    # Priority
    priority = Column(String(20), default="normal")  # low, normal, high, urgent

    # Expiration
    expires_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def mark_as_sent(self):
        self.is_sent = True
        self.sent_at = datetime.utcnow()


class UserNotificationPreference(Base):
    __tablename__ = "user_notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)

    # Channel preferences
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    in_app_enabled = Column(Boolean, default=True)

    # Type preferences (JSON for flexibility)
    # { "order_updates": ["email", "push"], "promotions": ["email"], ... }
    type_preferences = Column(JSON, default=dict)

    # Quiet hours
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(5), default="22:00")  # HH:MM
    quiet_hours_end = Column(String(5), default="08:00")

    # Frequency
    digest_email = Column(Boolean, default=False)  # Daily digest instead of immediate
    digest_time = Column(String(5), default="09:00")

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def wants_notification(self, notification_type: str, channel: str):
        if not getattr(self, f"{channel}_enabled", False):
            return False

        type_prefs = self.type_preferences.get(notification_type, ["email", "in_app"])
        return channel in type_prefs
