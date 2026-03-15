from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID

from app.config.database import get_db
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductDetailResponse,
    ProductListItem,
    CategoryResponse,
    CategoryTreeResponse,
    ProductFilters,
    ProductReviewCreate,
    ProductReviewResponse,
)
from app.schemas.common_schema import ApiResponse, PaginatedResponse, SuccessResponse

# ProductService currently lives in cart_service due to file misplacement
from app.services.product_service import ProductService
from app.middleware.auth_middleware import (
    get_current_user,
    get_current_user_optional,
    require_role,
)
from app.models.user import User, UserRole
from app.models.product import ProductStatus

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ApiResponse[PaginatedResponse[ProductListItem]])
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    seller_id: Optional[UUID] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = Query(
        "created_at", pattern="^(created_at|price|popularity|rating|name)$"
    ),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    in_stock: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """List products with filters"""
    product_service = ProductService(db)
    products, total = product_service.get_products(
        category_id=category_id,
        seller_id=seller_id,
        min_price=min_price,
        max_price=max_price,
        search=search,
        in_stock=in_stock,
        is_featured=is_featured,
        page=page,
        page_size=page_size,
    )

    return ApiResponse(
        success=True,
        message="Products retrieved successfully",
        data=PaginatedResponse.create(
            data=products, total=total, page=page, page_size=page_size
        ),
    )


@router.get("/featured", response_model=ApiResponse[List[ProductListItem]])
def get_featured_products(
    limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)
):
    """Get featured products"""
    product_service = ProductService(db)
    products = product_service.get_featured_products(limit=limit)

    return ApiResponse(
        success=True, message="Featured products retrieved", data=products
    )


@router.get("/{product_id}", response_model=ApiResponse[ProductDetailResponse])
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    """Get product details"""
    product_service = ProductService(db)
    product = product_service.get_product_by_id(product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    return ApiResponse(
        success=True, message="Product retrieved successfully", data=product
    )


@router.get("/slug/{slug}", response_model=ApiResponse[ProductDetailResponse])
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get product by slug"""
    product_service = ProductService(db)
    product = product_service.get_product_by_slug(slug)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    return ApiResponse(
        success=True, message="Product retrieved successfully", data=product
    )


@router.post("", response_model=ApiResponse[ProductDetailResponse])
def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new product (seller only)"""
    if not current_user.is_seller():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create products",
        )

    product_service = ProductService(db)
    product = product_service.create_product(
        seller_id=current_user.seller_profile.id, product_data=product_data
    )

    return ApiResponse(
        success=True, message="Product created successfully", data=product
    )


@router.put("/{product_id}", response_model=ApiResponse[ProductDetailResponse])
def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a product (seller only)"""
    product_service = ProductService(db)
    product = product_service.update_product(
        product_id=product_id,
        seller_id=current_user.seller_profile.id,
        update_data=product_data,
    )

    return ApiResponse(
        success=True, message="Product updated successfully", data=product
    )


@router.delete("/{product_id}", response_model=SuccessResponse)
def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a product (seller only)"""
    product_service = ProductService(db)
    product_service.delete_product(
        product_id=product_id, seller_id=current_user.seller_profile.id
    )

    return SuccessResponse(success=True, message="Product deleted successfully")


@router.post("/{product_id}/publish", response_model=ApiResponse[ProductDetailResponse])
def publish_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Publish a product"""
    product_service = ProductService(db)
    product = product_service.publish_product(
        product_id=product_id, seller_id=current_user.seller_profile.id
    )

    return ApiResponse(
        success=True, message="Product published successfully", data=product
    )


@router.post("/{product_id}/reviews", response_model=ApiResponse[ProductReviewResponse])
def add_review(
    product_id: UUID,
    review_data: ProductReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a product review"""
    product_service = ProductService(db)
    review = product_service.add_product_review(
        product_id=product_id, user_id=current_user.id, review_data=review_data
    )

    return ApiResponse(success=True, message="Review added successfully", data=review)


@router.get(
    "/{product_id}/reviews", response_model=ApiResponse[List[ProductReviewResponse]]
)
def get_reviews(
    product_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get product reviews"""
    from app.models.product import ProductReview

    reviews = (
        db.query(ProductReview)
        .filter(
            ProductReview.product_id == product_id, ProductReview.is_approved == True
        )
        .order_by(ProductReview.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return ApiResponse(success=True, message="Reviews retrieved", data=reviews)


@router.post("/{product_id}/images", response_model=SuccessResponse)
def upload_product_images(
    product_id: UUID,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload product images"""
    # Implementation would handle file uploads
    return SuccessResponse(success=True, message=f"{len(files)} images uploaded")


# Category routes
@router.get("/categories", response_model=ApiResponse[List[CategoryTreeResponse]])
def get_categories(parent_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    """Get product categories"""
    product_service = ProductService(db)
    categories = product_service.get_categories(parent_id=parent_id)

    return ApiResponse(success=True, message="Categories retrieved", data=categories)


@router.get("/categories/tree", response_model=ApiResponse[List[CategoryTreeResponse]])
def get_category_tree(db: Session = Depends(get_db)):
    """Get full category tree"""
    product_service = ProductService(db)
    categories = product_service.get_category_tree()

    return ApiResponse(success=True, message="Category tree retrieved", data=categories)


@router.post("/categories", response_model=ApiResponse[CategoryResponse])
def create_category(
    category_data: CategoryResponse,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """Create category (admin only)"""
    # Implementation would create category
    return ApiResponse(success=True, message="Category created", data={})


@router.get("/search/suggestions", response_model=ApiResponse[List[str]])
def get_search_suggestions(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """Get search suggestions"""
    # Implementation would return search suggestions
    return ApiResponse(success=True, message="Suggestions retrieved", data=[])
