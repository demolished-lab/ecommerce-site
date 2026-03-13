from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
import logging

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enable PostgreSQL uuid-ossp extension
@event.listens_for(Base.metadata, "before_create")
def receive_before_create(target, connection, **kw):
    connection.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """Context manager for database sessions (for background tasks)"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")


def drop_db():
    """Drop all database tables (use with caution!)"""
    Base.metadata.drop_all(bind=engine)
    logger.warning("Database tables dropped")


class DatabaseSession:
    """Database session context manager for transactions"""

    def __init__(self, db: Session = None):
        self.db = db or SessionLocal()
        self.committed = False

    def __enter__(self):
        return self.db

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.db.rollback()
            self.db.close()
            return False

        if not self.committed:
            self.db.commit()
        self.db.close()
        return True

    def commit(self):
        self.db.commit()
        self.committed = True

    def rollback(self):
        self.db.rollback()
