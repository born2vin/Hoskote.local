from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Issue
from ..schemas import Issue as IssueSchema, IssueCreate, IssueUpdate
from ..auth import get_current_active_user, require_roles

router = APIRouter()

@router.get("/", response_model=List[IssueSchema])
async def read_issues(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all issues with optional filters."""
    query = db.query(Issue)
    
    if status:
        query = query.filter(Issue.status == status)
    if category:
        query = query.filter(Issue.category == category)
    
    issues = query.order_by(Issue.created_at.desc()).offset(skip).limit(limit).all()
    return issues

@router.post("/", response_model=IssueSchema)
async def create_issue(
    issue: IssueCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new issue report."""
    db_issue = Issue(
        title=issue.title,
        category=issue.category,
        description=issue.description,
        status=issue.status or "Open",
        author_id=current_user.id
    )
    
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue

@router.patch("/{issue_id}/status", response_model=IssueSchema)
async def update_issue_status(
    issue_id: int,
    issue_update: IssueUpdate,
    current_user: User = Depends(require_roles(["Admin", "Delegated Admin"])),
    db: Session = Depends(get_db)
):
    """Update issue status (Admin/Delegated Admin only)."""
    db_issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if db_issue is None:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    if issue_update.status is not None:
        db_issue.status = issue_update.status
    if issue_update.title is not None:
        db_issue.title = issue_update.title
    if issue_update.category is not None:
        db_issue.category = issue_update.category
    if issue_update.description is not None:
        db_issue.description = issue_update.description
    
    db.commit()
    db.refresh(db_issue)
    return db_issue
