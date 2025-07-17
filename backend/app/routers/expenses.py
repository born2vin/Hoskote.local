from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models import User, Expense, ExpenseSplit
from ..schemas import Expense as ExpenseSchema, ExpenseCreate, ExpenseUpdate, ExpenseSplit as ExpenseSplitSchema
from ..auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=ExpenseSchema)
async def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new expense."""
    # Validate participants exist
    participants = db.query(User).filter(User.id.in_(expense.participant_ids)).all()
    if len(participants) != len(expense.participant_ids):
        raise HTTPException(status_code=400, detail="One or more participants not found")
    
    # Create expense
    db_expense = Expense(
        title=expense.title,
        description=expense.description,
        total_amount=expense.total_amount,
        category=expense.category,
        split_type=expense.split_type,
        due_date=expense.due_date,
        created_by_id=current_user.id
    )
    
    # Add participants
    for participant in participants:
        db_expense.participants.append(participant)
    
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    # Create expense splits
    if expense.split_type == "equal":
        amount_per_person = expense.total_amount / len(participants)
        for participant in participants:
            split = ExpenseSplit(
                expense_id=db_expense.id,
                user_id=participant.id,
                amount_owed=amount_per_person
            )
            db.add(split)
    elif expense.split_type == "custom" and expense.custom_splits:
        total_custom = sum(split.amount_owed for split in expense.custom_splits)
        if abs(total_custom - expense.total_amount) > 0.01:  # Allow for small rounding errors
            raise HTTPException(status_code=400, detail="Custom split amounts don't match total amount")
        
        for custom_split in expense.custom_splits:
            if custom_split.user_id not in expense.participant_ids:
                raise HTTPException(status_code=400, detail="Split user must be a participant")
            
            split = ExpenseSplit(
                expense_id=db_expense.id,
                user_id=custom_split.user_id,
                amount_owed=custom_split.amount_owed
            )
            db.add(split)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/", response_model=List[ExpenseSchema])
async def read_expenses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    my_expenses_only: bool = Query(False, description="Show only expenses I'm involved in"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of expenses with optional filters."""
    query = db.query(Expense)
    
    if my_expenses_only:
        # Filter expenses where user is creator or participant
        query = query.filter(
            (Expense.created_by_id == current_user.id) |
            (Expense.participants.any(User.id == current_user.id))
        )
    
    if category:
        query = query.filter(Expense.category == category)
    if status:
        query = query.filter(Expense.status == status)
    
    expenses = query.order_by(Expense.created_at.desc()).offset(skip).limit(limit).all()
    return expenses

@router.get("/my-splits", response_model=List[ExpenseSplitSchema])
async def read_my_splits(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's expense splits."""
    splits = db.query(ExpenseSplit).filter(
        ExpenseSplit.user_id == current_user.id
    ).join(Expense).order_by(Expense.created_at.desc()).all()
    return splits

@router.get("/pending-payments", response_model=List[ExpenseSplitSchema])
async def read_pending_payments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's pending payments."""
    splits = db.query(ExpenseSplit).filter(
        ExpenseSplit.user_id == current_user.id,
        ExpenseSplit.is_settled == False
    ).join(Expense).order_by(Expense.created_at.desc()).all()
    return splits

@router.get("/{expense_id}", response_model=ExpenseSchema)
async def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get expense by ID."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Check if user has access to this expense
    is_creator = expense.created_by_id == current_user.id
    is_participant = any(p.id == current_user.id for p in expense.participants)
    
    if not (is_creator or is_participant):
        raise HTTPException(status_code=403, detail="Not authorized to view this expense")
    
    return expense

@router.put("/{expense_id}", response_model=ExpenseSchema)
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an expense (only by creator)."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Only creator can update the expense
    if expense.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this expense")
    
    for field, value in expense_update.dict(exclude_unset=True).items():
        setattr(expense, field, value)
    
    # Set settled timestamp if status changed to settled
    if expense_update.status == "settled" and expense.status != "settled":
        expense.settled_at = datetime.utcnow()
        # Mark all splits as settled
        for split in expense.splits:
            split.is_settled = True
            split.settled_at = datetime.utcnow()
    
    db.commit()
    db.refresh(expense)
    return expense

@router.post("/{expense_id}/pay")
async def pay_expense_split(
    expense_id: int,
    amount: float = Query(..., gt=0, description="Amount to pay"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Pay towards an expense split."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Find user's split for this expense
    split = db.query(ExpenseSplit).filter(
        ExpenseSplit.expense_id == expense_id,
        ExpenseSplit.user_id == current_user.id
    ).first()
    
    if split is None:
        raise HTTPException(status_code=404, detail="Expense split not found")
    
    if split.is_settled:
        raise HTTPException(status_code=400, detail="This split is already settled")
    
    # Update payment
    split.amount_paid += amount
    
    # Check if fully paid
    if split.amount_paid >= split.amount_owed:
        split.is_settled = True
        split.settled_at = datetime.utcnow()
        
        # If split overpaid, adjust to exact amount
        if split.amount_paid > split.amount_owed:
            split.amount_paid = split.amount_owed
    
    db.commit()
    
    # Check if all splits are settled
    all_settled = all(s.is_settled for s in expense.splits)
    if all_settled and expense.status != "settled":
        expense.status = "settled"
        expense.settled_at = datetime.utcnow()
        db.commit()
    
    return {
        "message": "Payment recorded successfully",
        "amount_paid": split.amount_paid,
        "amount_owed": split.amount_owed,
        "is_settled": split.is_settled,
        "expense_fully_settled": all_settled
    }

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an expense (only by creator and only if no payments made)."""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Only creator can delete the expense
    if expense.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this expense")
    
    # Check if any payments have been made
    any_payments = any(split.amount_paid > 0 for split in expense.splits)
    if any_payments:
        raise HTTPException(status_code=400, detail="Cannot delete expense with payments made")
    
    # Delete splits first
    db.query(ExpenseSplit).filter(ExpenseSplit.expense_id == expense_id).delete()
    
    # Delete expense
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}