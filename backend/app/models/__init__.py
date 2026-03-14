# Import all models to ensure they are registered with SQLAlchemy
from app.models.user import User, UserAddress
from app.models.seller import Seller, SellerDocument
from app.models.product import (
    Product,
    Category,
    ProductImage,
    ProductReview,
    ProductVariant,
)
from app.models.order import Order, OrderItem, OrderStatusHistory, Payment
from app.models.cart import Cart, CartItem
from app.models.admin import AdminLog, PlatformSetting, Dispute
from app.models.notification import Notification

__all__ = [
    "User",
    "UserAddress",
    "Seller",
    "SellerDocument",
    "Product",
    "Category",
    "ProductImage",
    "ProductReview",
    "ProductVariant",
    "Order",
    "OrderItem",
    "OrderStatusHistory",
    "Payment",
    "Cart",
    "CartItem",
    "AdminLog",
    "PlatformSetting",
    "Dispute",
    "Notification",
]
