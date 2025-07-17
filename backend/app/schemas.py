from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Idea schemas
class IdeaBase(BaseModel):
    title: str
    description: str
    category: str

class IdeaCreate(IdeaBase):
    pass

class IdeaUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class Idea(IdeaBase):
    id: int
    status: str
    votes_up: int
    votes_down: int
    author_id: int
    author: User
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Alert schemas
class AlertBase(BaseModel):
    title: str
    description: str
    alert_type: str
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str = "medium"

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None

class Alert(AlertBase):
    id: int
    status: str
    author_id: int
    author: User
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Marketplace schemas
class MarketplaceItemBase(BaseModel):
    title: str
    description: str
    category: str
    item_type: str
    condition: str = "good"
    duration_max: Optional[int] = None
    price_per_day: float = 0.0

class MarketplaceItemCreate(MarketplaceItemBase):
    pass

class MarketplaceItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    availability: Optional[bool] = None
    duration_max: Optional[int] = None
    price_per_day: Optional[float] = None

class MarketplaceItem(MarketplaceItemBase):
    id: int
    availability: bool
    owner_id: int
    owner: User
    current_borrower_id: Optional[int] = None
    borrowed_at: Optional[datetime] = None
    return_by: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Expense schemas
class ExpenseSplitBase(BaseModel):
    user_id: int
    amount_owed: float

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplit(ExpenseSplitBase):
    id: int
    amount_paid: float
    is_settled: bool
    settled_at: Optional[datetime] = None
    user: User
    
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    title: str
    description: Optional[str] = None
    total_amount: float
    category: str
    split_type: str = "equal"
    due_date: Optional[datetime] = None

class ExpenseCreate(ExpenseBase):
    participant_ids: List[int]
    custom_splits: Optional[List[ExpenseSplitCreate]] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    total_amount: Optional[float] = None
    category: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None

class Expense(ExpenseBase):
    id: int
    status: str
    created_by_id: int
    created_by: User
    participants: List[User]
    splits: List[ExpenseSplit]
    created_at: datetime
    settled_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True