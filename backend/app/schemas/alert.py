from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict

class AlertBase(BaseModel):
    station_id: str
    sensor_type: str
    severity: str # CRITICAL, WARNING, INFO
    title: str
    message: str
    evidence_json: Dict[str, Any] = {}

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    status: str # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at: datetime
    updated_at: datetime
    station_name: Optional[str] = None
    station_code: Optional[str] = None
    evidence_bullets: List[str] = []

    model_config = ConfigDict(from_attributes=True)
