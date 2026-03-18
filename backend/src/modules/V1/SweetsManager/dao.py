"""
Sweets manager database access object (DAO) layer.
Handles all database queries related to sweets and transactions.
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from .models import Sweet, Transaction


class SweetsDAO:
    """Data Access Object for sweets operations."""
    
    @staticmethod
    def get_sweet_by_id(db: Session, sweet_id: int) -> Optional[Sweet]:
        """Get sweet by ID."""
        return db.query(Sweet).filter(Sweet.sweet_id == sweet_id).first()
    
    @staticmethod
    def get_sweet_by_name(db: Session, name: str) -> Optional[Sweet]:
        """Get sweet by name."""
        return db.query(Sweet).filter(Sweet.name == name).first()
    
    @staticmethod
    def get_all_sweets(db: Session, skip: int = 0, limit: int = 100) -> List[Sweet]:
        """Get all sweets with pagination."""
        return db.query(Sweet).offset(skip).limit(limit).all()
    
    @staticmethod
    def search_sweets(db: Session, query: Optional[str] = None, category: Optional[str] = None,
                     min_price: Optional[float] = None, max_price: Optional[float] = None,
                     skip: int = 0, limit: int = 100) -> List[Sweet]:
        """Search sweets with optional filters."""
        db_query = db.query(Sweet)
        
        filters = []
        
        if query:
            filters.append(Sweet.name.ilike(f"%{query}%"))
        
        if category:
            filters.append(Sweet.category.ilike(f"%{category}%"))
        
        if min_price is not None:
            filters.append(Sweet.price >= min_price)
        
        if max_price is not None:
            filters.append(Sweet.price <= max_price)
        
        if filters:
            db_query = db_query.filter(and_(*filters))
        
        return db_query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_sweets_by_category(db: Session, category: str) -> List[Sweet]:
        """Get all sweets in a specific category."""
        return db.query(Sweet).filter(Sweet.category == category).all()
    
    @staticmethod
    def create_sweet(db: Session, sweet: Sweet) -> Sweet:
        """Create a new sweet."""
        db.add(sweet)
        db.commit()
        db.refresh(sweet)
        return sweet
    
    @staticmethod
    def update_sweet(db: Session, sweet: Sweet) -> Sweet:
        """Update an existing sweet."""
        db.commit()
        db.refresh(sweet)
        return sweet
    
    @staticmethod
    def delete_sweet(db: Session, sweet: Sweet) -> None:
        """Delete a sweet."""
        db.delete(sweet)
        db.commit()
    
    @staticmethod
    def check_sweet_name_exists(db: Session, name: str, exclude_sweet_id: Optional[int] = None) -> bool:
        """Check if sweet name already exists (optionally excluding a specific sweet)."""
        query = db.query(Sweet).filter(Sweet.name == name)
        if exclude_sweet_id:
            query = query.filter(Sweet.sweet_id != exclude_sweet_id)
        return query.first() is not None
    
    @staticmethod
    def create_transaction(db: Session, transaction: Transaction) -> Transaction:
        """Create a new transaction record."""
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction
