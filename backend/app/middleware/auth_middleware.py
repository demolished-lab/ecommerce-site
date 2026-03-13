from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.config.database import get_db
from app.utils.jwt_handler import decode_token, verify_token_type
from app.models.user import User, UserRole

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
        verify_token_type(payload, "access")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is not active",
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, return None otherwise.
    Useful for endpoints that work with or without authentication.
    """
    if not credentials:
        return None

    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


def require_role(required_role: UserRole):
    """
    Factory function to create a dependency that requires a specific role.
    Usage: Depends(require_role(UserRole.ADMIN))
    """
    async def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role != required_role and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires {required_role.value} role",
            )
        return current_user
    return role_checker


def require_any_role(*roles: UserRole):
    """
    Factory function to create a dependency that requires any of the specified roles.
    Usage: Depends(require_any_role(UserRole.SELLER, UserRole.ADMIN))
    """
    async def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role not in roles and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker


def require_seller_approved(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to ensure user is an approved seller.
    """
    if not current_user.is_seller():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires seller approval",
        )

    from app.models.seller import SellerStatus
    if current_user.seller_profile.status != SellerStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller account is not active. Please complete verification.",
        )

    return current_user


class AuthMiddleware:
    """
    Middleware to handle authentication on all routes.
    Can be configured to skip certain paths.
    """
    def __init__(self, app, skip_paths: list = None):
        self.app = app
        self.skip_paths = skip_paths or ["/health", "/docs", "/openapi.json", "/auth/login", "/auth/register"]

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive)
        path = request.url.path

        # Skip authentication for certain paths
        if any(path.startswith(skip) for skip in self.skip_paths):
            await self.app(scope, receive, send)
            return

        # Add user to request state if token is present
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
            try:
                payload = decode_token(token)
                scope["user"] = payload
            except Exception:
                scope["user"] = None
        else:
            scope["user"] = None

        await self.app(scope, receive, send)
