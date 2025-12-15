from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import timedelta
from backend.database import get_db, User
from backend.auth_utils import (
    get_password_hash, 
    authenticate_user, 
    create_access_token,
    get_current_user,
    get_current_admin_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/admins", tags=["Admin Management"])

# Pydantic Models for Request/Response
class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_active: bool = True

class AdminUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class AdminResponse(BaseModel):
    user_id: int
    username: str
    email: str
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: AdminResponse


class LoginRequest(BaseModel):
    username: str
    password: str


# REGISTER - Create a new admin account
@router.post("/register", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(
    admin: AdminCreate, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Create a new admin account. Requires admin authentication.
    """
    # Check if username already exists
    db_admin_username = db.query(User).filter(User.username == admin.username).first()
    if db_admin_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_admin_email = db.query(User).filter(User.email == admin.email).first()
    if db_admin_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password before storing
    hashed_password = get_password_hash(admin.password)
    
    # Create new admin user
    new_admin = User(
        username=admin.username,
        email=admin.email,
        password=hashed_password,
        is_admin=True,  # Always set to True for admin creation
        is_active=admin.is_active
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


# LOGIN - Authenticate admin and get access token
@router.post("/login", response_model=TokenResponse)
def admin_login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate admin user and return JWT access token.
    """
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is admin
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.user_id), "username": user.username, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


# GET CURRENT ADMIN - Get currently authenticated admin
@router.get("/me", response_model=AdminResponse)
async def read_admin_me(current_admin: User = Depends(get_current_admin_user)):
    """
    Get current authenticated admin information.
    Requires valid JWT token with admin privileges in Authorization header.
    """
    return current_admin


# READ - Get all admins
@router.get("/", response_model=List[AdminResponse])
def get_all_admins(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get all admin users. Requires admin authentication.
    """
    admins = db.query(User).filter(User.is_admin == True).offset(skip).limit(limit).all()
    return admins


# READ - Get a specific admin by ID
@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(
    admin_id: int, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get specific admin by ID. Requires admin authentication.
    """
    admin = db.query(User).filter(User.user_id == admin_id, User.is_admin == True).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin


# READ - Get active admins only
@router.get("/active/list", response_model=List[AdminResponse])
def get_active_admins(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get all active admins. Requires admin authentication.
    """
    admins = db.query(User).filter(User.is_admin == True, User.is_active == True).all()
    return admins


# UPDATE - Update an admin
@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(
    admin_id: int, 
    admin_update: AdminUpdate, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update admin information. Requires admin authentication.
    """
    admin = db.query(User).filter(User.user_id == admin_id, User.is_admin == True).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Update only provided fields
    if admin_update.username is not None:
        # Check if new username already exists
        existing = db.query(User).filter(User.username == admin_update.username, User.user_id != admin_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already registered")
        admin.username = admin_update.username
    if admin_update.email is not None:
        # Check if new email already exists
        existing = db.query(User).filter(User.email == admin_update.email, User.user_id != admin_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        admin.email = admin_update.email
    if admin_update.password is not None:
        admin.password = get_password_hash(admin_update.password)
    if admin_update.is_active is not None:
        admin.is_active = admin_update.is_active
    
    db.commit()
    db.refresh(admin)
    return admin


# DELETE - Delete an admin
@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(
    admin_id: int, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete an admin. Requires admin authentication.
    """
    admin = db.query(User).filter(User.user_id == admin_id, User.is_admin == True).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    db.delete(admin)
    db.commit()
    return None
