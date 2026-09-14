from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Contact
from ..schemas import Contact as ContactSchema, ContactCreate, ContactStatusUpdate
from ..auth import get_current_active_user, require_roles

router = APIRouter()

ADMIN_ROLES = ["Admin", "Delegated Admin"]


@router.get("/", response_model=List[ContactSchema])
async def read_approved_contacts(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Public directory: approved contacts only, for all residents."""
    query = db.query(Contact).filter(Contact.approval_status == "approved")
    if category:
        query = query.filter(Contact.category == category)
    contacts = query.order_by(Contact.category.asc(), Contact.name.asc()).all()
    return contacts


@router.get("/pending", response_model=List[ContactSchema])
async def read_pending_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(ADMIN_ROLES))
):
    """Contact submissions awaiting review (Admin/Delegated Admin only)."""
    contacts = db.query(Contact).filter(
        Contact.approval_status == "pending"
    ).order_by(Contact.created_at.desc()).all()
    return contacts


@router.post("/", response_model=ContactSchema)
async def create_contact(
    contact: ContactCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit a new local contact recommendation (any resident)."""
    db_contact = Contact(
        name=contact.name,
        phone=contact.phone,
        category=contact.category,
        approval_status="pending",
        submitted_by_id=current_user.id
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.patch("/{contact_id}/status", response_model=ContactSchema)
async def update_contact_status(
    contact_id: int,
    status_update: ContactStatusUpdate,
    current_user: User = Depends(require_roles(ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """Approve or reject a pending contact submission (Admin/Delegated Admin only)."""
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    db_contact.approval_status = status_update.approval_status
    db_contact.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(db_contact)
    return db_contact
