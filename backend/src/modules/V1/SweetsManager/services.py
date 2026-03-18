"""
Sweets manager services layer.
Contains business logic for sweets management and inventory operations.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..AuthManager.models import User
from .models import Sweet, Transaction
from ....app.utility import upload_sweet_image, delete_sweet_image
from .dao import SweetsDAO


class SweetsService:
    """Service layer for sweets operations."""
    
    @staticmethod
    async def create_sweet(db: Session, name: str, category: str, price: float, 
                          quantity_in_stock: int, description: str = None, 
                          image=None) -> Sweet:
        """
        Create a new sweet with optional image upload.
        
        Args:
            db: Database session
            name: Sweet name
            category: Sweet category
            price: Sweet price
            quantity_in_stock: Initial stock quantity
            description: Sweet description
            image: Optional image file to upload
            
        Returns:
            Created Sweet object
            
        Raises:
            HTTPException: If sweet already exists or image upload fails
        """
        # Check if sweet name already exists
        if SweetsDAO.check_sweet_name_exists(db, name):
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
            description=description,
            image_url=image_url,
            image_id=image_id
        )
        
        return SweetsDAO.create_sweet(db, new_sweet)
    
    @staticmethod
    def update_sweet(db: Session, sweet: Sweet, name: str = None, category: str = None,
                    price: float = None, quantity_in_stock: int = None, 
                    description: str = None) -> Sweet:
        """
        Update sweet information.
        
        Args:
            db: Database session
            sweet: Sweet object to update
            name: New name (optional)
            category: New category (optional)
            price: New price (optional)
            quantity_in_stock: New stock quantity (optional)
            description: New description (optional)
            
        Returns:
            Updated Sweet object
            
        Raises:
            HTTPException: If new name already exists
        """
        # Check new name doesn't already exist
        if name is not None:
            if SweetsDAO.check_sweet_name_exists(db, name, exclude_sweet_id=sweet.sweet_id):
                raise HTTPException(status_code=400, detail="Sweet with this name already exists")
            sweet.name = name
        
        if category is not None:
            sweet.category = category
        
        if price is not None:
            sweet.price = price
        
        if quantity_in_stock is not None:
            sweet.quantity_in_stock = quantity_in_stock
        
        if description is not None:
            sweet.description = description
        
        return SweetsDAO.update_sweet(db, sweet)
    
    @staticmethod
    async def update_sweet_image(db: Session, sweet: Sweet, image) -> Sweet:
        """
        Update or add image to a sweet.
        
        Args:
            db: Database session
            sweet: Sweet object
            image: Image file to upload
            
        Returns:
            Updated Sweet object
            
        Raises:
            HTTPException: If image upload fails
        """
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
            
            return SweetsDAO.update_sweet(db, sweet)
        except HTTPException as e:
            raise e
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")
    
    @staticmethod
    def delete_sweet_image(db: Session, sweet: Sweet) -> None:
        """
        Remove image from a sweet.
        
        Args:
            db: Database session
            sweet: Sweet object
            
        Raises:
            HTTPException: If sweet has no image
        """
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
        SweetsDAO.update_sweet(db, sweet)
    
    @staticmethod
    def purchase_sweet(db: Session, sweet: Sweet, quantity: int, current_user: User) -> Transaction:
        """
        Process a sweet purchase (decrease quantity).
        
        Args:
            db: Database session
            sweet: Sweet object
            quantity: Quantity to purchase
            current_user: User making the purchase
            
        Returns:
            Created Transaction object
            
        Raises:
            HTTPException: If insufficient stock
        """
        # Check if enough quantity in stock
        if sweet.quantity_in_stock < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {sweet.quantity_in_stock}, Requested: {quantity}"
            )
        
        # Decrease quantity
        sweet.quantity_in_stock -= quantity
        
        # Create transaction record
        transaction = Transaction(
            sweet_id=sweet.sweet_id,
            user_id=current_user.user_id,
            transaction_type="purchase",
            quantity=quantity,
            price_at_time=sweet.price
        )
        
        SweetsDAO.update_sweet(db, sweet)
        return SweetsDAO.create_transaction(db, transaction)
    
    @staticmethod
    def restock_sweet(db: Session, sweet: Sweet, quantity: int, current_admin: User) -> Transaction:
        """
        Process a sweet restock (increase quantity).
        
        Args:
            db: Database session
            sweet: Sweet object
            quantity: Quantity to restock
            current_admin: Admin performing restock
            
        Returns:
            Created Transaction object
        """
        # Increase quantity
        sweet.quantity_in_stock += quantity
        
        # Create transaction record
        transaction = Transaction(
            sweet_id=sweet.sweet_id,
            user_id=current_admin.user_id,
            transaction_type="restock",
            quantity=quantity,
            price_at_time=sweet.price
        )
        
        SweetsDAO.update_sweet(db, sweet)
        return SweetsDAO.create_transaction(db, transaction)
