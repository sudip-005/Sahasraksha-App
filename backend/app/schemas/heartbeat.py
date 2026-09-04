from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class HeartbeatPoint(BaseModel):
    timestamp: datetime
    raw_pressure: float
    reconstructed_tide: float
    residual: float

class HeartbeatResponse(BaseModel):
    station_id: str
    heartbeat_status: str # NORMAL, DAMPENED, INVERTED, UNAVAILABLE
    heartbeat_strength: float # Correlation or amplitude score (0.0 to 1.0)
    normal_threshold: float = 0.70
    alarm_threshold: float = 0.40
    data_points_count: int
    sampling_window_hours: float
    message: str
    series: List[HeartbeatPoint] = []
