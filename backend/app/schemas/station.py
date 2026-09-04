from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from .reading import ReadingResponse

class SensorHealthItem(BaseModel):
    sensor: str # TEMPERATURE, HUMIDITY, PRESSURE, WIND, SOLAR, PRECIP
    status: str # HEALTHY, DEGRADED, FAILED, UNKNOWN
    current_value: Optional[float] = None
    unit: str
    last_calibrated: Optional[str] = None
    drift_score: float = 0.0
    flags: List[str] = []

class StationBase(BaseModel):
    name: str
    code: str
    state: str
    district: str
    latitude: float
    longitude: float
    elevation_m: float = 0.0

class StationCreate(StationBase):
    id: str

class StationMapPoint(BaseModel):
    id: str
    name: str
    code: str
    latitude: float
    longitude: float
    status: str
    health_score: float
    current_temp: Optional[float] = None
    current_pressure: Optional[float] = None

class StationHealthSummary(StationBase):
    id: str
    status: str # HEALTHY, MONITOR, SERVICE_NOW, NO_DATA
    health_score: float
    last_seen: datetime
    active_alerts_count: int = 0
    sensors: List[SensorHealthItem] = []

    model_config = ConfigDict(from_attributes=True)

class StationDetail(StationHealthSummary):
    latest_reading: Optional[ReadingResponse] = None
    neighbour_agreement_pct: float = 100.0
    why_flagged_summary: Optional[str] = None

class PaginatedStationsResponse(BaseModel):
    items: List[StationHealthSummary]
    total: int
    page: int
    pages: int
    limit: int
