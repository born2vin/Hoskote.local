from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Idea
from ..schemas import Idea as IdeaSchema, IdeaCreate, IdeaUpdate
from ..auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=IdeaSchema)
async def create_idea(
    idea: IdeaCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new idea."""
    db_idea = Idea(
        title=idea.title,
        description=idea.description,
        category=idea.category,
        author_id=current_user.id
    )
    db.add(db_idea)
    db.commit()
    db.refresh(db_idea)
    return db_idea

@router.get("/", response_model=List[IdeaSchema])
async def read_ideas(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of ideas with optional filters."""
    query = db.query(Idea)
    
    if category:
        query = query.filter(Idea.category == category)
    if status:
        query = query.filter(Idea.status == status)
    
    ideas = query.order_by(Idea.created_at.desc()).offset(skip).limit(limit).all()
    return ideas

@router.get("/{idea_id}", response_model=IdeaSchema)
async def read_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get idea by ID."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea

@router.put("/{idea_id}", response_model=IdeaSchema)
async def update_idea(
    idea_id: int,
    idea_update: IdeaUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an idea (only by author)."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Only author can update their idea
    if idea.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this idea")
    
    for field, value in idea_update.dict(exclude_unset=True).items():
        setattr(idea, field, value)
    
    db.commit()
    db.refresh(idea)
    return idea

@router.post("/{idea_id}/vote")
async def vote_idea(
    idea_id: int,
    vote_type: str = Query(..., regex="^(up|down)$"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Vote on an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Update vote count
    if vote_type == "up":
        idea.votes_up += 1
    else:
        idea.votes_down += 1
    
    db.commit()
    return {"message": f"Vote {vote_type} recorded", "votes_up": idea.votes_up, "votes_down": idea.votes_down}

@router.delete("/{idea_id}")
async def delete_idea(
    idea_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an idea (only by author)."""
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if idea is None:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Only author can delete their idea
    if idea.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this idea")
    
    db.delete(idea)
    db.commit()
    return {"message": "Idea deleted successfully"}