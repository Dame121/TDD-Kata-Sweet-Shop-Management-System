"""
Authentication manager schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    username: str
    email: EmailStr
    password: str
    is_admin: bool = False


class UserUpdate(BaseModel):
    """Schema for user updates."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    user_id: int
    username: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str
    user: Optional[UserResponse] = None


class LoginRequest(BaseModel):
    """Schema for login request."""
    username: str
    password: str


class AdminCreate(BaseModel):
    """Schema for admin registration."""
    username: str
    email: EmailStr
    password: str
    is_active: bool = True


class AdminUpdate(BaseModel):
    """Schema for admin updates."""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


class AdminResponse(BaseModel):
    """Schema for admin response."""
    user_id: int
    username: str
    email: str
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True
