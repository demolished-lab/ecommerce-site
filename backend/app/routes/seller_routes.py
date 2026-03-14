from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from uuid import UUID
import re

from app.config.database import get_db
from app.schemas.seller_schema import (
    SellerCreate, SellerUpdate, SellerResponse, SellerPublicProfile,
    SellerDashboardStats, SellerDetailResponse,
)
from app.schemas.common_schema import ApiResponse, SuccessResponse, PaginatedResponse
from app.middleware.auth_middleware import get_current_user, require_role, require_seller_approved
from app.models.user import User, UserRole
from app.models.seller import Seller, SellerStatus, SellerTier
from app.models.product import Product, ProductStatus
from app.models.order import Order, OrderStatus

router = APIRouter(prefix="/sellers", tags=["Sellers"])


def _generate_slug(name: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", name.lower())
    slug = re.sub(r"[\s]+", "-", slug)
    return slug[:150]


# ─── Public endpoints ───

@router.get("", response_model=ApiResponse[dict])
def list_sellers(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    tier: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List active sellers (public)"""
    query = db.query(Seller).filter(Seller.status == SellerStatus.ACTIVE)

    if search:
        query = query.filter(Seller.store_name.ilike(f"%{search}%"))
    if tier:
        query = query.filter(Seller.tier == tier)

    total = query.count()
    sellers = query.order_by(Seller.average_rating.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return ApiResponse(
        success=True,
        message="Sellers retrieved",
        data=PaginatedResponse.create(
            data=[SellerPublicProfile.model_validate(s) for s in sellers],
            total=total, page=page, page_size=page_size,
        ).model_dump(),
    )


@router.get("/store/{slug}", response_model=ApiResponse[SellerPublicProfile])
def get_store_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get public store page by slug"""
    seller = db.query(Seller).filter(
        Seller.store_slug == slug,
        Seller.status == SellerStatus.ACTIVE,
    ).first()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")

    return ApiResponse(success=True, message="Store retrieved", data=seller)


# ─── Authenticated seller endpoints ───

@router.post("/apply", response_model=ApiResponse[SellerResponse])
def apply_as_seller(
    application: SellerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply to become a seller"""
    existing = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already have a seller application")

    slug = _generate_slug(application.store_name)
    slug_exists = db.query(Seller).filter(Seller.store_slug == slug).first()
    if slug_exists:
        slug = f"{slug}-{str(current_user.id)[:8]}"

    seller = Seller(
        user_id=current_user.id,
        store_name=application.store_name,
        store_slug=slug,
        store_description=application.store_description,
        business_name=application.business_name,
        business_type=application.business_type,
        business_registration_number=application.business_registration_number,
        tax_id=application.tax_id,
        vat_number=application.vat_number,
        business_email=application.business_email,
        business_phone=application.business_phone,
        support_email=application.support_email,
        address_street=application.address_street,
        address_city=application.address_city,
        address_state=application.address_state,
        address_postal=application.address_postal,
        address_country=application.address_country,
        return_policy=application.return_policy,
        shipping_policy=application.shipping_policy,
        processing_time_days=application.processing_time_days,
        social_links=application.social_links.model_dump() if application.social_links else {},
        status=SellerStatus.PENDING,
    )

    db.add(seller)
    current_user.role = UserRole.SELLER
    db.commit()
    db.refresh(seller)

    return ApiResponse(success=True, message="Seller application submitted", data=seller)


@router.get("/me", response_model=ApiResponse[SellerDetailResponse])
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get own seller profile"""
    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller profile not found")
    return ApiResponse(success=True, message="Profile retrieved", data=seller)


@router.put("/me", response_model=ApiResponse[SellerResponse])
def update_my_profile(
    update_data: SellerUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update own seller profile"""
    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller profile not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        if field == "social_links" and value:
            setattr(seller, field, value.model_dump() if hasattr(value, "model_dump") else value)
        else:
            setattr(seller, field, value)

    db.commit()
    db.refresh(seller)
    return ApiResponse(success=True, message="Profile updated", data=seller)


@router.get("/dashboard/stats", response_model=ApiResponse[SellerDashboardStats])
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get seller dashboard statistics"""
    seller = db.query(Seller).filter(Seller.user_id == current_user.id).first()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller profile not found")

    total_products = db.query(Product).filter(Product.seller_id == seller.id, Product.deleted_at.is_(None)).count()
    active_products = db.query(Product).filter(
        Product.seller_id == seller.id, Product.status == ProductStatus.ACTIVE, Product.deleted_at.is_(None)
    ).count()
    out_of_stock = db.query(Product).filter(
        Product.seller_id == seller.id, Product.status == ProductStatus.OUT_OF_STOCK, Product.deleted_at.is_(None)
    ).count()

    stats = SellerDashboardStats(
        total_products=total_products,
        active_products=active_products,
        out_of_stock_products=out_of_stock,
        total_orders=seller.total_orders,
        pending_orders=0,
        processing_orders=0,
        shipped_orders=0,
        delivered_orders=0,
        cancelled_orders=0,
        total_revenue=seller.total_revenue,
        revenue_this_month=0,
        revenue_last_month=0,
        revenue_change_percent=0,
        total_customers=0,
        repeat_customers=0,
        average_order_value=seller.total_revenue / seller.total_orders if seller.total_orders > 0 else 0,
        average_rating=seller.average_rating,
        review_count=seller.review_count,
    )

    return ApiResponse(success=True, message="Stats retrieved", data=stats)
