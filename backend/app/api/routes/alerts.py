from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...services.alert_service import AlertService
from ...schemas.alert import AlertResponse

router = APIRouter()

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, ACKNOWLEDGED, RESOLVED"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, WARNING, INFO"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    return AlertService.get_alerts(db, status=status, severity=severity, limit=limit)

@router.post("/alerts/{id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(id: int, db: Session = Depends(get_db)):
    updated = AlertService.acknowledge_alert(db, id)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert #{id} not found.")
    return updated
