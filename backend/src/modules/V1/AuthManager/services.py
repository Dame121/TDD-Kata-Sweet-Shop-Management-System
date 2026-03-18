"""
Authentication manager services layer.
Contains business logic for authentication and user management.
"""
from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ....app.auth import (
    authenticate_user, create_access_token, get_password_hash
)
from ....app.settings import settings
from .models import User
from .dao import AuthDAO


class AuthService:
    """Service layer for authentication operations."""
    
    @staticmethod
    def register_user(db: Session, username: str, email: str, password: str, is_admin: bool = False) -> User:
        """
        Register a new user.
        
        Args:
            db: Database session
            username: User's username
            email: User's email
            password: User's password (plain text - will be hashed)
            is_admin: Whether user is admin
            
        Returns:
            Created User object
            
        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username already exists
        if AuthDAO.check_username_exists(db, username):
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Check if email already exists
        if AuthDAO.check_email_exists(db, email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password
        hashed_password = get_password_hash(password)
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            is_admin=is_admin
        )
        
        return AuthDAO.create_user(db, new_user)
    
    @staticmethod
    def login_user(db: Session, username: str, password: str) -> tuple:
        """
        Authenticate user and generate access token.
        
        Args:
            db: Database session
            username: User's username
            password: User's password (plain text)
            
        Returns:
            Tuple of (access_token, token_type, user)
            
        Raises:
            HTTPException: If credentials are invalid or user is inactive
        """
        # Authenticate user
        user = authenticate_user(db, username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.user_id), "username": user.username, "is_admin": user.is_admin},
            expires_delta=access_token_expires
        )
        
        return access_token, "bearer", user
    
    @staticmethod
    def update_user(db: Session, user: User, username: str = None, email: str = None, 
                    password: str = None, is_admin: bool = None) -> User:
        """
        Update user information.
        
        Args:
            db: Database session
            user: User object to update
            username: New username (optional)
            email: New email (optional)
            password: New password (optional)
            is_admin: New admin status (optional)
            
        Returns:
            Updated User object
            
        Raises:
            HTTPException: If new email/username already exists
        """
        # Check new username doesn't already exist
        if username is not None:
            user.username = username
        
        # Check new email doesn't already exist
        if email is not None:
            if AuthDAO.check_email_exists(db, email, exclude_user_id=user.user_id):
                raise HTTPException(status_code=400, detail="Email already registered")
            user.email = email
        
        # Hash new password if provided
        if password is not None:
            user.password = get_password_hash(password)
        
        # Update admin status
        if is_admin is not None:
            user.is_admin = is_admin
        
        return AuthDAO.update_user(db, user)
    
    @staticmethod
    def create_admin(db: Session, username: str, email: str, password: str, is_active: bool = True) -> User:
        """
        Create a new admin user.
        
        Args:
            db: Database session
            username: Admin's username
            email: Admin's email
            password: Admin's password
            is_active: Whether admin account is active
            
        Returns:
            Created User object (with is_admin=True)
            
        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username already exists
        if AuthDAO.check_username_exists(db, username):
            raise HTTPException(status_code=400, detail="Username already registered")
        
        # Check if email already exists
        if AuthDAO.check_email_exists(db, email):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash the password
        hashed_password = get_password_hash(password)
        
        # Create new admin user
        new_admin = User(
            username=username,
            email=email,
            password=hashed_password,
            is_admin=True,  # Always True for admin
            is_active=is_active
        )
        
        return AuthDAO.create_user(db, new_admin)
