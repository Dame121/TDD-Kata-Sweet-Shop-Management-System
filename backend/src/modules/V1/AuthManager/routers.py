"""
Authentication manager router.
Defines API endpoints for authentication and user management.
"""
from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ....app.database import get_db
from ....app.auth import get_current_user, get_current_admin_user
from .models import User
from .schemas import (
    UserCreate, UserUpdate, UserResponse, TokenResponse, LoginRequest,
    AdminCreate, AdminResponse
)
from .controller import AuthController

router = APIRouter(prefix="/auth", tags=["Authentication & Users"])


# ==================== USER ENDPOINTS ====================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    return AuthController.register_user(user, db)


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    return AuthController.login(login_data, db)
    


@router.post("/token")
def get_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible token endpoint for FastAPI docs authorization."""
    return AuthController.get_token(form_data, db)


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return AuthController.read_current_user(current_user)


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all users. Requires admin authentication."""
    return AuthController.get_all_users(skip, limit, db, current_admin)


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get specific user by ID. Requires admin authentication."""
    return AuthController.get_user(user_id, db, current_admin)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update user information. Requires admin authentication."""
    return AuthController.update_user(user_id, user_update, db, current_admin)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete a user. Requires admin authentication."""
    return AuthController.delete_user(user_id, db, current_admin)


# ==================== ADMIN ENDPOINTS ====================

@router.post("/admins/register", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def register_admin(
    admin: AdminCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Create a new admin account. Requires admin authentication."""
    return AuthController.register_admin(admin, db, current_admin)
