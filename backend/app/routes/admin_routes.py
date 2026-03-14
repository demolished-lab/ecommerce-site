from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from uuid import UUID

from app.config.database import get_db
from app.schemas.common_schema import ApiResponse, SuccessResponse, PaginatedResponse
from app.schemas.seller_schema import (
    SellerResponse, SellerAdminUpdate, SellerReviewRequest,
)

from app.middleware.auth_middleware import require_role
from app.models.user import User, UserRole, UserStatus
from app.models.seller import Seller, SellerStatus
from app.models.product import Product, ProductStatus, Category
from app.models.order import Order, OrderStatus
from app.models.admin import PlatformSetting

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── Dashboard ───

@router.get("/dashboard", response_model=ApiResponse[dict])
def admin_dashboard(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Admin dashboard summary"""
    total_users = db.query(User).count()
    total_sellers = db.query(Seller).count()
    active_sellers = db.query(Seller).filter(Seller.status == SellerStatus.ACTIVE).count()
    pending_sellers = db.query(Seller).filter(Seller.status == SellerStatus.PENDING).count()
    total_products = db.query(Product).filter(Product.deleted_at.is_(None)).count()
    total_orders = db.query(Order).count()

    revenue_result = db.query(func.sum(Order.total_amount)).scalar()
    total_revenue = float(revenue_result) if revenue_result else 0

    return ApiResponse(
        success=True,
        message="Dashboard data retrieved",
        data={
            "total_users": total_users,
            "total_sellers": total_sellers,
            "active_sellers": active_sellers,
            "pending_sellers": pending_sellers,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
        },
    )


# ─── User Management ───

@router.get("/users", response_model=ApiResponse[dict])
def list_users(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    user_status: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List all users"""
    query = db.query(User)
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) |
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%"))
        )
    if role:
        query = query.filter(User.role == role)
    if user_status:
        query = query.filter(User.status == user_status)

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    users_data = []
    for u in users:
        users_data.append({
            "id": str(u.id),
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role.value if hasattr(u.role, "value") else u.role,
            "status": u.status.value if hasattr(u.status, "value") else u.status,
            "email_verified": u.email_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    return ApiResponse(
        success=True,
        message="Users retrieved",
        data={"users": users_data, "total": total, "page": page, "page_size": page_size},
    )


@router.put("/users/{user_id}/status", response_model=SuccessResponse)
def update_user_status(
    user_id: str,
    body: dict,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Update user status (suspend/reactivate)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_status = body.get("status")
    if new_status:
        user.status = new_status
    db.commit()
    return SuccessResponse(success=True, message="User status updated")


# ─── Seller Management ───

@router.get("/sellers", response_model=ApiResponse[dict])
def list_sellers(
    page: int = 1,
    page_size: int = 20,
    seller_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List all sellers for admin"""
    query = db.query(Seller)
    if seller_status:
        query = query.filter(Seller.status == seller_status)
    if search:
        query = query.filter(Seller.store_name.ilike(f"%{search}%"))

    total = query.count()
    sellers = query.order_by(Seller.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return ApiResponse(
        success=True,
        message="Sellers retrieved",
        data={
            "sellers": [SellerResponse.model_validate(s).model_dump() for s in sellers],
            "total": total, "page": page, "page_size": page_size,
        },
    )


@router.post("/sellers/{seller_id}/review", response_model=ApiResponse[SellerResponse])
def review_seller(
    seller_id: str,
    review: SellerReviewRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Approve/reject seller application"""
    seller = db.query(Seller).filter(Seller.id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found")

    if review.action == "approve":
        seller.status = SellerStatus.ACTIVE
        seller.reviewed_at = datetime.now(timezone.utc)
        seller.activated_at = datetime.now(timezone.utc)
        seller.is_verified = True
        seller.verified_at = datetime.now(timezone.utc)
        seller.verified_by = current_user.id
    elif review.action == "reject":
        seller.status = SellerStatus.REJECTED
        seller.reviewed_at = datetime.now(timezone.utc)
        seller.deactivation_reason = review.reason
    elif review.action == "request_info":
        seller.status = SellerStatus.UNDER_REVIEW

    db.commit()
    db.refresh(seller)
    return ApiResponse(success=True, message=f"Seller {review.action}d", data=seller)


@router.put("/sellers/{seller_id}/settings", response_model=ApiResponse[SellerResponse])
def update_seller_settings(
    seller_id: str,
    settings_data: SellerAdminUpdate,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Update seller settings (tier, commission, etc.)"""
    seller = db.query(Seller).filter(Seller.id == seller_id).first()
    if not seller:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seller not found")

    for field, value in settings_data.model_dump(exclude_unset=True).items():
        setattr(seller, field, value)

    db.commit()
    db.refresh(seller)
    return ApiResponse(success=True, message="Seller settings updated", data=seller)


# ─── Product Moderation ───

@router.get("/products", response_model=ApiResponse[dict])
def list_products(
    page: int = 1,
    page_size: int = 20,
    product_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List products for moderation"""
    query = db.query(Product).filter(Product.deleted_at.is_(None))
    if product_status:
        query = query.filter(Product.status == product_status)
    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    products_data = []
    for p in products:
        products_data.append({
            "id": str(p.id),
            "title": p.title,
            "slug": p.slug,
            "price": float(p.price),
            "status": p.status.value if hasattr(p.status, "value") else p.status,
            "stock_quantity": p.stock_quantity,
            "is_featured": p.is_featured,
            "seller_id": str(p.seller_id),
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    return ApiResponse(
        success=True,
        message="Products retrieved",
        data={"products": products_data, "total": total, "page": page, "page_size": page_size},
    )


@router.put("/products/{product_id}/status", response_model=SuccessResponse)
def update_product_status(
    product_id: str,
    body: dict,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Update product status (approve, suspend, feature)"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if "status" in body:
        product.status = body["status"]
    if "is_featured" in body:
        product.is_featured = body["is_featured"]

    db.commit()
    return SuccessResponse(success=True, message="Product updated")


# ─── Order Management ───

@router.get("/orders", response_model=ApiResponse[dict])
def list_orders(
    page: int = 1,
    page_size: int = 20,
    order_status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List all orders"""
    query = db.query(Order)
    if order_status:
        query = query.filter(Order.status == order_status)
    if search:
        query = query.filter(Order.order_number.ilike(f"%{search}%"))

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    orders_data = []
    for o in orders:
        orders_data.append({
            "id": str(o.id),
            "order_number": o.order_number,
            "status": o.status.value if hasattr(o.status, "value") else o.status,
            "total_amount": float(o.total_amount) if o.total_amount else 0,
            "user_id": str(o.user_id),
            "created_at": o.created_at.isoformat() if o.created_at else None,
        })

    return ApiResponse(
        success=True,
        message="Orders retrieved",
        data={"orders": orders_data, "total": total, "page": page, "page_size": page_size},
    )


# ─── Category Management ───

@router.get("/categories", response_model=ApiResponse[list])
def list_categories(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """List all categories"""
    categories = db.query(Category).order_by(Category.sort_order).all()
    cats_data = []
    for c in categories:
        cats_data.append({
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "icon": c.icon,
            "parent_id": str(c.parent_id) if c.parent_id else None,
            "sort_order": c.sort_order,
            "is_active": c.is_active,
            "is_featured": c.is_featured,
        })
    return ApiResponse(success=True, message="Categories retrieved", data=cats_data)


@router.post("/categories", response_model=SuccessResponse)
def create_category(
    cat_data: dict,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Create a category"""
    import re
    name = cat_data.get("name", "")
    slug = cat_data.get("slug", re.sub(r"[^\w]+", "-", name.lower()).strip("-"))
    category = Category(
        name=name,
        slug=slug,
        description=cat_data.get("description"),
        icon=cat_data.get("icon"),
        sort_order=cat_data.get("sort_order", 0),
        is_active=True,
    )
    db.add(category)
    db.commit()
    return SuccessResponse(success=True, message="Category created")


@router.put("/categories/{category_id}", response_model=SuccessResponse)
def update_category(
    category_id: str,
    body: dict,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Update a category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    for field in ["name", "description", "icon", "sort_order", "is_active", "is_featured"]:
        if field in body:
            setattr(category, field, body[field])

    db.commit()
    return SuccessResponse(success=True, message="Category updated")


@router.delete("/categories/{category_id}", response_model=SuccessResponse)
def delete_category(
    category_id: str,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Delete a category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    db.delete(category)
    db.commit()
    return SuccessResponse(success=True, message="Category deleted")


# ─── Platform Settings ───

@router.get("/settings", response_model=ApiResponse[list])
def get_settings(
    category: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Get platform settings"""
    query = db.query(PlatformSetting)
    if category:
        query = query.filter(PlatformSetting.category == category)

    settings_list = query.order_by(PlatformSetting.category, PlatformSetting.key).all()
    data = []
    for s in settings_list:
        data.append({
            "id": str(s.id),
            "key": s.key,
            "value": s.value if not s.is_secret else "***",
            "data_type": s.data_type,
            "description": s.description,
            "category": s.category,
            "is_editable": s.is_editable,
            "is_secret": s.is_secret,
        })

    return ApiResponse(success=True, message="Settings retrieved", data=data)


@router.put("/settings/{setting_id}", response_model=SuccessResponse)
def update_setting(
    setting_id: str,
    body: dict,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Update a platform setting"""
    setting = db.query(PlatformSetting).filter(PlatformSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Setting not found")
    if not setting.is_editable:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Setting is not editable")

    if "value" in body:
        setting.value = str(body["value"])
    setting.updated_by = current_user.id

    db.commit()
    return SuccessResponse(success=True, message="Setting updated")
