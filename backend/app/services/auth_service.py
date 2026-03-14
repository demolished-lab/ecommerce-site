from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models.user import User, UserRole, UserStatus
from app.models.admin import AdminLog, AdminLogAction
from app.schemas.user_schema import UserCreate, UserLogin, UserUpdate, PasswordChange
from app.utils.password_hash import hash_password, verify_password
from app.utils.jwt_handler import create_access_token, create_refresh_token
from app.config.settings import settings


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_data: UserCreate) -> Tuple[User, str, str]:
        """Register a new user"""
        # Check if email already exists
        existing_user = (
            self.db.query(User).filter(User.email == user_data.email).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            role=UserRole.BUYER,
            status=UserStatus.ACTIVE,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Create tokens
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return user, access_token, refresh_token

    def authenticate_user(self, login_data: UserLogin) -> Tuple[User, str, str]:
        """Authenticate user and return tokens"""
        user = self.db.query(User).filter(User.email == login_data.email).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Check if user is locked
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Account locked. Try again after {user.locked_until}",
            )

        # Check if user is active
        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is not active"
            )

        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            # Increment login attempts
            user.login_attempts += 1

            # Lock account after 5 failed attempts
            if user.login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                self.db.commit()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account locked for 30 minutes due to multiple failed login attempts",
                )

            self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Successful login - reset attempts
        user.login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()

        # Create tokens
        expires = timedelta(days=30) if login_data.remember_me else None
        token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}

        access_token = create_access_token(token_data, expires)
        refresh_token = create_refresh_token(token_data)

        return user, access_token, refresh_token

    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def change_password(self, user_id: UUID, password_data: PasswordChange) -> bool:
        """Change user password"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Verify current password
        if not verify_password(password_data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Update password
        user.password_hash = hash_password(password_data.new_password)
        self.db.commit()

        return True

    def request_password_reset(self, email: str) -> bool:
        """Request password reset - in production, send email"""
        user = self.get_user_by_email(email)
        if not user:
            # Don't reveal if email exists
            return True

        # In production: generate token, save to DB, send email
        # For now, just return True
        return True

    def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password with token"""
        # In production: validate token, find user, update password
        # For now, return True
        return True

    def update_user(self, user_id: UUID, update_data: UserUpdate) -> User:
        """Update user profile"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)
        return user

    def logout_user(self, user_id: UUID) -> bool:
        """Logout user - can be extended to invalidate tokens"""
        # In production: add token to blacklist
        return True

    def admin_create_user(
        self, user_data: UserCreate, role: UserRole, admin_id: UUID
    ) -> User:
        """Admin creates a user with specific role"""
        # Check if email exists
        existing_user = (
            self.db.query(User).filter(User.email == user_data.email).first()
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            role=role,
            status=UserStatus.ACTIVE,
            email_verified=True,
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        # Log admin action
        log = AdminLog(
            admin_id=admin_id,
            action=AdminLogAction.USER_CREATED,
            entity_type="user",
            entity_id=user.id,
            new_values={"email": user.email, "role": role.value},
        )
        self.db.add(log)
        self.db.commit()

        return user

    def admin_update_user_status(
        self, user_id: UUID, new_status: UserStatus, admin_id: UUID
    ) -> User:
        """Admin updates user status"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        old_status = user.status
        user.status = new_status

        if new_status == UserStatus.SUSPENDED:
            action = AdminLogAction.USER_SUSPENDED
        elif new_status == UserStatus.ACTIVE and old_status == UserStatus.SUSPENDED:
            action = AdminLogAction.USER_REACTIVATED
        else:
            action = AdminLogAction.USER_UPDATED

        self.db.commit()

        # Log admin action
        log = AdminLog(
            admin_id=admin_id,
            action=action,
            entity_type="user",
            entity_id=user.id,
            old_values={"status": old_status.value},
            new_values={"status": new_status.value},
        )
        self.db.add(log)
        self.db.commit()

        return user
