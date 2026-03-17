"""
Sweets manager schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class SweetCreate(BaseModel):
    """Schema for sweet creation."""
    name: str
    category: str
    price: float
    quantity_in_stock: int = 0
    description: Optional[str] = None


class SweetUpdate(BaseModel):
    """Schema for sweet updates."""
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity_in_stock: Optional[int] = None
    description: Optional[str] = None


class SweetResponse(BaseModel):
    """Schema for sweet response."""
    sweet_id: int
    name: str
    category: str
    price: float
    quantity_in_stock: int
    description: Optional[str] = None
    image_url: Optional[str] = None
    image_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PurchaseRequest(BaseModel):
    """Schema for purchase request."""
    quantity: int = Field(..., gt=0, description="Quantity to purchase (must be greater than 0)")


class RestockRequest(BaseModel):
    """Schema for restock request."""
    quantity: int = Field(..., gt=0, description="Quantity to restock (must be greater than 0)")


class TransactionResponse(BaseModel):
    """Schema for transaction response."""
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
