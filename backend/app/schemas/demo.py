from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class FaultInjectionRequest(BaseModel):
    station_id: str
    sensor_type: str # TEMPERATURE, PRESSURE, HUMIDITY, WIND, SOLAR, PRECIP
    fault_type: str # SPIKE, FREEZE, DRIFT, STEP, NOISE, DROPOUT, SLUGGISH
    intensity: float = 1.0
    duration_minutes: int = 60

class FaultInjectionResponse(BaseModel):
    success: bool
    station_id: str
    fault_type: str
    sensor_type: str
    message: str
    previous_health_score: float
    new_health_score: float
    new_status: str
    alerts_triggered: List[str]

class ResetDemoResponse(BaseModel):
    success: bool
    message: str
    restored_stations_count: int

# Explainable AI (XAI) Diagnosis Schema
class EvidenceCardData(BaseModel):
    layer: str # Physics, Spatial, Heartbeat, Drift-ML
    title: str
    status: str # PASS, WARN, FAIL, UNAVAILABLE
    severity: str # LOW, MEDIUM, HIGH, CRITICAL, NONE
    confidence_pct: float
    observation: str
    threshold: str
    explanation: str
    key_metrics: Dict[str, Any] = {}

class StationDiagnosisResponse(BaseModel):
    station_id: str
    station_name: str
    overall_status: str
    health_score: float
    plain_english_summary: str
    recommended_action: str
    evidence_cards: List[EvidenceCardData]
