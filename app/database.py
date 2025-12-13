from sqlalchemy import create_engine, Column, Integer, String, Boolean, Float, DateTime, CheckConstraint, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    """
    User model for authentication and authorization.
    Supports both regular users and admins through the is_admin flag.
    """
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)  # Will store hashed password
    is_admin = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

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

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




