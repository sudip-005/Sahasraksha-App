from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ...db.database import get_db
from ...models import Station, Reading, Alert
from ...schemas.demo import FaultInjectionRequest, FaultInjectionResponse, ResetDemoResponse
from ...services.detection_service import DetectionService
from ...websocket.manager import ws_manager

router = APIRouter()

@router.post("/demo/inject-fault", response_model=FaultInjectionResponse)
async def inject_fault(req: FaultInjectionRequest, db: Session = Depends(get_db)):
    st = db.query(Station).filter(Station.id == req.station_id).first()
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Station '{req.station_id}' not found.")

    prev_score = st.health_score
    fault = req.fault_type.upper()
    sensor = req.sensor_type.upper()
    now = datetime.utcnow()

    # Get latest reading to modify or inject on top of
    latest_r = db.query(Reading).filter(
        Reading.station_id == st.id
    ).order_by(desc(Reading.timestamp)).first()

    if not latest_r:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No readings to inject fault on.")

    # Apply fault logic to latest reading or insert an injected reading
    injected_r = Reading(
        station_id=st.id,
        timestamp=now,
        temperature=latest_r.temperature,
        relative_humidity=latest_r.relative_humidity,
        pressure=latest_r.pressure,
        wind_speed=latest_r.wind_speed,
        wind_direction=latest_r.wind_direction,
        solar_radiation=latest_r.solar_radiation,
        precipitation_rate=latest_r.precipitation_rate,
        dew_point=latest_r.dew_point,
        battery_voltage=latest_r.battery_voltage,
        is_flagged=True,
        flags_json=[]
    )

    alert_titles = []
    fault_msg = ""

    if fault == "SPIKE":
        if sensor == "TEMPERATURE":
            injected_r.temperature = 58.5 # Extreme unphysical spike
            injected_r.dew_point = 62.0 # Thermodynamic violation (Dew Point > Temp)
            injected_r.flags_json = ["THERMODYNAMIC_VIOLATION", "PHYSICAL_SPIKE"]
        elif sensor == "PRESSURE":
            injected_r.pressure = 480.0 # Sub-atmospheric vacuum spike
            injected_r.flags_json = ["PHYSICAL_PRESSURE_BOUND_VIOLATION"]
        fault_msg = f"Injected extreme {sensor} spike with thermodynamic violation."

    elif fault == "FREEZE":
        # Create 5 identical readings
        freeze_val = latest_r.temperature or 26.5
        for k in range(5):
            db.add(Reading(
                station_id=st.id,
                timestamp=now - timedelta(minutes=(5 - k) * 10),
                temperature=freeze_val,
                relative_humidity=60.0,
                pressure=latest_r.pressure,
                wind_speed=2.0,
                dew_point=freeze_val - 3.0,
                is_flagged=True,
                flags_json=["SENSOR_ADC_FREEZE"]
            ))
        injected_r.temperature = freeze_val
        injected_r.flags_json = ["SENSOR_ADC_FREEZE"]
        fault_msg = f"Injected {sensor} ADC freeze (repeated identical bits across 5 intervals)."

    elif fault == "DRIFT":
        injected_r.temperature = (latest_r.temperature or 28.0) + (req.intensity * 4.2)
        injected_r.flags_json = ["LAYER4_CUSUM_DRIFT"]
        fault_msg = f"Injected +{round(req.intensity * 4.2, 1)}°C cumulative calibration drift."

    elif fault == "STEP":
        injected_r.temperature = (latest_r.temperature or 25.0) + 9.5 # abrupt step jump
        injected_r.flags_json = ["ABRUPT_STEP_JUMP", "LAYER1_RATE_LIMIT"]
        fault_msg = f"Injected abrupt step jump (+9.5°C in single sampling step)."

    elif fault == "NOISE":
        injected_r.temperature = (latest_r.temperature or 25.0) + 3.8
        injected_r.relative_humidity = 12.0
        injected_r.flags_json = ["HIGH_FREQUENCY_ANALOG_NOISE"]
        fault_msg = f"Injected high-frequency electrical analog noise."

    elif fault == "DROPOUT":
        injected_r.temperature = None
        injected_r.relative_humidity = None
        injected_r.pressure = None
        injected_r.flags_json = ["TELEMETRY_PACKET_DROPOUT"]
        st.status = "NO_DATA"
        fault_msg = f"Injected packet telemetry dropout (missing sensor payload)."

    elif fault == "SLUGGISH":
        # Attenuate diurnal pressure response
        injected_r.pressure = 1012.0 # flatline pressure
        injected_r.flags_json = ["LAYER3_HEARTBEAT_DAMPENED"]
        fault_msg = f"Injected sluggish diurnal atmospheric tide attenuation (clogged port)."

    db.add(injected_r)

    # Trigger diagnostic pipeline evaluation
    readings = db.query(Reading).filter(
        Reading.station_id == st.id
    ).order_by(Reading.timestamp.asc()).all()
    all_stations = db.query(Station).all()
    recent_map = {s.id: latest_r for s in all_stations}

    det_res = DetectionService.evaluate_station(st, readings, all_stations, recent_map)

    st.health_score = det_res.health_score
    st.status = det_res.status
    st.last_seen = now

    for a_data in det_res.alerts_to_generate:
        new_alert = Alert(
            station_id=st.id,
            sensor_type=a_data.get("sensor_type", sensor),
            severity=a_data.get("severity", "CRITICAL"),
            title=a_data["title"],
            message=a_data["message"],
            evidence_json=a_data.get("evidence", {}),
            created_at=now
        )
        db.add(new_alert)
        alert_titles.append(a_data["title"])

    db.commit()

    # Broadcast event via WebSocket
    await ws_manager.broadcast({
        "event": "FAULT_INJECTED",
        "station_id": st.id,
        "fault_type": fault,
        "new_status": st.status,
        "health_score": st.health_score,
        "message": fault_msg
    })

    return FaultInjectionResponse(
        success=True,
        station_id=st.id,
        fault_type=fault,
        sensor_type=sensor,
        message=fault_msg,
        previous_health_score=prev_score,
        new_health_score=st.health_score,
        new_status=st.status,
        alerts_triggered=alert_titles
    )

@router.post("/demo/reset", response_model=ResetDemoResponse)
async def reset_demo(db: Session = Depends(get_db)):
    # Reset stations back to healthy baseline
    stations = db.query(Station).all()
    for st in stations:
        if st.id not in ["AWS_CHE_02", "AWS_BHO_01"]:
            st.status = "HEALTHY"
            st.health_score = 98.0

    # Dismiss synthetic demo alerts
    demo_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").all()
    for a in demo_alerts:
        if "Physics Rule" in a.title or "Injected" in a.title or "Spike" in a.title:
            a.status = "RESOLVED"

    db.commit()

    await ws_manager.broadcast({
        "event": "DEMO_RESET",
        "message": "Demo mode state reset to nominal baseline."
    })

    return ResetDemoResponse(
        success=True,
        message="Demo state reset. Station telemetry restored to nominal tolerances.",
        restored_stations_count=len(stations)
    )
