from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config.settings import settings


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create a JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_token_type(payload: Dict[str, Any], expected_type: str) -> None:
    """Verify the token type matches expected type"""
    token_type = payload.get("type")
    if token_type != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token type. Expected {expected_type}, got {token_type}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_token_expiry(payload: Dict[str, Any]) -> datetime:
    """Get token expiry timestamp"""
    exp = payload.get("exp")
    if exp:
        return datetime.fromtimestamp(exp)
    return datetime.utcnow()


def is_token_expired(payload: Dict[str, Any]) -> bool:
    """Check if token is expired"""
    exp = payload.get("exp")
    if exp:
        return datetime.utcnow() > datetime.fromtimestamp(exp)
    return True


def refresh_access_token(refresh_token: str) -> str:
    """Create new access token from refresh token"""
    payload = decode_token(refresh_token)
    verify_token_type(payload, "refresh")

    # Remove token-specific claims
    token_data = {
        k: v for k, v in payload.items()
        if k not in ["exp", "iat", "type"]
    }

    return create_access_token(token_data)
