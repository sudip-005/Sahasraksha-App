from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...services.maintenance_service import MaintenanceService
from ...schemas.maintenance import MaintenanceGroup, WorkOrderCreate, WorkOrderResponse

router = APIRouter()

@router.get("/maintenance", response_model=MaintenanceGroup)
def get_maintenance(db: Session = Depends(get_db)):
    return MaintenanceService.get_maintenance_group(db)

@router.post("/maintenance/work-orders", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
def create_work_order(data: WorkOrderCreate, db: Session = Depends(get_db)):
    return MaintenanceService.create_work_order(db, data)
