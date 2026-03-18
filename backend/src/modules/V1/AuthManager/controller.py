"""
Authentication manager controller layer.
Handles request/response processing for authentication endpoints.
"""
from datetime import timedelta
from typing import List
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ....app.database import get_db
from ....app.auth import get_current_user, get_current_admin_user
from .models import User
from .schemas import (
    UserCreate, UserUpdate, UserResponse, TokenResponse, LoginRequest,
    AdminCreate, AdminUpdate, AdminResponse
)
from .services import AuthService
from .dao import AuthDAO


class AuthController:
    """Controller for handling authentication requests and responses."""
    
    @staticmethod
    def register_user(user: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
        """
        Handle user registration request.
        
        Args:
            user: User registration data
            db: Database session
            
        Returns:
            UserResponse with created user data
        """
        created_user = AuthService.register_user(
            db=db,
            username=user.username,
            email=user.email,
            password=user.password,
            is_admin=user.is_admin
        )
        return created_user
    
    @staticmethod
    def login(login_data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
        """
        Handle user login request.
        
        Args:
            login_data: Login credentials
            db: Database session
            
        Returns:
            TokenResponse with access token and user info
        """
        access_token, token_type, user = AuthService.login_user(
            db=db,
            username=login_data.username,
            password=login_data.password
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type=token_type,
            user=user
        )
    
    @staticmethod
    def get_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> dict:
        """
        Handle OAuth2 compatible token endpoint for FastAPI docs authorization.
        
        Args:
            form_data: OAuth2 form data
            db: Database session
            
        Returns:
            Token dictionary with access_token and token_type
        """
        access_token, token_type, user = AuthService.login_user(
            db=db,
            username=form_data.username,
            password=form_data.password
        )
        
        return {
            "access_token": access_token,
            "token_type": token_type
        }
    
    @staticmethod
    def read_current_user(current_user: User = Depends(get_current_user)) -> UserResponse:
        """
        Get current authenticated user information.
        
        Args:
            current_user: Current authenticated user
            
        Returns:
            UserResponse with current user data
        """
        return current_user
    
    @staticmethod
    def get_all_users(
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> List[UserResponse]:
        """
        Get all users (admin only).
        
        Args:
            skip: Pagination offset
            limit: Pagination limit
            db: Database session
            current_admin: Current authenticated admin user
            
        Returns:
            List of UserResponse objects
        """
        users = AuthDAO.get_all_users(db, skip=skip, limit=limit)
        return users
    
    @staticmethod
    def get_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> UserResponse:
        """
        Get specific user by ID (admin only).
        
        Args:
            user_id: ID of user to retrieve
            db: Database session
            current_admin: Current authenticated admin user
            
        Returns:
            UserResponse with user data
            
        Raises:
            HTTPException: If user not found
        """
        user = AuthDAO.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    
    @staticmethod
    def update_user(
        user_id: int,
        user_update: UserUpdate,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> UserResponse:
        """
        Update user information (admin only).
        
        Args:
            user_id: ID of user to update
            user_update: Updated user data
            db: Database session
            current_admin: Current authenticated admin user
            
        Returns:
            UserResponse with updated user data
            
        Raises:
            HTTPException: If user not found or email already exists
        """
        user = AuthDAO.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = AuthService.update_user(
            db=db,
            user=user,
            username=user_update.username,
            email=user_update.email,
            password=user_update.password,
            is_admin=user_update.is_admin
        )
        return updated_user
    
    @staticmethod
    def delete_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> None:
        """
        Delete a user (admin only).
        
        Args:
            user_id: ID of user to delete
            db: Database session
            current_admin: Current authenticated admin user
            
        Raises:
            HTTPException: If user not found
        """
        user = AuthDAO.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        AuthDAO.delete_user(db, user)
        return None
    
    @staticmethod
    def register_admin(
        admin: AdminCreate,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> AdminResponse:
        """
        Create a new admin account (admin only).
        
        Args:
            admin: Admin creation data
            db: Database session
            current_admin: Current authenticated admin user
            
        Returns:
            AdminResponse with created admin data
        """
        created_admin = AuthService.create_admin(
            db=db,
            username=admin.username,
            email=admin.email,
            password=admin.password,
            is_active=admin.is_active
        )
        return created_admin
