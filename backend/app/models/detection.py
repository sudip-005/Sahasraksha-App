from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from ..db.database import Base

class DetectionRecord(Base):
    __tablename__ = "detection_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id", ondelete="CASCADE"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Layer statuses: PASS, WARN, FAIL, UNAVAILABLE
    layer1_physics_status = Column(String, default="PASS")
    layer2_spatial_status = Column(String, default="PASS")
    layer3_heartbeat_status = Column(String, default="PASS")
    layer4_drift_status = Column(String, default="PASS")
    
    overall_health_score = Column(Float, default=100.0)
    failure_type = Column(String, nullable=True) # SPIKE, FREEZE, DRIFT, STEP, NOISE, DROPOUT, SLUGGISH, NONE
    summary_explanation = Column(String, nullable=True)
    raw_evidence_json = Column(JSON, default=dict)

    station = relationship("Station", back_populates="detections")
