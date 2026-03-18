"""
Database configuration, models, and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings

DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_models():
    """
    Initialize and register all models with Base.
    Call this function after database setup to avoid circular imports.
    """
    from ..modules.V1.AuthManager.models import User
    from ..modules.V1.SweetsManager.models import Sweet, Transaction
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    return User, Sweet, Transaction


def get_db():
    """Database session dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
