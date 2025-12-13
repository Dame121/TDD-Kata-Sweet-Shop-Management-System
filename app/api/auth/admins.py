from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.database import get_db, Admin

router = APIRouter(prefix="/admins", tags=["Admin Management"])

# Pydantic Models for Request/Response
class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: str = "admin"
    is_active: bool = True

class AdminUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class AdminResponse(BaseModel):
    admin_id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# CREATE - Add a new admin
@router.post("/", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
def create_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_admin_username = db.query(Admin).filter(Admin.username == admin.username).first()
    if db_admin_username:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email already exists
    db_admin_email = db.query(Admin).filter(Admin.email == admin.email).first()
    if db_admin_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new admin
    new_admin = Admin(
        username=admin.username,
        email=admin.email,
        password=admin.password,  # In production, hash this password!
        full_name=admin.full_name,
        role=admin.role,
        is_active=admin.is_active
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin


# READ - Get all admins
@router.get("/", response_model=List[AdminResponse])
def get_all_admins(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    admins = db.query(Admin).offset(skip).limit(limit).all()
    return admins


# READ - Get a specific admin by ID
@router.get("/{admin_id}", response_model=AdminResponse)
def get_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin


# READ - Get active admins only
@router.get("/active/list", response_model=List[AdminResponse])
def get_active_admins(db: Session = Depends(get_db)):
    admins = db.query(Admin).filter(Admin.is_active == True).all()
    return admins


# UPDATE - Update an admin
@router.put("/{admin_id}", response_model=AdminResponse)
def update_admin(admin_id: int, admin_update: AdminUpdate, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    # Update only provided fields
    if admin_update.username is not None:
        # Check if new username already exists
        existing = db.query(Admin).filter(Admin.username == admin_update.username, Admin.admin_id != admin_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already registered")
        admin.username = admin_update.username
    if admin_update.email is not None:
        # Check if new email already exists
        existing = db.query(Admin).filter(Admin.email == admin_update.email, Admin.admin_id != admin_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        admin.email = admin_update.email
    if admin_update.password is not None:
        admin.password = admin_update.password  # In production, hash this!
    if admin_update.full_name is not None:
        admin.full_name = admin_update.full_name
    if admin_update.role is not None:
        admin.role = admin_update.role
    if admin_update.is_active is not None:
        admin.is_active = admin_update.is_active
    
    db.commit()
    db.refresh(admin)
    return admin


# DELETE - Delete an admin
@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.admin_id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    db.delete(admin)
    db.commit()
    return None
