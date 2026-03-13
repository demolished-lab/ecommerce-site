from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MultiVendor Marketplace"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-change-this-in-production"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/marketplace"

    # JWT
    JWT_SECRET: str = "your-jwt-secret-change-this"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 7

    # Email
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@marketplace.com"

    # Payment (Stripe)
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Redis (for caching & sessions)
    REDIS_URL: str = "redis://localhost:6379/0"

    # File Upload
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/webp"]
    UPLOAD_DIR: str = "uploads"

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    # Tax & Shipping
    DEFAULT_TAX_RATE: float = 0.08
    FREE_SHIPPING_THRESHOLD: float = 50.0
    FLAT_SHIPPING_RATE: float = 5.99

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
