from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID
import re

from app.models.user import User, UserRole
from app.models.seller import Seller, SellerStatus, SellerTier, SellerDocument
from app.models.admin import AdminLog, AdminLogAction
from app.schemas.seller_schema import (
    SellerCreate,
    SellerUpdate,
    SellerAdminUpdate,
    SellerReviewRequest,
    SellerDashboardStats,
    SellerSalesReport,
)
from app.models.product import Product, ProductVariant, ProductStatus
from app.schemas.product_schema import ProductCreate
from app.config.settings import settings


class SellerService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_slug(self, store_name: str) -> str:
        """Generate URL-friendly slug from store name"""
        slug = re.sub(r"[^\w\s-]", "", store_name.lower())
        slug = re.sub(r"[\s]+", "-", slug)
        return slug[:150]

    def apply_as_seller(self, user_id: UUID, seller_data: SellerCreate) -> Seller:
        """User applies to become a seller"""
        # Check if user exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Check if already a seller
        existing_seller = (
            self.db.query(Seller).filter(Seller.user_id == user_id).first()
        )
        if existing_seller:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a seller or has a pending application",
            )

        # Check if store name is taken
        existing_store = (
            self.db.query(Seller)
            .filter(Seller.store_name == seller_data.store_name)
            .first()
        )
        if existing_store:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Store name already taken",
            )

        # Create seller application
        slug = self._generate_slug(seller_data.store_name)

        # Check slug uniqueness and append number if needed
        base_slug = slug
        counter = 1
        while self.db.query(Seller).filter(Seller.store_slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        seller = Seller(
            user_id=user_id,
            store_name=seller_data.store_name,
            store_slug=slug,
            store_description=seller_data.store_description,
            business_name=seller_data.business_name,
            business_type=seller_data.business_type,
            business_registration_number=seller_data.business_registration_number,
            tax_id=seller_data.tax_id,
            vat_number=seller_data.vat_number,
            business_email=seller_data.business_email,
            business_phone=seller_data.business_phone,
            support_email=seller_data.support_email,
            address_street=seller_data.address_street,
            address_city=seller_data.address_city,
            address_state=seller_data.address_state,
            address_postal=seller_data.address_postal,
            address_country=seller_data.address_country,
            return_policy=seller_data.return_policy,
            shipping_policy=seller_data.shipping_policy,
            processing_time_days=seller_data.processing_time_days,
            social_links=(
                seller_data.social_links.dict() if seller_data.social_links else {}
            ),
            status=SellerStatus.PENDING,
            tier=SellerTier.BRONZE,
            commission_rate=settings.DEFAULT_TAX_RATE,
        )

        self.db.add(seller)
        self.db.commit()
        self.db.refresh(seller)

        # Update user role
        user.role = UserRole.SELLER
        self.db.commit()

        return seller

    def get_seller_by_id(self, seller_id: UUID) -> Optional[Seller]:
        """Get seller by ID"""
        return self.db.query(Seller).filter(Seller.id == seller_id).first()

    def get_seller_by_user_id(self, user_id: UUID) -> Optional[Seller]:
        """Get seller by user ID"""
        return self.db.query(Seller).filter(Seller.user_id == user_id).first()

    def get_seller_by_slug(self, slug: str) -> Optional[Seller]:
        """Get seller by slug"""
        return self.db.query(Seller).filter(Seller.store_slug == slug).first()

    def update_seller(self, seller_id: UUID, update_data: SellerUpdate) -> Seller:
        """Update seller information"""
        seller = self.get_seller_by_id(seller_id)
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
            )

        update_dict = update_data.dict(exclude_unset=True)
        for field, value in update_dict.items():
            if field == "social_links" and value:
                setattr(seller, field, value.dict())
            else:
                setattr(seller, field, value)

        self.db.commit()
        self.db.refresh(seller)
        return seller

    def get_seller_dashboard_stats(self, seller_id: UUID) -> SellerDashboardStats:
        """Get seller dashboard statistics"""
        seller = self.get_seller_by_id(seller_id)
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
            )

        from app.models.product import Product, ProductStatus
        from app.models.order import Order, OrderStatus

        # Count products by status
        products = self.db.query(Product).filter(Product.seller_id == seller_id).all()
        active_products = len([p for p in products if p.status == ProductStatus.ACTIVE])
        out_of_stock = len(
            [p for p in products if p.status == ProductStatus.OUT_OF_STOCK]
        )

        # Count orders by status
        orders = self.db.query(Order).filter(Order.seller_id == seller_id).all()
        order_counts = {
            "pending": 0,
            "processing": 0,
            "shipped": 0,
            "delivered": 0,
            "cancelled": 0,
        }
        for order in orders:
            if order.status == OrderStatus.CONFIRMED:
                order_counts["pending"] += 1
            elif order.status == OrderStatus.PROCESSING:
                order_counts["processing"] += 1
            elif order.status == OrderStatus.SHIPPED:
                order_counts["shipped"] += 1
            elif order.status == OrderStatus.DELIVERED:
                order_counts["delivered"] += 1
            elif order.status == OrderStatus.CANCELLED:
                order_counts["cancelled"] += 1

        return SellerDashboardStats(
            total_products=len(products),
            active_products=active_products,
            out_of_stock_products=out_of_stock,
            total_orders=seller.total_orders,
            pending_orders=order_counts["pending"],
            processing_orders=order_counts["processing"],
            shipped_orders=order_counts["shipped"],
            delivered_orders=order_counts["delivered"],
            cancelled_orders=order_counts["cancelled"],
            total_revenue=float(seller.total_revenue),
            revenue_this_month=0.0,  # Calculate in production
            revenue_last_month=0.0,
            revenue_change_percent=0.0,
            total_customers=0,
            repeat_customers=0,
            average_order_value=(
                float(seller.total_revenue / seller.total_orders)
                if seller.total_orders > 0
                else 0.0
            ),
            average_rating=seller.average_rating,
            review_count=seller.review_count,
        )

    def review_seller_application(
        self, seller_id: UUID, review_data: SellerReviewRequest, admin_id: UUID
    ) -> Seller:
        """Admin reviews seller application"""
        seller = self.get_seller_by_id(seller_id)
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
            )

        if seller.status not in [SellerStatus.PENDING, SellerStatus.UNDER_REVIEW]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Seller application is not pending review",
            )

        old_status = seller.status

        if review_data.action == "approve":
            seller.status = SellerStatus.ACTIVE
            seller.is_verified = True
            seller.verified_at = datetime.utcnow()
            seller.verified_by = admin_id
            seller.activated_at = datetime.utcnow()
            seller.reviewed_at = datetime.utcnow()
            log_action = AdminLogAction.SELLER_APPROVED
        elif review_data.action == "reject":
            seller.status = SellerStatus.REJECTED
            seller.reviewed_at = datetime.utcnow()
            log_action = AdminLogAction.SELLER_REJECTED
        elif review_data.action == "request_info":
            seller.status = SellerStatus.UNDER_REVIEW
            log_action = AdminLogAction.USER_UPDATED
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid review action"
            )

        self.db.commit()

        # Log admin action
        log = AdminLog(
            admin_id=admin_id,
            action=log_action,
            entity_type="seller",
            entity_id=seller.id,
            old_values={"status": old_status.value},
            new_values={"status": seller.status.value, "notes": review_data.notes},
        )
        self.db.add(log)
        self.db.commit()

        return seller

    def admin_update_seller(
        self, seller_id: UUID, update_data: SellerAdminUpdate, admin_id: UUID
    ) -> Seller:
        """Admin updates seller settings"""
        seller = self.get_seller_by_id(seller_id)
        if not seller:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found"
            )

        old_values = {}
        new_values = {}

        if update_data.status:
            old_values["status"] = seller.status.value
            seller.status = update_data.status
            new_values["status"] = update_data.status.value

        if update_data.tier:
            old_values["tier"] = seller.tier.value
            seller.tier = update_data.tier
            new_values["tier"] = update_data.tier.value

        if update_data.commission_rate is not None:
            old_values["commission_rate"] = seller.commission_rate
            seller.commission_rate = update_data.commission_rate
            new_values["commission_rate"] = update_data.commission_rate

        if update_data.is_verified is not None:
            old_values["is_verified"] = seller.is_verified
            seller.is_verified = update_data.is_verified
            if update_data.is_verified and not seller.verified_at:
                seller.verified_at = datetime.utcnow()
            new_values["is_verified"] = update_data.is_verified

        self.db.commit()

        # Log admin action
        if old_values:
            log = AdminLog(
                admin_id=admin_id,
                action=(
                    AdminLogAction.SELLER_TIER_CHANGED
                    if update_data.tier
                    else AdminLogAction.USER_UPDATED
                ),
                entity_type="seller",
                entity_id=seller.id,
                old_values=old_values,
                new_values=new_values,
            )
            self.db.add(log)
            self.db.commit()

        return seller

    def get_public_sellers(
        self,
        search: Optional[str] = None,
        tier: Optional[SellerTier] = None,
        is_verified: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ):
        """Get public seller listings"""
        query = self.db.query(Seller).filter(Seller.status == SellerStatus.ACTIVE)

        if search:
            query = query.filter(
                Seller.store_name.ilike(f"%{search}%")
                | Seller.store_description.ilike(f"%{search}%")
            )

        if tier:
            query = query.filter(Seller.tier == tier)

        if is_verified is not None:
            query = query.filter(Seller.is_verified == is_verified)

        total = query.count()
        sellers = query.offset((page - 1) * page_size).limit(page_size).all()

        return sellers, total

    def upload_document(
        self,
        seller_id: UUID,
        document_type: str,
        file_url: str,
        file_size: int,
        mime_type: str,
    ) -> SellerDocument:
        """Upload a seller document"""
        document = SellerDocument(
            seller_id=seller_id,
            document_type=document_type,
            document_name=f"{document_type}_{datetime.utcnow().timestamp()}",
            file_url=file_url,
            file_size=file_size,
            mime_type=mime_type,
        )

        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)

        return document

    def update_seller_metrics(self, seller_id: UUID, order_total: float):
        """Update seller metrics after order"""
        seller = self.get_seller_by_id(seller_id)
        if seller:
            seller.total_orders += 1
            seller.total_revenue += order_total
            self.db.commit()


# Product-related operations (moved from cart_service)
class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        slug = re.sub(r"[^\w\s-]", "", title.lower())
        slug = re.sub(r"[\s]+", "-", slug)
        return slug[:200]

    def _ensure_unique_slug(self, slug: str, existing_id: Optional[UUID] = None) -> str:
        """Ensure slug is unique by appending number if needed"""
        base_slug = slug
        counter = 1

        query = self.db.query(Product).filter(Product.slug == slug)
        if existing_id:
            query = query.filter(Product.id != existing_id)

        while query.first():
            slug = f"{base_slug}-{counter}"
            counter += 1
            query = self.db.query(Product).filter(Product.slug == slug)
            if existing_id:
                query = query.filter(Product.id != existing_id)

        return slug

    def create_product(self, seller_id: UUID, product_data: ProductCreate) -> Product:
        """Create a new product"""
        # Verify seller is active
        seller = self.db.query(Seller).filter(Seller.id == seller_id).first()
        if not seller or not seller.is_active():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seller account is not active",
            )

        # Generate slug
        slug = self._generate_slug(product_data.title)
        slug = self._ensure_unique_slug(slug)

        # Create product
        product = Product(
            seller_id=seller_id,
            category_id=product_data.category_id,
            title=product_data.title,
            slug=slug,
            description=product_data.description,
            short_description=product_data.short_description,
            price=product_data.price,
            compare_at_price=product_data.compare_at_price,
            cost_price=product_data.cost_price,
            sku=product_data.sku,
            barcode=product_data.barcode,
            stock_quantity=product_data.stock_quantity,
            stock_track_quantity=product_data.stock_track_quantity,
            stock_allow_backorders=product_data.stock_allow_backorders,
            low_stock_threshold=product_data.low_stock_threshold,
            status=ProductStatus.DRAFT,
            condition=product_data.condition,
            is_digital=product_data.is_digital,
            weight=product_data.weight,
            dimensions=(
                product_data.dimensions.dict() if product_data.dimensions else None
            ),
            requires_shipping=product_data.requires_shipping,
            shipping_weight=product_data.shipping_weight,
            shipping_class=product_data.shipping_class,
            meta_title=product_data.meta_title,
            meta_description=product_data.meta_description,
            keywords=product_data.keywords,
            attributes=product_data.attributes,
            tags=product_data.tags,
        )

        self.db.add(product)
        self.db.flush()  # Flush to get product ID

        # Create variants if provided
        if product_data.variants:
            for variant_data in product_data.variants:
                variant = ProductVariant(
                    product_id=product.id,
                    variant_name=variant_data.variant_name,
                    sku=variant_data.sku,
                    barcode=variant_data.barcode,
                    options=variant_data.options,
                    price_adjustment=variant_data.price_adjustment,
                    stock_quantity=variant_data.stock_quantity,
                    is_active=variant_data.is_active,
                    image_url=variant_data.image_url,
                )
                self.db.add(variant)

        # Update seller product count
        seller.total_products += 1

        self.db.commit()
        self.db.refresh(product)
        return product

    def get_product_by_id(
        self, product_id: UUID, include_deleted: bool = False
    ) -> Optional[Product]:
        """Get product by ID"""
        query = self.db.query(Product).filter(Product.id == product_id)
        if not include_deleted:
            query = query.filter(Product.deleted_at.is_(None))
        return query.first()

    # ... (rest of ProductService methods copied similarly)
