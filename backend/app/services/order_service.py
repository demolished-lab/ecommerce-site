from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from uuid import UUID

from app.models.order import Order, OrderItem, OrderStatus, Payment, PaymentMethod, PaymentStatus, OrderStatusHistory
from app.models.cart import Cart, CartItem
from app.models.product import Product, ProductStatus, ProductVariant
from app.models.seller import Seller
from app.models.user import User, UserAddress
from app.schemas.order_schema import (
    OrderCreate, OrderStatusUpdate, PaymentCreate, RefundRequest,
    ShippingAddress
)
from app.config.settings import settings
import random
import string


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_order_number(self) -> str:
        """Generate unique order number"""
        # Format: ORD-YYYY-XXXXXX
        year = datetime.utcnow().year
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ORD-{year}-{random_str}"

    def _ensure_unique_order_number(self) -> str:
        """Ensure order number is unique"""
        while True:
            order_number = self._generate_order_number()
            existing = self.db.query(Order).filter(
                Order.order_number == order_number
            ).first()
            if not existing:
                return order_number

    def validate_cart_stock(self, cart: Cart) -> Tuple[bool, List[dict]]:
        """Validate all items in cart have sufficient stock"""
        errors = []
        is_valid = True

        for item in cart.items:
            if item.saved_for_later:
                continue

            product = self.db.query(Product).filter(
                Product.id == item.product_id
            ).first()

            if not product:
                errors.append({
                    'item_id': item.id,
                    'product_name': item.product_name,
                    'error': 'Product no longer available'
                })
                is_valid = False
                continue

            if product.status != ProductStatus.ACTIVE:
                errors.append({
                    'item_id': item.id,
                    'product_name': item.product_name,
                    'error': f'Product is {product.status.value}'
                })
                is_valid = False
                continue

            # Check variant stock if applicable
            if item.variant_id:
                variant = self.db.query(ProductVariant).filter(
                    ProductVariant.id == item.variant_id
                ).first()
                if variant and variant.stock_quantity < item.quantity:
                    errors.append({
                        'item_id': item.id,
                        'product_name': item.product_name,
                        'error': f'Only {variant.stock_quantity} units available'
                    })
                    is_valid = False
            else:
                if product.stock_quantity < item.quantity:
                    errors.append({
                        'item_id': item.id,
                        'product_name': item.product_name,
                        'error': f'Only {product.stock_quantity} units available'
                    })
                    is_valid = False

        return is_valid, errors

    def calculate_order_totals(self, cart: Cart, shipping_method: Optional[str] = None) -> dict:
        """Calculate order totals"""
        subtotal = sum(
            item.unit_price * item.quantity
            for item in cart.items
            if not item.saved_for_later
        )

        # Calculate shipping
        shipping_cost = Decimal('0')
        if subtotal < settings.FREE_SHIPPING_THRESHOLD:
            shipping_cost = Decimal(str(settings.FLAT_SHIPPING_RATE))

        # Calculate tax
        tax_amount = subtotal * Decimal(str(settings.DEFAULT_TAX_RATE))

        # Apply coupon discount
        discount = cart.coupon_discount if cart.coupon_discount else Decimal('0')

        total = subtotal + shipping_cost + tax_amount - discount

        return {
            'subtotal': subtotal,
            'shipping_cost': shipping_cost,
            'tax_amount': tax_amount,
            'discount': discount,
            'total': total
        }

    def create_order(self, user_id: UUID, order_data: OrderCreate) -> Order:
        """Create order from cart"""
        # Get user's cart
        cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )

        # Validate stock
        is_valid, errors = self.validate_cart_stock(cart)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Stock validation failed", "errors": errors}
            )

        # Get shipping address
        if order_data.shipping_address_id:
            address = self.db.query(UserAddress).filter(
                UserAddress.id == order_data.shipping_address_id,
                UserAddress.user_id == user_id
            ).first()
            if not address:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Shipping address not found"
                )
            shipping_address_snapshot = {
                'full_name': f"{address.user.first_name} {address.user.last_name}",
                'street': address.street_address,
                'apartment': address.apartment,
                'city': address.city,
                'state': address.state,
                'postal_code': address.postal_code,
                'country': address.country,
                'phone': address.phone
            }
        elif order_data.shipping_address:
            shipping_address_snapshot = order_data.shipping_address.dict()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Shipping address required"
            )

        # Calculate totals
        totals = self.calculate_order_totals(cart, order_data.shipping_method)

        # Group items by seller (for multi-seller orders)
        seller_items = {}
        for item in cart.items:
            if item.saved_for_later:
                continue

            product = self.db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                continue

            if product.seller_id not in seller_items:
                seller_items[product.seller_id] = []
            seller_items[product.seller_id].append((item, product))

        # Create orders (one per seller)
        created_orders = []
        for seller_id, items in seller_items.items():
            order = Order(
                order_number=self._ensure_unique_order_number(),
                user_id=user_id,
                seller_id=seller_id,
                shipping_address_id=order_data.shipping_address_id,
                status=OrderStatus.CREATED,
                subtotal=sum(item.unit_price * item.quantity for item, _ in items),
                shipping_cost=totals['shipping_cost'] / len(seller_items),  # Split shipping
                tax_amount=totals['tax_amount'] / len(seller_items),
                coupon_code=cart.coupon_code,
                coupon_discount=totals['discount'] / len(seller_items) if totals['discount'] > 0 else 0,
                total_amount=totals['total'] / len(seller_items),
                shipping_method=order_data.shipping_method,
                shipping_name=shipping_address_snapshot.get('full_name'),
                shipping_address=shipping_address_snapshot,
                customer_notes=order_data.customer_notes,
                is_gift=order_data.is_gift,
                gift_message=order_data.gift_message if order_data.is_gift else None,
                gift_wrap=order_data.gift_wrap
            )

            self.db.add(order)
            self.db.flush()  # Get order ID

            # Create order items
            for cart_item, product in items:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=cart_item.product_id,
                    variant_id=cart_item.variant_id,
                    product_name=product.title,
                    product_sku=product.sku,
                    product_image=cart_item.product_image,
                    variant_name=cart_item.variant_name,
                    unit_price=cart_item.unit_price,
                    original_price=cart_item.original_price,
                    quantity=cart_item.quantity,
                    total_price=cart_item.total_price,
                    tax_rate=settings.DEFAULT_TAX_RATE,
                    tax_amount=cart_item.total_price * Decimal(str(settings.DEFAULT_TAX_RATE)),
                    customizations=cart_item.customizations,
                    weight=product.weight
                )
                self.db.add(order_item)

                # Update stock
                if cart_item.variant_id:
                    variant = self.db.query(ProductVariant).filter(
                        ProductVariant.id == cart_item.variant_id
                    ).first()
                    if variant:
                        variant.stock_quantity -= cart_item.quantity
                else:
                    product.stock_quantity -= cart_item.quantity

            # Add status history
            status_history = OrderStatusHistory(
                order_id=order.id,
                to_status=OrderStatus.CREATED,
                reason="Order created"
            )
            self.db.add(status_history)

            created_orders.append(order)

        # Clear cart
        for item in cart.items:
            if not item.saved_for_later:
                self.db.delete(item)

        cart.subtotal = Decimal('0')
        cart.tax_amount = Decimal('0')
        cart.total = Decimal('0')
        cart.item_count = 0
        cart.coupon_code = None
        cart.coupon_discount = Decimal('0')

        self.db.commit()

        # Update seller metrics
        for order in created_orders:
            seller = self.db.query(Seller).filter(Seller.id == order.seller_id).first()
            if seller:
                seller.total_orders += 1
                seller.total_revenue += float(order.total_amount)

        self.db.commit()

        # Return first order (for single seller case)
        return created_orders[0] if created_orders else None

    def get_order_by_id(self, order_id: UUID) -> Optional[Order]:
        """Get order by ID"""
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_order_by_number(self, order_number: str) -> Optional[Order]:
        """Get order by order number"""
        return self.db.query(Order).filter(
            Order.order_number == order_number
        ).first()

    def get_user_orders(
        self,
        user_id: UUID,
        status: Optional[OrderStatus] = None,
        page: int = 1,
        page_size: int = 20
    ):
        """Get user's orders"""
        query = self.db.query(Order).filter(Order.user_id == user_id)

        if status:
            query = query.filter(Order.status == status)

        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset(
            (page - 1) * page_size
        ).limit(page_size).all()

        return orders, total

    def get_seller_orders(
        self,
        seller_id: UUID,
        status: Optional[OrderStatus] = None,
        page: int = 1,
        page_size: int = 20
    ):
        """Get seller's orders"""
        query = self.db.query(Order).filter(Order.seller_id == seller_id)

        if status:
            query = query.filter(Order.status == status)

        total = query.count()
        orders = query.order_by(Order.created_at.desc()).offset(
            (page - 1) * page_size
        ).limit(page_size).all()

        return orders, total

    def update_order_status(
        self,
        order_id: UUID,
        update_data: OrderStatusUpdate,
        user_id: Optional[UUID] = None
    ) -> Order:
        """Update order status"""
        order = self.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        old_status = order.status
        order.status = update_data.status

        # Add status history
        history = OrderStatusHistory(
            order_id=order_id,
            from_status=old_status,
            to_status=update_data.status,
            reason=update_data.reason,
            changed_by=user_id
        )
        self.db.add(history)

        # Update timestamps based on status
        if update_data.status == OrderStatus.SHIPPED:
            order.shipped_at = datetime.utcnow()
            order.tracking_number = update_data.tracking_number
            order.shipping_carrier = update_data.shipping_carrier

            # Update item statuses
            for item in order.items:
                item.status = OrderStatus.SHIPPED

        elif update_data.status == OrderStatus.DELIVERED:
            order.delivered_at = datetime.utcnow()
            order.status = OrderStatus.DELIVERED

            # Update item statuses
            for item in order.items:
                item.status = OrderStatus.DELIVERED

        elif update_data.status == OrderStatus.CANCELLED:
            order.cancelled_at = datetime.utcnow()
            order.cancel_reason = update_data.reason

            # Restore stock
            for item in order.items:
                product = self.db.query(Product).filter(
                    Product.id == item.product_id
                ).first()
                if product:
                    product.stock_quantity += item.quantity

        elif update_data.status == OrderStatus.COMPLETED:
            order.completed_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(order)
        return order

    def process_payment(self, order_id: UUID, payment_data: PaymentCreate) -> Payment:
        """Process payment for order"""
        order = self.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # In production: integrate with Stripe, PayPal, etc.
        # For now, simulate successful payment
        payment = Payment(
            order_id=order_id,
            payment_method=payment_data.payment_method,
            provider="stripe" if payment_data.payment_method == PaymentMethod.CREDIT_CARD else payment_data.payment_method.value,
            status=PaymentStatus.COMPLETED,
            amount=order.total_amount,
            currency=order.currency,
            fee_amount=order.total_amount * Decimal('0.029') + Decimal('0.30'),  # Stripe fee approximation
            processed_at=datetime.utcnow(),
            completed_at=datetime.utcnow()
        )

        self.db.add(payment)

        # Update order status
        order.status = OrderStatus.PAYMENT_COMPLETED

        # Add status history
        history = OrderStatusHistory(
            order_id=order_id,
            from_status=OrderStatus.PENDING_PAYMENT,
            to_status=OrderStatus.PAYMENT_COMPLETED,
            reason="Payment processed successfully"
        )
        self.db.add(history)

        self.db.commit()
        self.db.refresh(payment)
        return payment

    def cancel_order(self, order_id: UUID, reason: str, user_id: UUID) -> Order:
        """Cancel an order"""
        order = self.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        if not order.can_cancel():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be cancelled in status: {order.status}"
            )

        return self.update_order_status(
            order_id,
            OrderStatusUpdate(status=OrderStatus.CANCELLED, reason=reason),
            user_id
        )

    def process_refund(self, order_id: UUID, refund_data: RefundRequest) -> bool:
        """Process refund for order"""
        order = self.get_order_by_id(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        if not order.can_refund():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order cannot be refunded"
            )

        # In production: integrate with payment provider
        refund_amount = refund_data.amount or order.total_amount

        # Update order
        order.status = OrderStatus.REFUNDED

        # Add status history
        history = OrderStatusHistory(
            order_id=order_id,
            from_status=order.status,
            to_status=OrderStatus.REFUNDED,
            reason=f"Refunded: {refund_data.reason}"
        )
        self.db.add(history)

        self.db.commit()
        return True

    def get_order_statistics(self, seller_id: Optional[UUID] = None) -> dict:
        """Get order statistics"""
        query = self.db.query(Order)
        if seller_id:
            query = query.filter(Order.seller_id == seller_id)

        total_orders = query.count()
        total_revenue = self.db.query(func.sum(Order.total_amount)).filter(
            Order.status.in_([OrderStatus.PAYMENT_COMPLETED, OrderStatus.DELIVERED, OrderStatus.COMPLETED])
        )
        if seller_id:
            total_revenue = total_revenue.filter(Order.seller_id == seller_id)
        total_revenue = total_revenue.scalar() or 0

        status_counts = {}
        for status in OrderStatus:
            count = self.db.query(Order).filter(
                Order.status == status
            )
            if seller_id:
                count = count.filter(Order.seller_id == seller_id)
            status_counts[status.value] = count.count()

        return {
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'status_counts': status_counts
        }
