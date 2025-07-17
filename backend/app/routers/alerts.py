from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User, Alert
from ..schemas import Alert as AlertSchema, AlertCreate, AlertUpdate
from ..auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=AlertSchema)
async def create_alert(
    alert: AlertCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new safety alert."""
    db_alert = Alert(
        title=alert.title,
        description=alert.description,
        alert_type=alert.alert_type,
        location=alert.location,
        latitude=alert.latitude,
        longitude=alert.longitude,
        severity=alert.severity,
        author_id=current_user.id
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.get("/", response_model=List[AlertSchema])
async def read_alerts(
    skip: int = 0,
    limit: int = 100,
    alert_type: Optional[str] = Query(None, description="Filter by alert type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get list of alerts with optional filters."""
    query = db.query(Alert)
    
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    
    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/active", response_model=List[AlertSchema])
async def read_active_alerts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get active alerts only."""
    alerts = db.query(Alert).filter(
        Alert.status == "active"
    ).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts

@router.get("/{alert_id}", response_model=AlertSchema)
async def read_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get alert by ID."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}", response_model=AlertSchema)
async def update_alert(
    alert_id: int,
    alert_update: AlertUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an alert (only by author)."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Only author can update their alert
    if alert.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this alert")
    
    for field, value in alert_update.dict(exclude_unset=True).items():
        setattr(alert, field, value)
    
    # Set resolved timestamp if status changed to resolved
    if alert_update.status == "resolved" and alert.status != "resolved":
        from datetime import datetime
        alert.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark an alert as resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Only author can resolve their alert
    if alert.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to resolve this alert")
    
    alert.status = "resolved"
    from datetime import datetime
    alert.resolved_at = datetime.utcnow()
    
    db.commit()
    return {"message": "Alert resolved successfully"}

@router.delete("/{alert_id}")
async def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete an alert (only by author)."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Only author can delete their alert
    if alert.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this alert")
    
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully"}