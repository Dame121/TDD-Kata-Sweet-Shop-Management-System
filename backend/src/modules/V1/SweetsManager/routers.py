"""
Sweets manager router.
Defines API endpoints for sweets inventory management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session

from ....app.database import get_db, User
from ....app.auth import get_current_user, get_current_admin_user
from .schemas import (
    SweetCreate, SweetUpdate, SweetResponse, PurchaseRequest,
    RestockRequest, TransactionResponse
)
from .controller import SweetsController

router = APIRouter(prefix="/sweets", tags=["Sweets"])


# CREATE - Add a new sweet (Admin only)
@router.post("/", response_model=SweetResponse, status_code=status.HTTP_201_CREATED)
async def create_sweet(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    quantity_in_stock: int = Form(0),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Add a new sweet to the inventory with optional image. Requires admin authentication."""
    return await SweetsController.create_sweet(
        name, category, price, quantity_in_stock, description, image, db, current_admin
    )


# READ - Get all sweets
@router.get("/", response_model=List[SweetResponse])
def get_all_sweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all sweets with pagination."""
    return SweetsController.get_all_sweets(skip, limit, db)


# READ - Search sweets (must be before /{sweet_id} to avoid route collision)
@router.get("/search", response_model=List[SweetResponse])
def search_sweets(
    query: Optional[str] = Query(None, description="Search by sweet name (partial match)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search for sweets with optional filters."""
    return SweetsController.search_sweets(query, category, min_price, max_price, skip, limit, db)


# READ - Get sweets by category (must be before /{sweet_id} to avoid route collision)
@router.get("/category/{category}", response_model=List[SweetResponse])
def get_sweets_by_category(category: str, db: Session = Depends(get_db)):
    """Get all sweets in a specific category."""
    return SweetsController.get_sweets_by_category(category, db)


# READ - Get a specific sweet by ID
@router.get("/{sweet_id}", response_model=SweetResponse)
def get_sweet(sweet_id: int, db: Session = Depends(get_db)):
    """Get a specific sweet by ID."""
    return SweetsController.get_sweet(sweet_id, db)


# UPDATE - Update a sweet (Admin only)
@router.put("/{sweet_id}", response_model=SweetResponse)
def update_sweet(
    sweet_id: int,
    sweet_update: SweetUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a sweet's details. Requires admin authentication."""
    return SweetsController.update_sweet(sweet_id, sweet_update, db, current_admin)


# DELETE - Delete a sweet (Admin only)
@router.delete("/{sweet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet(
    sweet_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete a sweet from the inventory. Requires admin authentication."""
    return SweetsController.delete_sweet(sweet_id, db, current_admin)


# UPDATE IMAGE - Update a sweet's image (Admin only)
@router.put("/{sweet_id}/image", response_model=SweetResponse)
async def update_sweet_image(
    sweet_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update or add an image to a sweet. Requires admin authentication."""
    return await SweetsController.update_sweet_image(sweet_id, image, db, current_admin)


# DELETE IMAGE - Remove a sweet's image (Admin only)
@router.delete("/{sweet_id}/image", status_code=status.HTTP_204_NO_CONTENT)
def delete_sweet_image_endpoint(
    sweet_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Remove the image from a sweet. Requires admin authentication."""
    return SweetsController.delete_sweet_image_endpoint(sweet_id, db, current_admin)


# PURCHASE - Purchase a sweet (decrease quantity)
@router.post("/{sweet_id}/purchase", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def purchase_sweet(
    sweet_id: int,
    purchase_data: PurchaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Purchase a sweet, decreasing its quantity in stock. Requires authentication."""
    return SweetsController.purchase_sweet(sweet_id, purchase_data, db, current_user)


# RESTOCK - Restock a sweet (increase quantity) - Admin only
@router.post("/{sweet_id}/restock", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def restock_sweet(
    sweet_id: int,
    restock_data: RestockRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Restock a sweet, increasing its quantity in stock. Requires admin authentication."""
    return SweetsController.restock_sweet(sweet_id, restock_data, db, current_admin)
