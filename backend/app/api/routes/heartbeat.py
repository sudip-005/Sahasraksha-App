from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...db.database import get_db
from ...models import Station, Reading
from ...services.heartbeat_service import HeartbeatService
from ...schemas.heartbeat import HeartbeatResponse
from ...core.exceptions import StationNotFoundException

router = APIRouter()

@router.get("/stations/{id}/heartbeat", response_model=HeartbeatResponse)
def get_station_heartbeat(id: str, db: Session = Depends(get_db)):
    st = db.query(Station).filter(Station.id == id).first()
    if not st:
        raise StationNotFoundException(id)

    # Fetch chronological readings for the station
    readings = db.query(Reading).filter(
        Reading.station_id == id
    ).order_by(Reading.timestamp.asc()).all()

    res = HeartbeatService.analyze_readings(
        station_id=st.id,
        readings=readings,
        latitude=st.latitude
    )

    return HeartbeatResponse(
        station_id=res.station_id,
        heartbeat_status=res.status,
        heartbeat_strength=res.strength,
        normal_threshold=HeartbeatService.NORMAL_THRESHOLD,
        alarm_threshold=HeartbeatService.ALARM_THRESHOLD,
        data_points_count=res.data_points_count,
        sampling_window_hours=res.sampling_window_hours,
        message=res.message,
        series=res.series
    )
