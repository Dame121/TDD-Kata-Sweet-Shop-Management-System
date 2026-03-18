"""
AuthManager models for user authentication and authorization.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from ....app.database import Base


class User(Base):
    """
    User model for authentication and authorization.
    Supports both regular users and admins through the is_admin flag.
    """
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # Will store hashed password
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
