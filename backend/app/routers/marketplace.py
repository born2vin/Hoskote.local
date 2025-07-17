from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User, MarketplaceItem
from ..schemas import MarketplaceItem as MarketplaceItemSchema, MarketplaceItemCreate, MarketplaceItemUpdate
from ..auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=MarketplaceItemSchema)
async def create_item(
    item: MarketplaceItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new marketplace item."""
    db_item = MarketplaceItem(
        title=item.title,
        description=item.description,
        category=item.category,
        item_type=item.item_type,
        condition=item.condition,
        duration_max=item.duration_max,
        price_per_day=item.price_per_day,
        owner_id=current_user.id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[MarketplaceItemSchema])
async def read_items(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    item_type: Optional[str] = Query(None, description="Filter by item type"),
    available_only: bool = Query(True, description="Show only available items"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of marketplace items with optional filters."""
    query = db.query(MarketplaceItem)
    
    if category:
        query = query.filter(MarketplaceItem.category == category)
    if item_type:
        query = query.filter(MarketplaceItem.item_type == item_type)
    if available_only:
        query = query.filter(MarketplaceItem.availability == True)
    
    items = query.order_by(MarketplaceItem.created_at.desc()).offset(skip).limit(limit).all()
    return items

@router.get("/my-items", response_model=List[MarketplaceItemSchema])
async def read_my_items(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's marketplace items."""
    items = db.query(MarketplaceItem).filter(
        MarketplaceItem.owner_id == current_user.id
    ).order_by(MarketplaceItem.created_at.desc()).offset(skip).limit(limit).all()
    return items

@router.get("/borrowed", response_model=List[MarketplaceItemSchema])
async def read_borrowed_items(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get items currently borrowed by the user."""
    items = db.query(MarketplaceItem).filter(
        MarketplaceItem.current_borrower_id == current_user.id,
        MarketplaceItem.availability == False
    ).all()
    return items

@router.get("/{item_id}", response_model=MarketplaceItemSchema)
async def read_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get marketplace item by ID."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=MarketplaceItemSchema)
async def update_item(
    item_id: int,
    item_update: MarketplaceItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a marketplace item (only by owner)."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Only owner can update their item
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
    
    for field, value in item_update.dict(exclude_unset=True).items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.post("/{item_id}/borrow")
async def borrow_item(
    item_id: int,
    days: int = Query(..., ge=1, description="Number of days to borrow"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Borrow an item."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if item is available
    if not item.availability:
        raise HTTPException(status_code=400, detail="Item is not available")
    
    # Check if owner is trying to borrow their own item
    if item.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot borrow your own item")
    
    # Check if duration exceeds maximum allowed
    if item.duration_max and days > item.duration_max:
        raise HTTPException(status_code=400, detail=f"Cannot borrow for more than {item.duration_max} days")
    
    # Check if item type allows borrowing
    if item.item_type not in ["lend", "both"]:
        raise HTTPException(status_code=400, detail="This item is not available for lending")
    
    # Update item status
    item.availability = False
    item.current_borrower_id = current_user.id
    item.borrowed_at = datetime.utcnow()
    item.return_by = datetime.utcnow() + timedelta(days=days)
    
    db.commit()
    return {
        "message": "Item borrowed successfully",
        "return_by": item.return_by,
        "total_cost": item.price_per_day * days if item.price_per_day > 0 else 0
    }

@router.post("/{item_id}/return")
async def return_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Return a borrowed item."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Check if current user is the borrower
    if item.current_borrower_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not the current borrower of this item")
    
    # Return the item
    item.availability = True
    item.current_borrower_id = None
    item.borrowed_at = None
    item.return_by = None
    
    db.commit()
    return {"message": "Item returned successfully"}

@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a marketplace item (only by owner)."""
    item = db.query(MarketplaceItem).filter(MarketplaceItem.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Only owner can delete their item
    if item.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
    
    # Check if item is currently borrowed
    if not item.availability:
        raise HTTPException(status_code=400, detail="Cannot delete item that is currently borrowed")
    
    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}