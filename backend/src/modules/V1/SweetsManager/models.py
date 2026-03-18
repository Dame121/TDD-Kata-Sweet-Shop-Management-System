"""
SweetsManager models for products and transactions.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, CheckConstraint, Text, ForeignKey
from datetime import datetime
from ....app.database import Base


class Sweet(Base):
    """
    Sweet model representing products in the shop.
    Contains all necessary information including inventory management.
    """
    __tablename__ = "sweets"
    sweet_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)  # Optional description for better UX
    price = Column(Float, nullable=False)
    quantity_in_stock = Column(Integer, nullable=False, default=0)
    image_url = Column(String(500), nullable=True)  # ImageKit URL
    image_id = Column(String(255), nullable=True)  # ImageKit file ID for deletion
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Add constraints for data integrity
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_positive'),
        CheckConstraint('quantity_in_stock >= 0', name='check_quantity_non_negative'),
    )


class Transaction(Base):
    """
    Records all purchase and restock transactions for audit and reporting.
    """
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True, index=True)
    sweet_id = Column(Integer, ForeignKey('sweets.sweet_id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=True)  # Null for restocks
    transaction_type = Column(String(20), nullable=False)  # 'purchase' or 'restock'
    quantity = Column(Integer, nullable=False)
    price_at_time = Column(Float, nullable=False)  # Price when purchased
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
