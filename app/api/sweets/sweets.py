from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db, Sweet

router = APIRouter(prefix="/sweets", tags=["Sweets"])

# Pydantic Models for Request/Response
class SweetCreate(BaseModel):
    name: str
    category: str
    price: float
    quantity_in_stock: int = 0

class SweetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity_in_stock: Optional[int] = None

class SweetResponse(BaseModel):
    sweet_id: int
    name: str
    category: str
    price: float
    quantity_in_stock: int

    class Config:
        from_attributes = True


# CREATE - Add a new sweet
@router.post("/", response_model=SweetResponse, status_code=status.HTTP_201_CREATED)
def create_sweet(sweet: SweetCreate, db: Session = Depends(get_db)):
    # Check if sweet name already exists
    db_sweet = db.query(Sweet).filter(Sweet.name == sweet.name).first()
    if db_sweet:
        raise HTTPException(status_code=400, detail="Sweet with this name already exists")
    
    # Create new sweet
    new_sweet = Sweet(
        name=sweet.name,
        category=sweet.category,
        price=sweet.price,
        quantity_in_stock=sweet.quantity_in_stock
    )
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return new_sweet


# READ - Get all sweets
@router.get("/", response_model=List[SweetResponse])
def get_all_sweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sweets = db.query(Sweet).offset(skip).limit(limit).all()
    return sweets


# READ - Get a specific sweet by ID
@router.get("/{sweet_id}", response_model=SweetResponse)
def get_sweet(sweet_id: int, db: Session = Depends(get_db)):
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    return sweet


# READ - Get sweets by category
@router.get("/category/{category}", response_model=List[SweetResponse])
def get_sweets_by_category(category: str, db: Session = Depends(get_db)):
    sweets = db.query(Sweet).filter(Sweet.category == category).all()
    if not sweets:
        raise HTTPException(status_code=404, detail="No sweets found in this category")
    return sweets


# UPDATE - Update a sweet
@router.put("/{sweet_id}", response_model=SweetResponse)
def update_sweet(sweet_id: int, sweet_update: SweetUpdate, db: Session = Depends(get_db)):
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Update only provided fields
    if sweet_update.name is not None:
        # Check if new name already exists
        existing = db.query(Sweet).filter(Sweet.name == sweet_update.name, Sweet.sweet_id != sweet_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Sweet with this name already exists")
        sweet.name = sweet_update.name
    if sweet_update.category is not None:
        sweet.category = sweet_update.category
    if sweet_update.price is not None:
        sweet.price = sweet_update.price
    if sweet_update.quantity_in_stock is not None:
        sweet.quantity_in_stock = sweet_update.quantity_in_stock
    
    db.commit()
    db.refresh(sweet)
    return sweet


# DELETE - Delete a sweet
@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(sweet_id: int, db: Session = Depends(get_db)):
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    db.delete(sweet)
    db.commit()
    return None
