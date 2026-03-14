from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
from decimal import Decimal

from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductVariant, ProductStatus


class CartService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_cart(self, user_id: Optional[UUID] = None, session_id: Optional[str] = None) -> Cart:
        """Get existing cart or create a new one"""
        cart = None
        if user_id:
            cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        elif session_id:
            cart = self.db.query(Cart).filter(Cart.session_id == session_id).first()

        if not cart:
            cart = Cart(
                user_id=user_id,
                session_id=session_id,
                currency="USD",
                subtotal=0,
                tax_amount=0,
                shipping_estimate=0,
                total=0,
                item_count=0,
                unique_item_count=0,
                coupon_discount=0,
            )
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)

        return cart

    def get_cart(self, user_id: UUID) -> Cart:
        """Get user's cart"""
        return self.get_or_create_cart(user_id=user_id)

    def add_item(
        self,
        user_id: UUID,
        product_id: UUID,
        quantity: int = 1,
        variant_id: Optional[UUID] = None,
        customizations: Optional[list] = None,
        is_gift: bool = False,
        gift_message: Optional[str] = None,
    ) -> Cart:
        """Add item to cart"""
        cart = self.get_or_create_cart(user_id=user_id)

        # Verify product exists and is active
        product = self.db.query(Product).filter(
            Product.id == product_id,
            Product.status == ProductStatus.ACTIVE,
            Product.deleted_at.is_(None),
        ).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or unavailable")

        # Get price
        unit_price = product.price
        variant_name = None
        if variant_id:
            variant = self.db.query(ProductVariant).filter(
                ProductVariant.id == variant_id,
                ProductVariant.product_id == product_id,
                ProductVariant.is_active == True,
            ).first()
            if not variant:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product variant not found")
            unit_price += variant.price_adjustment
            variant_name = variant.variant_name

        # Check if item already in cart
        existing = self.db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id,
            CartItem.variant_id == variant_id,
            CartItem.saved_for_later == False,
        ).first()

        if existing:
            existing.quantity += quantity
            if existing.quantity > 99:
                existing.quantity = 99
            existing.total_price = existing.unit_price * existing.quantity
        else:
            # Get primary image
            primary_image = None
            if product.images:
                primary = next((img for img in product.images if img.is_primary), None)
                primary_image = primary.image_url if primary else (product.images[0].image_url if product.images else None)

            item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                variant_id=variant_id,
                quantity=quantity,
                unit_price=unit_price,
                original_price=product.compare_at_price,
                total_price=unit_price * quantity,
                product_name=product.title,
                product_image=primary_image,
                variant_name=variant_name,
                customizations=customizations,
                is_gift=is_gift,
                gift_message=gift_message,
                max_quantity=min(product.stock_quantity, 99) if product.stock_quantity else 99,
            )
            self.db.add(item)

        self._recalculate_cart(cart)
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def update_item(self, user_id: UUID, item_id: UUID, quantity: int) -> Cart:
        """Update cart item quantity"""
        cart = self.get_or_create_cart(user_id=user_id)
        item = self.db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id,
        ).first()

        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        if quantity <= 0:
            self.db.delete(item)
        else:
            item.quantity = min(quantity, 99)
            item.total_price = item.unit_price * item.quantity

        self._recalculate_cart(cart)
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def remove_item(self, user_id: UUID, item_id: UUID) -> Cart:
        """Remove item from cart"""
        cart = self.get_or_create_cart(user_id=user_id)
        item = self.db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id,
        ).first()

        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        self.db.delete(item)
        self._recalculate_cart(cart)
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def clear_cart(self, user_id: UUID) -> None:
        """Clear all items from cart"""
        cart = self.get_or_create_cart(user_id=user_id)
        self.db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        cart.subtotal = 0
        cart.tax_amount = 0
        cart.total = 0
        cart.item_count = 0
        cart.unique_item_count = 0
        cart.coupon_code = None
        cart.coupon_discount = 0
        self.db.commit()

    def apply_coupon(self, user_id: UUID, coupon_code: str) -> dict:
        """Apply coupon to cart"""
        from app.models.admin import Coupon

        cart = self.get_or_create_cart(user_id=user_id)
        coupon = self.db.query(Coupon).filter(
            Coupon.code == coupon_code,
            Coupon.is_active == True,
        ).first()

        if not coupon or not coupon.is_valid():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired coupon code")

        if cart.subtotal < float(coupon.min_purchase or 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum purchase of ${coupon.min_purchase} required",
            )

        discount = Decimal("0")
        if coupon.discount_type == "percentage":
            discount = cart.subtotal * coupon.discount_value / 100
            if coupon.max_discount:
                discount = min(discount, coupon.max_discount)
        elif coupon.discount_type == "fixed_amount":
            discount = coupon.discount_value

        cart.coupon_code = coupon_code
        cart.coupon_discount = discount
        self._recalculate_cart(cart)
        self.db.commit()
        self.db.refresh(cart)

        return {
            "success": True,
            "message": "Coupon applied successfully",
            "coupon_code": coupon_code,
            "discount_amount": discount,
            "new_total": cart.total,
        }

    def remove_coupon(self, user_id: UUID) -> Cart:
        """Remove coupon from cart"""
        cart = self.get_or_create_cart(user_id=user_id)
        cart.coupon_code = None
        cart.coupon_discount = 0
        self._recalculate_cart(cart)
        self.db.commit()
        self.db.refresh(cart)
        return cart

    def _recalculate_cart(self, cart: Cart) -> None:
        """Recalculate cart totals"""
        items = self.db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.saved_for_later == False,
        ).all()

        subtotal = sum(item.total_price for item in items)
        item_count = sum(item.quantity for item in items)
        unique_count = len(items)

        cart.subtotal = subtotal
        cart.item_count = item_count
        cart.unique_item_count = unique_count
        cart.tax_amount = subtotal * Decimal("0.08")  # 8% tax estimate
        cart.total = subtotal + cart.tax_amount + (cart.shipping_estimate or 0) - (cart.coupon_discount or 0)
        if cart.total < 0:
            cart.total = 0
        cart.touch()
