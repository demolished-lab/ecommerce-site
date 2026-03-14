from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.middleware.auth_middleware import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.order import OrderStatus
from app.services.order_service import OrderService
from app.schemas.order_schema import (
    OrderCreate,
    OrderDetailResponse,
    OrderSummaryResponse,
    OrderStatusUpdate,
    PaymentCreate,
    ShippingAddress,
)
from app.schemas.common_schema import ApiResponse, PaginatedResponse

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=ApiResponse[OrderDetailResponse])
def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    order = service.create_order(current_user.id, order_data)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create order",
        )
    return ApiResponse(success=True, message="Order created successfully", data=order)


@router.get("", response_model=ApiResponse[PaginatedResponse[OrderSummaryResponse]])
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = OrderService(db)
    order_status = None
    if status_filter:
        try:
            order_status = OrderStatus(status_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status value",
            )

    orders, total = service.get_user_orders(
        user_id=current_user.id,
        status=order_status,
        page=page,
        page_size=page_size,
    )
    return ApiResponse(
        success=True,
        message="Orders retrieved successfully",
        data=PaginatedResponse.create(
            data=orders, total=total, page=page, page_size=page_size
        ),
    )


@router.get("/{order_id}", response_model=ApiResponse[OrderDetailResponse])
def get_order(order_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return ApiResponse(success=True, message="Order retrieved", data=order)


@router.post("/{order_id}/cancel", response_model=ApiResponse[OrderDetailResponse])
def cancel_order(order_id: str, reason: str = "Cancelled by user", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    canceled = service.cancel_order(order_id=order_id, reason=reason, user_id=current_user.id)
    return ApiResponse(success=True, message="Order cancelled", data=canceled)


@router.post("/shipping-rates", response_model=ApiResponse[list])
def shipping_rates(address: ShippingAddress):
    # Return static shipping rates for demo
    rates = [
        {
            "method": "standard",
            "name": "Standard Shipping",
            "cost": 5.0,
            "estimated_days": 4,
            "is_express": False,
        },
        {
            "method": "express",
            "name": "Express Shipping",
            "cost": 15.0,
            "estimated_days": 1,
            "is_express": True,
        },
    ]
    return ApiResponse(success=True, message="Shipping rates retrieved", data=rates)


@router.post("/{order_id}/payment-intent", response_model=ApiResponse[dict])
def payment_intent(order_id: str, payment_method: str):
    client_secret = f"simulated_secret_{order_id[:8]}"
    return ApiResponse(
        success=True,
        message="Payment intent created",
        data={
            "client_secret": client_secret,
            "publishable_key": "pk_test_simulated",
            "payment_intent_id": f"pi_{order_id[:8]}",
            "amount": 100.0,
            "currency": "USD",
        },
    )


@router.post("/{order_id}/confirm-payment", response_model=ApiResponse[dict])
def confirm_payment(order_id: str, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    payment = service.process_payment(order_id=order_id, payment_data=PaymentCreate(payment_method="credit_card"))
    return ApiResponse(success=True, message="Payment confirmed", data={"payment_id": str(payment.id), "status": payment.status.value})


@router.put("/{order_id}/status", response_model=ApiResponse[OrderDetailResponse])
def update_status(order_id: str, status_update: OrderStatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.update_order_status(order_id=order_id, update_data=status_update, user_id=current_user.id)
    return ApiResponse(success=True, message="Order status updated", data=order)


@router.post("/{order_id}/tracking", response_model=ApiResponse[OrderDetailResponse])
def add_tracking(order_id: str, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    order = service.update_order_status(
        order_id=order_id,
        update_data=OrderStatusUpdate(
            status=OrderStatus.SHIPPED,
            tracking_number=payload.get("tracking_number"),
            reason="Tracking added",
        ),
        user_id=current_user.id,
    )
    return ApiResponse(success=True, message="Tracking added", data=order)


@router.get("/statistics", response_model=ApiResponse[dict])
def statistics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service = OrderService(db)
    stats = service.get_order_statistics(seller_id=None if current_user.role != UserRole.SELLER else current_user.seller_profile.id)
    return ApiResponse(success=True, message="Order statistics", data=stats)
