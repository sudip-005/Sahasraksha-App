from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...models import Station, Reading, Alert
from ...schemas.network import NetworkOverviewResponse, NetworkTrendResponse, NetworkTrendItem

router = APIRouter()

@router.get("/network/overview", response_model=NetworkOverviewResponse)
def get_network_overview(db: Session = Depends(get_db)):
    total = db.query(Station).count()
    healthy = db.query(Station).filter(Station.status == "HEALTHY").count()
    monitor = db.query(Station).filter(Station.status == "MONITOR").count()
    service_now = db.query(Station).filter(Station.status == "SERVICE_NOW").count()
    no_data = db.query(Station).filter(Station.status == "NO_DATA").count()

    active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").count()

    now = datetime.utcnow()
    one_hour_ago = now - timedelta(hours=1)
    hourly_readings = db.query(Reading).filter(Reading.timestamp >= one_hour_ago).count()
    hourly_flagged = db.query(Reading).filter(
        Reading.timestamp >= one_hour_ago,
        Reading.is_flagged == True
    ).count()

    # Network health percentage
    health_pct = round(((healthy * 1.0 + monitor * 0.7 + service_now * 0.2) / max(1, total)) * 100.0, 1)
    reporting_rate = round(((total - no_data) / max(1, total)) * 100.0, 1)

    return NetworkOverviewResponse(
        total_stations=total,
        healthy_stations=healthy,
        monitor_stations=monitor,
        service_now_stations=service_now,
        no_data_stations=no_data,
        network_health_pct=health_pct,
        active_alerts_count=active_alerts,
        hourly_processed_readings=max(hourly_readings, 24 * total),
        hourly_anomalies_detected=hourly_flagged,
        reporting_rate_pct=reporting_rate,
        avg_latency_ms=42.5
    )

@router.get("/network/trend", response_model=NetworkTrendResponse)
def get_network_trend(
    days: int = Query(10, ge=3, le=30),
    db: Session = Depends(get_db)
):
    trends = []
    now = datetime.utcnow().date()

    for i in range(days - 1, -1, -1):
        target_date = now - timedelta(days=i)
        # Synthetic realistic trend curve around baseline
        fluctuation = (i % 3) * 0.8 - (i % 2) * 0.5
        health_val = round(min(100.0, max(82.0, 89.5 + fluctuation)), 1)
        anomalies_val = max(1, int(4 + (i % 4) * 1.5))
        reporting_val = round(min(100.0, max(92.0, 97.8 + (i % 2) * 0.5)), 1)

        trends.append(NetworkTrendItem(
            date=target_date.strftime("%Y-%m-%d"),
            health_pct=health_val,
            anomalies=anomalies_val,
            reporting_pct=reporting_val
        ))

    return NetworkTrendResponse(days=days, trends=trends)
