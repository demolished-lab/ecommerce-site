from passlib.context import CryptContext

# Configure bcrypt for password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Cost factor
)


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)


def is_password_strong(password: str) -> tuple[bool, str]:
    """
    Check if password meets security requirements.
    Returns (is_strong, message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"

    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"

    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"

    if not any(c in "!@#$%^&*(),.?\":{}|<>" for c in password):
        return False, "Password must contain at least one special character"

    return True, "Password is strong"
