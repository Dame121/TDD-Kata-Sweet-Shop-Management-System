"""
Authentication manager database access object (DAO) layer.
Handles all database queries related to users and authentication.
"""
from sqlalchemy.orm import Session
from typing import Optional, List
from ....app.database import User


class AuthDAO:
    """Data Access Object for authentication operations."""
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.user_id == user_id).first()
    
    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination."""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_user(db: Session, user: User) -> User:
        """Create a new user."""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def update_user(db: Session, user: User) -> User:
        """Update an existing user."""
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user: User) -> None:
        """Delete a user."""
        db.delete(user)
        db.commit()
    
    @staticmethod
    def check_username_exists(db: Session, username: str, exclude_user_id: Optional[int] = None) -> bool:
        """Check if username already exists (optionally excluding a specific user)."""
        query = db.query(User).filter(User.username == username)
        if exclude_user_id:
            query = query.filter(User.user_id != exclude_user_id)
        return query.first() is not None
    
    @staticmethod
    def check_email_exists(db: Session, email: str, exclude_user_id: Optional[int] = None) -> bool:
        """Check if email already exists (optionally excluding a specific user)."""
        query = db.query(User).filter(User.email == email)
        if exclude_user_id:
            query = query.filter(User.user_id != exclude_user_id)
        return query.first() is not None
