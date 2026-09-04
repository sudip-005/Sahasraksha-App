from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class WorkOrderBase(BaseModel):
    station_id: str
    sensor_type: str
    priority: str = "HIGH" # CRITICAL, HIGH, MEDIUM, LOW
    description: str
    technician: Optional[str] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderResponse(WorkOrderBase):
    id: int
    status: str = "OPEN" # OPEN, IN_PROGRESS, COMPLETED
    created_at: datetime
    updated_at: datetime
    station_name: Optional[str] = None
    station_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MaintenanceGroup(BaseModel):
    service_now: List[WorkOrderResponse] = []
    monitor: List[WorkOrderResponse] = []
    healthy: List[WorkOrderResponse] = []
    total_open_orders: int = 0
