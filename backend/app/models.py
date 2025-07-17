from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Association table for expense participants
expense_participants = Table(
    'expense_participants',
    Base.metadata,
    Column('expense_id', Integer, ForeignKey('expenses.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(100), nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ideas = relationship("Idea", back_populates="author")
    alerts = relationship("Alert", back_populates="author")
    marketplace_items = relationship("MarketplaceItem",back_populates="seller", foreign_keys="[MarketplaceItem.seller_id]")
    created_expenses = relationship("Expense", back_populates="created_by")
    participated_expenses = relationship("Expense", secondary=expense_participants, back_populates="participants")

class Idea(Base):
    __tablename__ = "ideas"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # environment, education, health, etc.
    status = Column(String(20), default="pending")  # pending, approved, rejected, implemented
    votes_up = Column(Integer, default=0)
    votes_down = Column(Integer, default=0)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    author = relationship("User", back_populates="ideas")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    alert_type = Column(String(50), nullable=False)  # theft, robbery, emergency, suspicious_activity
    location = Column(String(200), nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    status = Column(String(20), default="active")  # active, resolved, false_alarm
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)
    
    # Relationships
    author = relationship("User", back_populates="alerts")

class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"
    id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, ForeignKey("users.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # electronics, books, tools, furniture, etc.
    item_type = Column(String(20), nullable=False)  # lend, borrow, both
    condition = Column(String(20), default="good")  # excellent, good, fair, poor
    availability = Column(Boolean, default=True)
    duration_max = Column(Integer)  # max days for lending
    price_per_day = Column(Float, default=0.0)  # optional rental fee
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_borrower_id = Column(Integer, ForeignKey("users.id"))
    borrowed_at = Column(DateTime)
    return_by = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    seller = relationship("User", foreign_keys=[seller_id], back_populates="marketplace_items")
    buyer = relationship("User", foreign_keys=[buyer_id])

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    total_amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)  # maintenance, events, utilities, etc.
    split_type = Column(String(20), default="equal")  # equal, custom, by_percentage
    status = Column(String(20), default="pending")  # pending, settled, cancelled
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime)
    settled_at = Column(DateTime)
    
    # Relationships
    created_by = relationship("User", back_populates="created_expenses")
    participants = relationship("User", secondary=expense_participants, back_populates="participated_expenses")
    splits = relationship("ExpenseSplit", back_populates="expense")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"
    
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_owed = Column(Float, nullable=False)
    amount_paid = Column(Float, default=0.0)
    is_settled = Column(Boolean, default=False)
    settled_at = Column(DateTime)
    
    # Relationships
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")