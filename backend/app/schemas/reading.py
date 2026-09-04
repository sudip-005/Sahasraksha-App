from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ReadingBase(BaseModel):
    station_id: str
    timestamp: datetime
    temperature: Optional[float] = None
    relative_humidity: Optional[float] = None
    pressure: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    solar_radiation: Optional[float] = None
    precipitation_rate: Optional[float] = None
    dew_point: Optional[float] = None
    battery_voltage: Optional[float] = 12.4

class ReadingCreate(ReadingBase):
    pass

class ReadingResponse(ReadingBase):
    id: int
    is_flagged: bool = False
    flags_json: List[str] = []

    model_config = ConfigDict(from_attributes=True)
