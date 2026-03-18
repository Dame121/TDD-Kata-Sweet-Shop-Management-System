"""
Sweets manager controller layer.
Handles request/response processing for sweets endpoints.
"""
from typing import List, Optional
from fastapi import HTTPException, status, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from ....app.database import get_db
from ....app.auth import get_current_user, get_current_admin_user
from ..AuthManager.models import User
from .models import Sweet
from .schemas import (
    SweetCreate, SweetUpdate, SweetResponse, PurchaseRequest,
    RestockRequest, TransactionResponse
)
from .services import SweetsService
from .dao import SweetsDAO


class SweetsController:
    """Controller for handling sweets requests and responses."""
    
    @staticmethod
    async def create_sweet(
        name: str = Form(...),
        category: str = Form(...),
        price: float = Form(...),
        quantity_in_stock: int = Form(0),
        description: Optional[str] = Form(None),
        image: Optional[UploadFile] = File(None),
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> Sweet:
        """Handle sweet creation with optional image upload."""
        return await SweetsService.create_sweet(
            db=db,
            name=name,
            category=category,
            price=price,
            quantity_in_stock=quantity_in_stock,
            description=description,
            image=image
        )
    
    @staticmethod
    def get_all_sweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)) -> List[Sweet]:
        """Get all sweets with pagination."""
        return SweetsDAO.get_all_sweets(db, skip=skip, limit=limit)
    
    @staticmethod
    def search_sweets(
        query: Optional[str] = Query(None, description="Search by sweet name (partial match)"),
        category: Optional[str] = Query(None, description="Filter by category"),
        min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
        max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
        skip: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=100),
        db: Session = Depends(get_db)
    ) -> List[Sweet]:
        """Search for sweets with optional filters."""
        return SweetsDAO.search_sweets(
            db=db,
            query=query,
            category=category,
            min_price=min_price,
            max_price=max_price,
            skip=skip,
            limit=limit
        )
    
    @staticmethod
    def get_sweets_by_category(category: str, db: Session = Depends(get_db)) -> List[Sweet]:
        """Get all sweets in a specific category."""
        sweets = SweetsDAO.get_sweets_by_category(db, category)
        if not sweets:
            raise HTTPException(status_code=404, detail="No sweets found in this category")
        return sweets
    
    @staticmethod
    def get_sweet(sweet_id: int, db: Session = Depends(get_db)) -> Sweet:
        """Get a specific sweet by ID."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        return sweet
    
    @staticmethod
    def update_sweet(
        sweet_id: int,
        sweet_update: SweetUpdate,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> Sweet:
        """Update a sweet's details."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        return SweetsService.update_sweet(
            db=db,
            sweet=sweet,
            name=sweet_update.name,
            category=sweet_update.category,
            price=sweet_update.price,
            quantity_in_stock=sweet_update.quantity_in_stock,
            description=sweet_update.description
        )
    
    @staticmethod
    def delete_sweet(
        sweet_id: int,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> None:
        """Delete a sweet from the inventory."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        # Delete image from ImageKit if it exists
        if sweet.image_id:
            try:
                from ...app.utility import delete_sweet_image
                delete_sweet_image(sweet.image_id)
            except Exception as e:
                print(f"Warning: Failed to delete image from ImageKit: {str(e)}")
        
        SweetsDAO.delete_sweet(db, sweet)
        return None
    
    @staticmethod
    async def update_sweet_image(
        sweet_id: int,
        image: UploadFile = File(...),
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> Sweet:
        """Update or add an image to a sweet."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        return await SweetsService.update_sweet_image(db, sweet, image)
    
    @staticmethod
    def delete_sweet_image_endpoint(
        sweet_id: int,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> None:
        """Remove the image from a sweet."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        SweetsService.delete_sweet_image(db, sweet)
        return None
    
    @staticmethod
    def purchase_sweet(
        sweet_id: int,
        purchase_data: PurchaseRequest,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> TransactionResponse:
        """Purchase a sweet (decrease quantity)."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        transaction = SweetsService.purchase_sweet(db, sweet, purchase_data.quantity, current_user)
        
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
    
    @staticmethod
    def restock_sweet(
        sweet_id: int,
        restock_data: RestockRequest,
        db: Session = Depends(get_db),
        current_admin: User = Depends(get_current_admin_user)
    ) -> TransactionResponse:
        """Restock a sweet (increase quantity)."""
        sweet = SweetsDAO.get_sweet_by_id(db, sweet_id)
        if not sweet:
            raise HTTPException(status_code=404, detail="Sweet not found")
        
        transaction = SweetsService.restock_sweet(db, sweet, restock_data.quantity, current_admin)
        
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
