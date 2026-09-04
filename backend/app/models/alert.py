from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..db.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id", ondelete="CASCADE"), index=True, nullable=False)
    sensor_type = Column(String, nullable=False) # TEMPERATURE, PRESSURE, HUMIDITY, WIND, SOLAR, PRECIP
    severity = Column(String, index=True, default="WARNING") # CRITICAL, WARNING, INFO
    status = Column(String, index=True, default="ACTIVE") # ACTIVE, ACKNOWLEDGED, RESOLVED
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    evidence_json = Column(JSON, default=dict) # Evidence points backing the alert
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    station = relationship("Station", back_populates="alerts")
