from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..db.database import Base

class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id", ondelete="CASCADE"), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, default=datetime.utcnow, nullable=False)
    
    # Meteorological observables
    temperature = Column(Float, nullable=True) # °C
    relative_humidity = Column(Float, nullable=True) # %
    pressure = Column(Float, nullable=True) # hPa
    wind_speed = Column(Float, nullable=True) # m/s
    wind_direction = Column(Float, nullable=True) # degrees
    solar_radiation = Column(Float, nullable=True) # W/m^2
    precipitation_rate = Column(Float, nullable=True) # mm/h
    dew_point = Column(Float, nullable=True) # °C
    battery_voltage = Column(Float, default=12.4) # V
    
    # Flags & Quality Assessment
    is_flagged = Column(Boolean, default=False, index=True)
    flags_json = Column(JSON, default=list) # List of violated layer/rule names

    station = relationship("Station", back_populates="readings")
