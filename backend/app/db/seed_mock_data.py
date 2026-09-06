import math
import random
import csv
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy.orm import Session
from ..db.database import SessionLocal, init_db
from ..models import Station, Reading, Alert, WorkOrder, DetectionRecord
from ..core.logging import logger

IMD_STATIONS = [
    {
        "id": "AWS_DEL_01",
        "name": "Safdarjung Observatory",
        "code": "VIDD",
        "state": "Delhi",
        "district": "New Delhi",
        "latitude": 28.5833,
        "longitude": 77.2083,
        "elevation_m": 216.0,
        "status": "HEALTHY",
        "health_score": 98.5
    },
    {
        "id": "AWS_MUM_01",
        "name": "Colaba Coastal Station",
        "code": "VABB",
        "state": "Maharashtra",
        "district": "Mumbai City",
        "latitude": 18.8980,
        "longitude": 72.8100,
        "elevation_m": 11.0,
        "status": "HEALTHY",
        "health_score": 96.0
    },
    {
        "id": "AWS_KOL_01",
        "name": "Alipore Observatory",
        "code": "VECC",
        "state": "West Bengal",
        "district": "Kolkata",
        "latitude": 22.5333,
        "longitude": 88.3333,
        "elevation_m": 6.0,
        "status": "HEALTHY",
        "health_score": 95.0
    },
    {
        "id": "AWS_CHE_01",
        "name": "Meenambakkam Station",
        "code": "VOMM",
        "state": "Tamil Nadu",
        "district": "Chennai",
        "latitude": 12.9833,
        "longitude": 80.1833,
        "elevation_m": 16.0,
        "status": "HEALTHY",
        "health_score": 97.0
    },
    {
        "id": "AWS_BLR_01",
        "name": "HAL Airport Observatory",
        "code": "VOBG",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "latitude": 12.9500,
        "longitude": 77.6667,
        "elevation_m": 888.0,
        "status": "HEALTHY",
        "health_score": 99.0
    },
    {
        "id": "AWS_SHM_01",
        "name": "Shimla Ridge Station",
        "code": "VISM",
        "state": "Himachal Pradesh",
        "district": "Shimla",
        "latitude": 31.1048,
        "longitude": 77.1734,
        "elevation_m": 2205.0,
        "status": "HEALTHY",
        "health_score": 94.0
    },
    {
        "id": "AWS_PUN_01",
        "name": "Shivajinagar Agro-Met",
        "code": "VAPO",
        "state": "Maharashtra",
        "district": "Pune",
        "latitude": 18.5333,
        "longitude": 73.8500,
        "elevation_m": 560.0,
        "status": "HEALTHY",
        "health_score": 96.5
    },
    {
        "id": "AWS_JAI_01",
        "name": "Jaisalmer Desert Post",
        "code": "VIJR",
        "state": "Rajasthan",
        "district": "Jaisalmer",
        "latitude": 26.9157,
        "longitude": 70.9083,
        "elevation_m": 225.0,
        "status": "MONITOR", # Injected: Sensor bias drift
        "health_score": 76.0
    },
    {
        "id": "AWS_CHE_02",
        "name": "Sohra High-Precip Post",
        "code": "VEBI",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "latitude": 25.2833,
        "longitude": 91.7333,
        "elevation_m": 1430.0,
        "status": "SERVICE_NOW", # Injected: Clogged barometric port (dampened heartbeat)
        "health_score": 48.0
    },
    {
        "id": "AWS_LEH_01",
        "name": "Leh High-Altitude Station",
        "code": "VILH",
        "state": "Ladakh",
        "district": "Leh",
        "latitude": 34.1526,
        "longitude": 77.5771,
        "elevation_m": 3524.0,
        "status": "MONITOR", # Injected: Moderate temperature jump/step
        "health_score": 72.0
    },
    {
        "id": "AWS_NAG_01",
        "name": "Sonegaon Central Hub",
        "code": "VANP",
        "state": "Maharashtra",
        "district": "Nagpur",
        "latitude": 21.0922,
        "longitude": 79.0538,
        "elevation_m": 310.0,
        "status": "HEALTHY",
        "health_score": 97.2
    },
    {
        "id": "AWS_BHO_01",
        "name": "Bhopal Bairagarh Post",
        "code": "VABP",
        "state": "Madhya Pradesh",
        "district": "Bhopal",
        "latitude": 23.2875,
        "longitude": 77.3486,
        "elevation_m": 524.0,
        "status": "NO_DATA", # Injected: Silent / communication failure
        "health_score": 0.0
    }
]


def _load_skyguard_stations():
    csv_path = Path(__file__).resolve().parents[3] / "ml" / "data" / "skyguard_station_coords.csv"
    if not csv_path.exists():
        return []

    stations = []
    with csv_path.open(newline="", encoding="utf-8") as csv_file:
        for row in csv.DictReader(csv_file):
            health_score = float(row["P_pct"])
            data_quality = row["data_quality"]
            if data_quality != "good":
                status = "NO_DATA"
            elif health_score < 70:
                status = "SERVICE_NOW"
            elif health_score < 90:
                status = "MONITOR"
            else:
                status = "HEALTHY"

            stations.append({
                "id": row["station_id"],
                "name": row["name"],
                "code": row["station_id"],
                "state": "India",
                "district": row["name"],
                "latitude": float(row["lat"]),
                "longitude": float(row["lon"]),
                "elevation_m": 0.0,
                "status": status,
                "health_score": health_score,
                "data_quality": data_quality,
            })
    return stations


def _add_skyguard_stations(db: Session, now: datetime):
    stations = _load_skyguard_stations()
    added = 0
    for station_info in stations:
        if db.query(Station).filter(Station.id == station_info["id"]).first():
            continue

        db.add(Station(
            id=station_info["id"],
            name=station_info["name"],
            code=station_info["code"],
            state=station_info["state"],
            district=station_info["district"],
            latitude=station_info["latitude"],
            longitude=station_info["longitude"],
            elevation_m=station_info["elevation_m"],
            status=station_info["status"],
            health_score=station_info["health_score"],
            last_seen=now,
            created_at=now,
            sensors_config={"source": "skyguard_station_coords.csv", "data_quality": station_info["data_quality"]}
        ))
        added += 1

    if added:
        db.commit()
    logger.info(f"Integrated {len(stations)} SkyGuard coordinate stations ({added} new).")
    return stations

def seed_database(db: Session):
    logger.info("Initializing database tables...")
    init_db()

    existing_count = db.query(Station).count()
    if existing_count > 0:
        logger.info(f"Database already contains {existing_count} stations. Skipping seed.")
        _add_skyguard_stations(db, datetime.utcnow())
        return

    logger.info(f"Seeding {len(IMD_STATIONS)} IMD Automatic Weather Stations...")
    now = datetime.utcnow()

    for s_info in IMD_STATIONS:
        st = Station(
            id=s_info["id"],
            name=s_info["name"],
            code=s_info["code"],
            state=s_info["state"],
            district=s_info["district"],
            latitude=s_info["latitude"],
            longitude=s_info["longitude"],
            elevation_m=s_info["elevation_m"],
            status=s_info["status"],
            health_score=s_info["health_score"],
            last_seen=now - timedelta(hours=14) if s_info["status"] == "NO_DATA" else now,
            created_at=now - timedelta(days=90),
            sensors_config={
                "temperature": {"model": "PT100 RTD Class A", "accuracy": "±0.1°C"},
                "humidity": {"model": "Capacitive Thin-Film Polymer", "accuracy": "±1.5%"},
                "pressure": {"model": "Piezoresistive Silicon Barometer", "accuracy": "±0.2 hPa"},
                "wind": {"model": "Ultrasonic 2D Anemometer", "accuracy": "±0.2 m/s"}
            }
        )
        db.add(st)

    db.commit()

    _add_skyguard_stations(db, now)

    # Generate 48 hours of time-series readings for active stations
    logger.info("Generating 48-hour continuous time-series sensor readings...")
    random.seed(42)

    for s_info in IMD_STATIONS:
        st_id = s_info["id"]
        elev = s_info["elevation_m"]
        lat = s_info["latitude"]

        # Skip generating recent readings for NO_DATA station
        if s_info["status"] == "NO_DATA":
            continue

        # Baseline sea-level pressure reduced by elevation (~1 hPa per 8.5m)
        base_pressure = 1013.25 * math.exp(-elev / 8430.0)
        base_temp = 32.0 - (elev / 1000.0) * 6.5

        for hour_idx in range(48, -1, -1):
            timestamp = now - timedelta(hours=hour_idx)
            hour_val = timestamp.hour + timestamp.minute / 60.0

            # Diurnal temperature cycle (peaks at 14:30, minimum at 05:30)
            t_diurnal = 6.5 * math.sin(2 * math.pi * (hour_val - 8.5) / 24.0)
            noise_t = random.uniform(-0.3, 0.3)
            temperature = base_temp + t_diurnal + noise_t

            # Diurnal pressure solar tides (S1 24h + S2 12h)
            # S2 maxima at 10:00 & 22:00, S1 maximum around 06:00
            s2_amp = 1.3 * (math.cos(math.radians(lat)) ** 2.5)
            s1 = 0.6 * math.cos(2 * math.pi * (hour_val - 6.0) / 24.0)
            s2 = s2_amp * math.cos(4 * math.pi * (hour_val - 10.0) / 24.0)
            pressure = base_pressure + s1 + s2 + random.uniform(-0.1, 0.1)

            # Humidity (inversely tracks temperature)
            rh = max(15.0, min(95.0, 75.0 - (t_diurnal * 4.0) + random.uniform(-3.0, 3.0)))

            # Solar radiation (0 at night, sinusoidal curve during day 06:00-18:30)
            if 6.0 <= hour_val <= 18.5:
                solar = 950.0 * math.sin(math.pi * (hour_val - 6.0) / 12.5) + random.uniform(-20.0, 20.0)
                solar = max(0.0, solar)
            else:
                solar = 0.0

            # Wind speed (convective peaking in afternoon)
            wind_speed = max(0.2, 3.5 + 2.0 * math.sin(math.pi * hour_val / 24.0) + random.uniform(-1.0, 1.5))
            wind_direction = (hour_val * 15.0 + random.uniform(-10.0, 10.0)) % 360.0

            # Dew point using Magnus approximation (must be < temperature)
            a = 17.27
            b = 237.7
            alpha = ((a * temperature) / (b + temperature)) + math.log(max(0.01, rh / 100.0))
            dew_point = (b * alpha) / (a - alpha)
            dew_point = min(temperature - 0.5, dew_point)

            # Fault injections for specific stations
            is_flagged = False
            flags = []

            # 1. Jaisalmer Drift
            if st_id == "AWS_JAI_01":
                # Inject a cumulative bias drift of +0.15°C per 12 hours
                drift_offset = (48 - hour_idx) * (3.5 / 48.0)
                temperature += drift_offset
                if drift_offset > 2.0:
                    is_flagged = True
                    flags.append("LAYER4_CUSUM_DRIFT")

            # 2. Cherrapunji Clogged Barometer (Dampened solar tide heartbeat)
            if st_id == "AWS_CHE_02":
                # Attenuate pressure oscillation to flatline
                pressure = base_pressure + random.uniform(-0.02, 0.02)
                is_flagged = True
                flags.append("LAYER3_HEARTBEAT_DAMPENED")

            # 3. Leh Step Jump in latest 6 hours
            if st_id == "AWS_LEH_01" and hour_idx <= 6:
                temperature += 4.5 # abrupt step offset
                is_flagged = True
                flags.append("LAYER2_SPATIAL_DISCORDANCE")

            reading = Reading(
                station_id=st_id,
                timestamp=timestamp,
                temperature=round(temperature, 2),
                relative_humidity=round(rh, 1),
                pressure=round(pressure, 2),
                wind_speed=round(wind_speed, 1),
                wind_direction=round(wind_direction, 1),
                solar_radiation=round(solar, 1),
                precipitation_rate=0.0,
                dew_point=round(dew_point, 2),
                battery_voltage=12.4,
                is_flagged=is_flagged,
                flags_json=flags
            )
            db.add(reading)

    # Seed Initial Alerts
    alert_seed_data = [
        {
            "station_id": "AWS_CHE_02",
            "sensor_type": "PRESSURE",
            "severity": "CRITICAL",
            "title": "Barometric Diurnal Solar Tide Attenuated",
            "message": "Layer 3 analysis identified zero diurnal tidal amplitude (r=0.04). Vent port clogging suspected.",
            "evidence": {"correlation": 0.04, "amplitude_hpa": 0.03, "expected_min_correlation": 0.70}
        },
        {
            "station_id": "AWS_JAI_01",
            "sensor_type": "TEMPERATURE",
            "severity": "WARNING",
            "title": "Cumulative Temperature Drift Detected",
            "message": "Layer 4a CUSUM analysis confirmed positive calibration drift of +0.22°C/day over 48h.",
            "evidence": {"cusum_stat": 6.8, "drift_velocity_c_per_day": 0.22}
        },
        {
            "station_id": "AWS_LEH_01",
            "sensor_type": "TEMPERATURE",
            "severity": "WARNING",
            "title": "Regional Spatial Discordance Detected",
            "message": "Layer 2 spatial cross-validation flagged a 2.7σ temperature divergence from regional network.",
            "evidence": {"z_score": 2.7, "neighbours_evaluated": 3}
        },
        {
            "station_id": "AWS_BHO_01",
            "sensor_type": "TELEMETRY",
            "severity": "CRITICAL",
            "title": "Telemetry Packet Dropout",
            "message": "Station has not transmitted telemetry packets for over 14 hours.",
            "evidence": {"missing_packets": 28, "last_heard": "14 hours ago"}
        }
    ]

    for a in alert_seed_data:
        alert = Alert(
            station_id=a["station_id"],
            sensor_type=a["sensor_type"],
            severity=a["severity"],
            status="ACTIVE",
            title=a["title"],
            message=a["message"],
            evidence_json=a["evidence"],
            created_at=now - timedelta(hours=random.randint(1, 10))
        )
        db.add(alert)

    # Seed initial work orders
    work_orders_data = [
        {
            "station_id": "AWS_CHE_02",
            "sensor_type": "PRESSURE",
            "priority": "CRITICAL",
            "technician": "Shri R. Sharma (IMD Guwahati Sub-Div)",
            "description": "Inspect barometric pressure port for insect bio-fouling or moisture lock; recalibrate barometer."
        },
        {
            "station_id": "AWS_JAI_01",
            "sensor_type": "TEMPERATURE",
            "priority": "HIGH",
            "technician": "Shri M. Patel (IMD Jodhpur Field Div)",
            "description": "Examine RTD radiation shield aspirator and verify thermocouple reference junction."
        },
        {
            "station_id": "AWS_BHO_01",
            "sensor_type": "TELEMETRY",
            "priority": "CRITICAL",
            "technician": "Shri K. Verma (IMD Bhopal Regional)",
            "description": "Check solar charge controller and cellular modem antenna connector."
        }
    ]

    for w in work_orders_data:
        wo = WorkOrder(
            station_id=w["station_id"],
            sensor_type=w["sensor_type"],
            priority=w["priority"],
            technician=w["technician"],
            description=w["description"],
            status="OPEN",
            created_at=now - timedelta(hours=5)
        )
        db.add(wo)

    db.commit()
    logger.info("Seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
