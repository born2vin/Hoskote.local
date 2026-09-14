from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, Notice
from ..schemas import Notice as NoticeSchema, NoticeCreate, NoticeUpdate
from ..auth import get_current_active_user, require_roles

router = APIRouter()

ADMIN_ROLES = ["Admin", "Delegated Admin"]


@router.get("/active", response_model=List[NoticeSchema])
async def read_active_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get notices that have not yet expired, for the dashboard ticker."""
    notices = db.query(Notice).filter(
        Notice.expiry_date > datetime.utcnow()
    ).order_by(Notice.created_at.desc()).all()
    return notices


@router.get("/", response_model=List[NoticeSchema])
async def read_notices(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(ADMIN_ROLES))
):
    """Get all notices, including expired ones (Admin/Delegated Admin only)."""
    notices = db.query(Notice).order_by(Notice.created_at.desc()).offset(skip).limit(limit).all()
    return notices


@router.post("/", response_model=NoticeSchema)
async def create_notice(
    notice: NoticeCreate,
    current_user: User = Depends(require_roles(ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """Create a new notice (Admin/Delegated Admin only)."""
    db_notice = Notice(
        title=notice.title,
        description=notice.description,
        expiry_date=notice.expiry_date,
        created_by_id=current_user.id
    )
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    return db_notice


@router.put("/{notice_id}", response_model=NoticeSchema)
async def update_notice(
    notice_id: int,
    notice_update: NoticeUpdate,
    current_user: User = Depends(require_roles(ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """Update a notice (Admin/Delegated Admin only)."""
    db_notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if db_notice is None:
        raise HTTPException(status_code=404, detail="Notice not found")

    for field, value in notice_update.dict(exclude_unset=True).items():
        setattr(db_notice, field, value)

    db.commit()
    db.refresh(db_notice)
    return db_notice


@router.delete("/{notice_id}")
async def delete_notice(
    notice_id: int,
    current_user: User = Depends(require_roles(ADMIN_ROLES)),
    db: Session = Depends(get_db)
):
    """Delete a notice (Admin/Delegated Admin only)."""
    db_notice = db.query(Notice).filter(Notice.id == notice_id).first()
    if db_notice is None:
        raise HTTPException(status_code=404, detail="Notice not found")

    db.delete(db_notice)
    db.commit()
    return {"message": "Notice deleted successfully"}
