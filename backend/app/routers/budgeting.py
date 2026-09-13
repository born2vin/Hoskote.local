from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import User, BudgetTransaction
from ..schemas import BudgetTransaction as BudgetTransactionSchema, BudgetTransactionCreate, BudgetTransactionUpdate
from ..auth import get_current_active_user, require_roles

router = APIRouter()

@router.get("/", response_model=List[BudgetTransactionSchema])
async def read_budget_transactions(
    transaction_type: Optional[str] = Query(None, description="Filter by type: Income or Expense"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all budget transactions (visible to all authenticated users)."""
    query = db.query(BudgetTransaction)
    
    if transaction_type:
        query = query.filter(BudgetTransaction.transaction_type == transaction_type)
    if category:
        query = query.filter(BudgetTransaction.category == category)
    
    transactions = query.order_by(BudgetTransaction.transaction_date.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/", response_model=BudgetTransactionSchema)
async def create_budget_transaction(
    transaction: BudgetTransactionCreate,
    current_user: User = Depends(require_roles(["Admin", "Delegated Admin"])),
    db: Session = Depends(get_db)
):
    """Create a new budget transaction (Admin/Delegated Admin only)."""
    db_transaction = BudgetTransaction(
        transaction_type=transaction.transaction_type,
        category=transaction.category,
        amount=transaction.amount,
        description=transaction.description,
        villa_number=transaction.villa_number,
        resident_name=transaction.resident_name,
        transaction_date=transaction.transaction_date or datetime.utcnow(),
        created_by_id=current_user.id
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/{transaction_id}", response_model=BudgetTransactionSchema)
async def update_budget_transaction(
    transaction_id: int,
    transaction_update: BudgetTransactionUpdate,
    current_user: User = Depends(require_roles(["Admin", "Delegated Admin"])),
    db: Session = Depends(get_db)
):
    """Update a budget transaction (Admin/Delegated Admin only)."""
    db_transaction = db.query(BudgetTransaction).filter(BudgetTransaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    for field, value in transaction_update.dict(exclude_unset=True).items():
        setattr(db_transaction, field, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}")
async def delete_budget_transaction(
    transaction_id: int,
    current_user: User = Depends(require_roles(["Admin", "Delegated Admin"])),
    db: Session = Depends(get_db)
):
    """Delete a budget transaction (Admin/Delegated Admin only)."""
    db_transaction = db.query(BudgetTransaction).filter(BudgetTransaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}
