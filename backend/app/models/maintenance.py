from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..db.database import Base

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id", ondelete="CASCADE"), index=True, nullable=False)
    sensor_type = Column(String, nullable=False)
    priority = Column(String, default="HIGH", index=True) # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String, default="OPEN", index=True) # OPEN, IN_PROGRESS, COMPLETED
    technician = Column(String, nullable=True)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    station = relationship("Station", back_populates="work_orders")
