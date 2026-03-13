from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from fastapi import HTTPException, status
from uuid import UUID
import re

from app.models.product import Product, ProductStatus, ProductVariant, ProductImage, Category, ProductReview
from app.models.seller import Seller, SellerStatus
from app.schemas.product_schema import (
    ProductCreate, ProductUpdate, ProductVariantCreate, ProductVariantUpdate,
    ProductReviewCreate, CategoryCreate, CategoryUpdate
)


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_slug(self, title: str) -> str:
        """Generate URL-friendly slug from title"""
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[\s]+', '-', slug)
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
                detail="Seller account is not active"
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
            dimensions=product_data.dimensions.dict() if product_data.dimensions else None,
            requires_shipping=product_data.requires_shipping,
            shipping_weight=product_data.shipping_weight,
            shipping_class=product_data.shipping_class,
            meta_title=product_data.meta_title,
            meta_description=product_data.meta_description,
            keywords=product_data.keywords,
            attributes=product_data.attributes,
            tags=product_data.tags
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
                    image_url=variant_data.image_url
                )
                self.db.add(variant)

        # Update seller product count
        seller.total_products += 1

        self.db.commit()
        self.db.refresh(product)
        return product

    def get_product_by_id(self, product_id: UUID, include_deleted: bool = False) -> Optional[Product]:
        """Get product by ID"""
        query = self.db.query(Product).filter(Product.id == product_id)
        if not include_deleted:
            query = query.filter(Product.deleted_at.is_(None))
        return query.first()

    def get_product_by_slug(self, slug: str) -> Optional[Product]:
        """Get product by slug"""
        return self.db.query(Product).filter(
            Product.slug == slug,
            Product.deleted_at.is_(None)
        ).first()

    def update_product(self, product_id: UUID, seller_id: UUID, update_data: ProductUpdate) -> Product:
        """Update a product"""
        product = self.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if product.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this product"
            )

        update_dict = update_data.dict(exclude_unset=True)

        # Handle slug update if title changed
        if 'title' in update_dict:
            new_slug = self._generate_slug(update_dict['title'])
            new_slug = self._ensure_unique_slug(new_slug, product_id)
            update_dict['slug'] = new_slug

        for field, value in update_dict.items():
            if field == 'dimensions' and value:
                setattr(product, field, value.dict())
            else:
                setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)
        return product

    def delete_product(self, product_id: UUID, seller_id: UUID) -> bool:
        """Soft delete a product"""
        product = self.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if product.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this product"
            )

        product.deleted_at = datetime.utcnow()
        product.status = ProductStatus.DISCONTINUED

        # Update seller product count
        seller = self.db.query(Seller).filter(Seller.id == seller_id).first()
        if seller:
            seller.total_products -= 1

        self.db.commit()
        return True

    def publish_product(self, product_id: UUID, seller_id: UUID) -> Product:
        """Publish a draft product"""
        product = self.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        if product.seller_id != seller_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to publish this product"
            )

        if product.status not in [ProductStatus.DRAFT, ProductStatus.OUT_OF_STOCK]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot publish product with status: {product.status}"
            )

        # Check stock
        if product.stock_quantity <= 0 and product.stock_track_quantity and not product.stock_allow_backorders:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product is out of stock"
            )

        product.status = ProductStatus.ACTIVE
        product.published_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(product)
        return product

    def get_products(
        self,
        seller_id: Optional[UUID] = None,
        category_id: Optional[UUID] = None,
        status: Optional[ProductStatus] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        is_featured: Optional[bool] = None,
        in_stock: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20
    ):
        """Get products with filtering"""
        query = self.db.query(Product).filter(Product.deleted_at.is_(None))

        if seller_id:
            query = query.filter(Product.seller_id == seller_id)
        else:
            # Public query - only active products
            query = query.filter(Product.status == ProductStatus.ACTIVE)

        if category_id:
            # Include subcategories
            category = self.db.query(Category).filter(Category.id == category_id).first()
            if category:
                category_ids = [category_id]
                # Get all subcategory IDs
                def get_subcategory_ids(cat):
                    ids = []
                    for sub in cat.subcategories:
                        ids.append(sub.id)
                        ids.extend(get_subcategory_ids(sub))
                    return ids

                category_ids.extend(get_subcategory_ids(category))
                query = query.filter(Product.category_id.in_(category_ids))

        if status:
            query = query.filter(Product.status == status)

        if min_price:
            query = query.filter(Product.price >= min_price)

        if max_price:
            query = query.filter(Product.price <= max_price)

        if search:
            query = query.filter(
                or_(
                    Product.title.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                    Product.sku.ilike(f"%{search}%"),
                    Product.tags.overlap([search.lower()])
                )
            )

        if is_featured is not None:
            query = query.filter(Product.is_featured == is_featured)

        if in_stock is not None:
            if in_stock:
                query = query.filter(
                    or_(
                        Product.stock_quantity > 0,
                        Product.stock_allow_backorders == True,
                        Product.stock_track_quantity == False
                    )
                )
            else:
                query = query.filter(Product.stock_quantity <= 0)

        total = query.count()
        products = query.order_by(Product.created_at.desc()).offset(
            (page - 1) * page_size
        ).limit(page_size).all()

        return products, total

    def get_featured_products(self, limit: int = 10):
        """Get featured products"""
        return self.db.query(Product).filter(
            Product.is_featured == True,
            Product.status == ProductStatus.ACTIVE,
            Product.deleted_at.is_(None)
        ).order_by(func.random()).limit(limit).all()

    def create_category(self, category_data: CategoryCreate) -> Category:
        """Create a new category"""
        slug = self._generate_slug(category_data.name)

        # Check if slug exists
        existing = self.db.query(Category).filter(Category.slug == slug).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )

        category = Category(
            parent_id=category_data.parent_id,
            name=category_data.name,
            slug=slug,
            description=category_data.description,
            icon=category_data.icon,
            sort_order=category_data.sort_order,
            attributes_schema=category_data.attributes_schema
        )

        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def get_categories(self, parent_id: Optional[UUID] = None, active_only: bool = True):
        """Get categories"""
        query = self.db.query(Category)

        if active_only:
            query = query.filter(Category.is_active == True)

        if parent_id:
            query = query.filter(Category.parent_id == parent_id)
        else:
            query = query.filter(Category.parent_id.is_(None))

        return query.order_by(Category.sort_order).all()

    def get_category_tree(self):
        """Get full category tree"""
        return self.get_categories(parent_id=None)

    def add_product_review(self, product_id: UUID, user_id: UUID, review_data: ProductReviewCreate) -> ProductReview:
        """Add a product review"""
        product = self.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

        review = ProductReview(
            product_id=product_id,
            user_id=user_id,
            order_id=review_data.order_id,
            rating=review_data.rating,
            title=review_data.title,
            review_text=review_data.review_text,
            value_for_money=review_data.value_for_money,
            quality=review_data.quality,
            shipping=review_data.shipping,
            images=review_data.images or [],
            is_verified_purchase=review_data.order_id is not None
        )

        self.db.add(review)

        # Update product rating
        self._update_product_rating(product_id)

        self.db.commit()
        self.db.refresh(review)
        return review

    def _update_product_rating(self, product_id: UUID):
        """Update product average rating"""
        result = self.db.query(
            func.avg(ProductReview.rating).label('avg_rating'),
            func.count(ProductReview.id).label('review_count')
        ).filter(
            ProductReview.product_id == product_id,
            ProductReview.is_approved == True
        ).first()

        product = self.get_product_by_id(product_id)
        if product:
            product.average_rating = float(result.avg_rating or 0)
            product.review_count = result.review_count

    def update_stock(self, product_id: UUID, quantity_change: int, variant_id: Optional[UUID] = None) -> bool:
        """Update product stock"""
        if variant_id:
            variant = self.db.query(ProductVariant).filter(
                ProductVariant.id == variant_id,
                ProductVariant.product_id == product_id
            ).first()
            if variant:
                variant.stock_quantity += quantity_change
                if variant.stock_quantity < 0:
                    variant.stock_quantity = 0
        else:
            product = self.get_product_by_id(product_id)
            if product:
                product.stock_quantity += quantity_change
                if product.stock_quantity < 0:
                    product.stock_quantity = 0

                # Update status based on stock
                if product.stock_quantity == 0 and product.stock_track_quantity:
                    product.status = ProductStatus.OUT_OF_STOCK

        self.db.commit()
        return True
