from datetime import date
from typing import List
from pydantic import BaseModel

class NetworkOverviewResponse(BaseModel):
    total_stations: int
    healthy_stations: int
    monitor_stations: int
    service_now_stations: int
    no_data_stations: int
    network_health_pct: float
    active_alerts_count: int
    hourly_processed_readings: int
    hourly_anomalies_detected: int
    reporting_rate_pct: float
    avg_latency_ms: float = 42.0

class NetworkTrendItem(BaseModel):
    date: str
    health_pct: float
    anomalies: int
    reporting_pct: float

class NetworkTrendResponse(BaseModel):
    days: int
    trends: List[NetworkTrendItem]
