from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.config.database import get_db
from app.schemas.user_schema import (
    UserCreate, UserLogin, UserLoginResponse, UserResponse, UserDetailResponse,
    UserUpdate, PasswordChange, PasswordResetRequest, PasswordReset,
    EmailVerification
)
from app.schemas.common_schema import ApiResponse, SuccessResponse
from app.services.auth_service import AuthService
from app.middleware.auth_middleware import get_current_user, require_role
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/register", response_model=ApiResponse[UserLoginResponse])
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user account"""
    auth_service = AuthService(db)
    user, access_token, refresh_token = auth_service.register_user(user_data)

    return ApiResponse(
        success=True,
        message="Registration successful",
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 3600,
            "user": user
        }
    )


@router.post("/login", response_model=ApiResponse[UserLoginResponse])
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    auth_service = AuthService(db)
    user, access_token, refresh_token = auth_service.authenticate_user(login_data)

    return ApiResponse(
        success=True,
        message="Login successful",
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 3600,
            "user": user
        }
    )


@router.post("/logout", response_model=SuccessResponse)
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Logout current user"""
    auth_service = AuthService(db)
    auth_service.logout_user(current_user.id)

    return SuccessResponse(
        success=True,
        message="Logout successful"
    )


@router.get("/me", response_model=ApiResponse[UserDetailResponse])
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return ApiResponse(
        success=True,
        message="User retrieved successfully",
        data=current_user
    )


@router.put("/me", response_model=ApiResponse[UserResponse])
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    auth_service = AuthService(db)
    updated_user = auth_service.update_user(current_user.id, update_data)

    return ApiResponse(
        success=True,
        message="Profile updated successfully",
        data=updated_user
    )


@router.post("/change-password", response_model=SuccessResponse)
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    auth_service = AuthService(db)
    auth_service.change_password(current_user.id, password_data)

    return SuccessResponse(
        success=True,
        message="Password changed successfully"
    )


@router.post("/forgot-password", response_model=SuccessResponse)
def forgot_password(
    request_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset email"""
    auth_service = AuthService(db)
    auth_service.request_password_reset(request_data.email)

    return SuccessResponse(
        success=True,
        message="If the email exists, a password reset link has been sent"
    )


@router.post("/reset-password", response_model=SuccessResponse)
def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    auth_service = AuthService(db)
    auth_service.reset_password(reset_data.token, reset_data.new_password)

    return SuccessResponse(
        success=True,
        message="Password reset successfully"
    )


@router.post("/verify-email", response_model=SuccessResponse)
def verify_email(
    verification_data: EmailVerification,
    db: Session = Depends(get_db)
):
    """Verify email address"""
    # Implementation would verify email token
    return SuccessResponse(
        success=True,
        message="Email verified successfully"
    )


@router.post("/resend-verification", response_model=SuccessResponse)
def resend_verification(
    current_user: User = Depends(get_current_user)
):
    """Resend verification email"""
    if current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )

    # Implementation would send verification email
    return SuccessResponse(
        success=True,
        message="Verification email sent"
    )


@router.post("/refresh", response_model=ApiResponse[dict])
def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    from app.utils.jwt_handler import refresh_access_token

    refresh_token = credentials.credentials
    new_access_token = refresh_access_token(refresh_token)

    return ApiResponse(
        success=True,
        message="Token refreshed",
        data={
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": 3600
        }
    )


# Admin routes
@router.get("/admin/users", response_model=ApiResponse[dict])
def list_users(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """List all users (admin only)"""
    # Implementation would return paginated user list
    return ApiResponse(
        success=True,
        message="Users retrieved",
        data={"users": [], "total": 0, "page": page, "page_size": page_size}
    )
