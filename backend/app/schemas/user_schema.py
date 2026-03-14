from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import re

from app.models.user import UserRole, UserStatus, AddressType


# ============== Address Schemas ==============
class AddressBase(BaseModel):
    address_type: AddressType = AddressType.HOME
    is_default: bool = False
    street_address: str = Field(..., min_length=5, max_length=255)
    apartment: Optional[str] = Field(None, max_length=50)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    country: str = "USA"
    phone: Optional[str] = Field(None, max_length=20)
    delivery_instructions: Optional[str] = None


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    address_type: Optional[AddressType] = None
    is_default: Optional[bool] = None
    street_address: Optional[str] = Field(None, min_length=5, max_length=255)
    apartment: Optional[str] = None
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    state: Optional[str] = Field(None, min_length=2, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=3, max_length=20)
    country: Optional[str] = None
    phone: Optional[str] = None
    delivery_instructions: Optional[str] = None


class AddressResponse(AddressBase):
    id: UUID
    latitude: Optional[str]
    longitude: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============== User Schemas ==============
class UserBase(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

    @validator("password")
    def password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError("Password must contain at least one special character")
        return v

    @validator("phone")
    def phone_format(cls, v):
        if v and not re.match(r"^[\d\s\-\+\(\)]{10,20}$", v):
            raise ValueError("Invalid phone number format")
        return v


class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None


class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


class UserResponse(UserBase):
    id: UUID
    role: UserRole
    status: UserStatus
    avatar_url: Optional[str]
    email_verified: bool
    phone_verified: bool
    two_factor_enabled: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    addresses: List[AddressResponse] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class UserLoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    @validator("confirm_password")
    def passwords_match(cls, v, values):
        if "new_password" in values and v != values["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)


class EmailVerification(BaseModel):
    token: str


# ============== Admin User Schemas ==============
class UserAdminUpdate(BaseModel):
    status: Optional[UserStatus] = None
    role: Optional[UserRole] = None
    email_verified: Optional[bool] = None


class UserListFilters(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    search: Optional[str] = None
    email_verified: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    sort_by: str = "created_at"
    sort_order: str = "desc"


class UserListItem(UserResponse):
    login_attempts: int
    addresses_count: int

    class Config:
        from_attributes = True


# ============== Public Profile Schema ==============
class UserPublicProfile(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
