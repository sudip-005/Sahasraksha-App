from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, JSON, Integer
from sqlalchemy.orm import relationship
from ..db.database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True, index=True) # e.g., "AWS_DEL_01"
    name = Column(String, index=True, nullable=False) # e.g., "Safdarjung Observatory"
    code = Column(String, unique=True, index=True, nullable=False) # e.g., "VIDD"
    state = Column(String, index=True, nullable=False) # e.g., "Delhi"
    district = Column(String, nullable=False) # e.g., "New Delhi"
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=216.0)
    
    # Status: HEALTHY, MONITOR, SERVICE_NOW, NO_DATA
    status = Column(String, default="HEALTHY", index=True)
    health_score = Column(Float, default=100.0)
    
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    sensors_config = Column(JSON, default=dict)

    # Relationships
    readings = relationship("Reading", back_populates="station", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="station", cascade="all, delete-orphan")
    detections = relationship("DetectionRecord", back_populates="station", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="station", cascade="all, delete-orphan")
