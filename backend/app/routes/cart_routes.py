from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.config.database import get_db
from app.schemas.cart_schema import (
    CartItemCreate, CartItemUpdate, CartItemRemove,
    CartResponse, ApplyCouponRequest, ApplyCouponResponse,
)
from app.schemas.common_schema import ApiResponse, SuccessResponse
from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=ApiResponse[CartResponse])
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's cart"""
    service = CartService(db)
    cart = service.get_cart(current_user.id)
    return ApiResponse(success=True, message="Cart retrieved", data=cart)


@router.post("/add", response_model=ApiResponse[CartResponse])
def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add item to cart"""
    service = CartService(db)
    cart = service.add_item(
        user_id=current_user.id,
        product_id=item_data.product_id,
        quantity=item_data.quantity,
        variant_id=item_data.variant_id,
        customizations=[c.model_dump() for c in item_data.customizations] if item_data.customizations else None,
        is_gift=item_data.is_gift,
        gift_message=item_data.gift_message,
    )
    return ApiResponse(success=True, message="Item added to cart", data=cart)


@router.put("/update", response_model=ApiResponse[CartResponse])
def update_cart_item(
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update cart item quantity"""
    item_id = update_data.get("item_id")
    quantity = update_data.get("quantity", 1)
    if not item_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="item_id is required")

    service = CartService(db)
    cart = service.update_item(
        user_id=current_user.id,
        item_id=UUID(item_id),
        quantity=quantity,
    )
    return ApiResponse(success=True, message="Cart updated", data=cart)


@router.delete("/remove", response_model=ApiResponse[CartResponse])
def remove_from_cart(
    remove_data: CartItemRemove,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove item from cart"""
    service = CartService(db)
    cart = service.remove_item(user_id=current_user.id, item_id=remove_data.item_id)
    return ApiResponse(success=True, message="Item removed from cart", data=cart)


@router.delete("/clear", response_model=SuccessResponse)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear all items from cart"""
    service = CartService(db)
    service.clear_cart(current_user.id)
    return SuccessResponse(success=True, message="Cart cleared")


@router.post("/coupon", response_model=ApiResponse[ApplyCouponResponse])
def apply_coupon(
    coupon_data: ApplyCouponRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply coupon to cart"""
    service = CartService(db)
    result = service.apply_coupon(user_id=current_user.id, coupon_code=coupon_data.coupon_code)
    return ApiResponse(success=True, message="Coupon applied", data=result)


@router.delete("/coupon", response_model=SuccessResponse)
def remove_coupon(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove coupon from cart"""
    service = CartService(db)
    service.remove_coupon(current_user.id)
    return SuccessResponse(success=True, message="Coupon removed")
