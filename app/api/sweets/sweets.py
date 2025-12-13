from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.database import get_db, Sweet, Transaction, User
from app.auth_utils import get_current_user, get_current_admin_user
from app.imagekit_utils import upload_sweet_image, delete_sweet_image

router = APIRouter(prefix="/api/sweets", tags=["Sweets"])

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
    image_url: Optional[str] = None
    image_id: Optional[str] = None

    class Config:
        from_attributes = True


class PurchaseRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity to purchase (must be greater than 0)")


class RestockRequest(BaseModel):
    quantity: int = Field(..., gt=0, description="Quantity to restock (must be greater than 0)")


class TransactionResponse(BaseModel):
    transaction_id: int
    sweet_id: int
    user_id: Optional[int]
    transaction_type: str
    quantity: int
    price_at_time: float
    created_at: datetime
    message: str
    new_stock: int

    class Config:
        from_attributes = True


# CREATE - Add a new sweet (Admin only)
@router.post("/", response_model=SweetResponse, status_code=status.HTTP_201_CREATED)
async def create_sweet(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    quantity_in_stock: int = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Add a new sweet to the inventory with optional image.
    Requires admin authentication.
    """
    # Check if sweet name already exists
    db_sweet = db.query(Sweet).filter(Sweet.name == name).first()
    if db_sweet:
        raise HTTPException(status_code=400, detail="Sweet with this name already exists")
    
    # Handle image upload if provided
    image_url = None
    image_id = None
    if image:
        try:
            upload_result = await upload_sweet_image(image, name)
            image_url = upload_result["url"]
            image_id = upload_result["file_id"]
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    
    # Create new sweet
    new_sweet = Sweet(
        name=name,
        category=category,
        price=price,
        quantity_in_stock=quantity_in_stock,
        image_url=image_url,
        image_id=image_id
    )
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return new_sweet


# SEARCH - Search sweets by name, category, or price range
@router.get("/search", response_model=List[SweetResponse])
def search_sweets(
    name: Optional[str] = Query(None, description="Search by sweet name (partial match)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search for sweets with optional filters:
    - name: Partial match (case-insensitive)
    - category: Exact match (case-insensitive)
    - min_price: Minimum price filter
    - max_price: Maximum price filter
    """
    query = db.query(Sweet)
    
    # Apply filters if provided
    filters = []
    
    if name:
        filters.append(Sweet.name.ilike(f"%{name}%"))
    
    if category:
        filters.append(Sweet.category.ilike(f"%{category}%"))
    
    if min_price is not None:
        filters.append(Sweet.price >= min_price)
    
    if max_price is not None:
        filters.append(Sweet.price <= max_price)
    
    # Apply all filters
    if filters:
        query = query.filter(and_(*filters))
    
    sweets = query.offset(skip).limit(limit).all()
    return sweets


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


# UPDATE - Update a sweet (Admin only)
@router.put("/{sweet_id}", response_model=SweetResponse)
def update_sweet(
    sweet_id: int,
    sweet_update: SweetUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a sweet's details.
    Requires admin authentication.
    """
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


# DELETE - Delete a sweet (Admin only)
@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(
    sweet_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete a sweet from the inventory and its image from ImageKit.
    Requires admin authentication.
    """
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Delete image from ImageKit if it exists
    if sweet.image_id:
        try:
            delete_sweet_image(sweet.image_id)
        except Exception as e:
            # Log error but continue with deletion
            print(f"Warning: Failed to delete image from ImageKit: {str(e)}")
    
    db.delete(sweet)
    db.commit()
    return None


# UPDATE IMAGE - Update a sweet's image (Admin only)
@router.put("/{sweet_id}/image", response_model=SweetResponse)
async def update_sweet_image(
    sweet_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update or add an image to a sweet.
    Requires admin authentication.
    """
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Delete old image if exists
    if sweet.image_id:
        try:
            delete_sweet_image(sweet.image_id)
        except Exception as e:
            print(f"Warning: Failed to delete old image: {str(e)}")
    
    # Upload new image
    try:
        upload_result = await upload_sweet_image(image, sweet.name)
        sweet.image_url = upload_result["url"]
        sweet.image_id = upload_result["file_id"]
        
        db.commit()
        db.refresh(sweet)
        return sweet
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


# DELETE IMAGE - Remove a sweet's image (Admin only)
@router.delete("/{sweet_id}/image", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet_image_endpoint(
    sweet_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Remove the image from a sweet.
    Requires admin authentication.
    """
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    if not sweet.image_id:
        raise HTTPException(status_code=404, detail="Sweet has no image")
    
    # Delete image from ImageKit
    try:
        delete_sweet_image(sweet.image_id)
    except Exception as e:
        print(f"Warning: Failed to delete image from ImageKit: {str(e)}")
    
    # Remove image references from database
    sweet.image_url = None
    sweet.image_id = None
    db.commit()
    
    return None


# PURCHASE - Purchase a sweet (decrease quantity)
@router.post("/{sweet_id}/purchase", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def purchase_sweet(
    sweet_id: int,
    purchase_data: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Purchase a sweet, decreasing its quantity in stock.
    Requires authentication.
    Creates a transaction record for audit purposes.
    """
    # Get the sweet
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Check if enough quantity in stock
    if sweet.quantity_in_stock < purchase_data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {sweet.quantity_in_stock}, Requested: {purchase_data.quantity}"
        )
    
    # Decrease quantity
    sweet.quantity_in_stock -= purchase_data.quantity
    
    # Create transaction record
    transaction = Transaction(
        sweet_id=sweet_id,
        user_id=current_user.user_id,
        transaction_type="purchase",
        quantity=purchase_data.quantity,
        price_at_time=sweet.price
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    db.refresh(sweet)
    
    return TransactionResponse(
        transaction_id=transaction.transaction_id,
        sweet_id=transaction.sweet_id,
        user_id=transaction.user_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        price_at_time=transaction.price_at_time,
        created_at=transaction.created_at,
        message=f"Successfully purchased {purchase_data.quantity} unit(s) of {sweet.name}",
        new_stock=sweet.quantity_in_stock
    )


# RESTOCK - Restock a sweet (increase quantity) - Admin only
@router.post("/{sweet_id}/restock", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def restock_sweet(
    sweet_id: int,
    restock_data: RestockRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Restock a sweet, increasing its quantity in stock.
    Requires admin authentication.
    Creates a transaction record for audit purposes.
    """
    # Get the sweet
    sweet = db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    
    # Increase quantity
    sweet.quantity_in_stock += restock_data.quantity
    
    # Create transaction record
    transaction = Transaction(
        sweet_id=sweet_id,
        user_id=current_admin.user_id,
        transaction_type="restock",
        quantity=restock_data.quantity,
        price_at_time=sweet.price
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    db.refresh(sweet)
    
    return TransactionResponse(
        transaction_id=transaction.transaction_id,
        sweet_id=transaction.sweet_id,
        user_id=transaction.user_id,
        transaction_type=transaction.transaction_type,
        quantity=transaction.quantity,
        price_at_time=transaction.price_at_time,
        created_at=transaction.created_at,
        message=f"Successfully restocked {restock_data.quantity} unit(s) of {sweet.name}",
        new_stock=sweet.quantity_in_stock
    )
