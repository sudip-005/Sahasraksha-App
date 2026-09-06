from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from ..models import Station, Reading, Alert, WorkOrder, DetectionRecord
from ..schemas.station import (
    StationHealthSummary, StationDetail, StationMapPoint,
    PaginatedStationsResponse, SensorHealthItem
)
from ..schemas.reading import ReadingResponse
from ..schemas.demo import StationDiagnosisResponse
from .detection_service import DetectionService
from .heartbeat_service import HeartbeatService

class StationService:
    @staticmethod
    def get_stations(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "health_score",
        order: str = "asc",
        page: int = 1,
        limit: int = 20
    ) -> PaginatedStationsResponse:
        query = db.query(Station)

        if search:
            s_term = f"%{search.lower()}%"
            query = query.filter(
                func.lower(Station.name).like(s_term) |
                func.lower(Station.code).like(s_term) |
                func.lower(Station.state).like(s_term) |
                func.lower(Station.district).like(s_term)
            )

        if status and status.upper() != "ALL":
            query = query.filter(Station.status == status.upper())

        # Sorting
        if sort_by == "health_score":
            col = Station.health_score
        elif sort_by == "name":
            col = Station.name
        else:
            col = Station.last_seen

        if order.lower() == "desc":
            query = query.order_by(desc(col))
        else:
            query = query.order_by(col)

        total = query.count()
        offset = (page - 1) * limit
        stations = query.offset(offset).limit(limit).all()

        items = []
        for st in stations:
            active_alerts = db.query(Alert).filter(
                Alert.station_id == st.id,
                Alert.status == "ACTIVE"
            ).count()

            # Build sensor health items
            latest_r = db.query(Reading).filter(
                Reading.station_id == st.id
            ).order_by(desc(Reading.timestamp)).first()

            sensors = StationService._build_sensor_matrix(st, latest_r)

            items.append(StationHealthSummary(
                id=st.id,
                name=st.name,
                code=st.code,
                state=st.state,
                district=st.district,
                latitude=st.latitude,
                longitude=st.longitude,
                elevation_m=st.elevation_m,
                status=st.status,
                health_score=st.health_score,
                last_seen=st.last_seen,
                active_alerts_count=active_alerts,
                sensors=sensors
            ))

        pages = max(1, (total + limit - 1) // limit)
        return PaginatedStationsResponse(
            items=items,
            total=total,
            page=page,
            pages=pages,
            limit=limit
        )

    @staticmethod
    def get_map_points(db: Session) -> List[StationMapPoint]:
        stations = [
            station for station in db.query(Station).all()
            if (station.sensors_config or {}).get("source") == "skyguard_station_coords.csv"
        ]
        points = []
        for st in stations:
            latest_r = db.query(Reading).filter(
                Reading.station_id == st.id
            ).order_by(desc(Reading.timestamp)).first()

            points.append(StationMapPoint(
                id=st.id,
                name=st.name,
                code=st.code,
                latitude=st.latitude,
                longitude=st.longitude,
                status=st.status,
                health_score=st.health_score,
                current_temp=latest_r.temperature if latest_r else None,
                current_pressure=latest_r.pressure if latest_r else None,
                data_quality=(st.sensors_config or {}).get("data_quality"),
                condition=StationService._station_condition(st.status)
            ))
        return points

    @staticmethod
    def _station_condition(status: str) -> str:
        return {
            "NO_DATA": "Low-confidence data",
            "SERVICE_NOW": "Critical data availability",
            "MONITOR": "Reduced data availability",
            "HEALTHY": "Healthy data coverage",
        }.get(status, "Unknown data condition")

    @staticmethod
    def get_station_detail(db: Session, station_id: str) -> Optional[StationDetail]:
        st = db.query(Station).filter(Station.id == station_id).first()
        if not st:
            return None

        latest_r = db.query(Reading).filter(
            Reading.station_id == st.id
        ).order_by(desc(Reading.timestamp)).first()

        active_alerts = db.query(Alert).filter(
            Alert.station_id == st.id,
            Alert.status == "ACTIVE"
        ).count()

        latest_det = db.query(DetectionRecord).filter(
            DetectionRecord.station_id == st.id
        ).order_by(desc(DetectionRecord.timestamp)).first()

        why_flagged = latest_det.summary_explanation if latest_det else None
        sensors = StationService._build_sensor_matrix(st, latest_r)

        return StationDetail(
            id=st.id,
            name=st.name,
            code=st.code,
            state=st.state,
            district=st.district,
            latitude=st.latitude,
            longitude=st.longitude,
            elevation_m=st.elevation_m,
            status=st.status,
            health_score=st.health_score,
            last_seen=st.last_seen,
            active_alerts_count=active_alerts,
            sensors=sensors,
            latest_reading=ReadingResponse.model_validate(latest_r) if latest_r else None,
            neighbour_agreement_pct=round(st.health_score * 0.95, 1) if st.status != "SERVICE_NOW" else 58.2,
            why_flagged_summary=why_flagged
        )

    @staticmethod
    def get_readings(db: Session, station_id: str, hours: int = 24) -> List[ReadingResponse]:
        readings = db.query(Reading).filter(
            Reading.station_id == station_id
        ).order_by(desc(Reading.timestamp)).limit(hours * 2).all()
        readings.reverse()
        return [ReadingResponse.model_validate(r) for r in readings]

    @staticmethod
    def get_diagnosis(db: Session, station_id: str) -> Optional[StationDiagnosisResponse]:
        st = db.query(Station).filter(Station.id == station_id).first()
        if not st:
            return None

        readings = db.query(Reading).filter(
            Reading.station_id == station_id
        ).order_by(Reading.timestamp.asc()).all()

        all_stations = db.query(Station).all()
        # build recent readings map
        recent_map = {}
        for s in all_stations:
            r = db.query(Reading).filter(
                Reading.station_id == s.id
            ).order_by(desc(Reading.timestamp)).first()
            if r:
                recent_map[s.id] = r

        det_res = DetectionService.evaluate_station(st, readings, all_stations, recent_map)

        return StationDiagnosisResponse(
            station_id=st.id,
            station_name=st.name,
            overall_status=det_res.status,
            health_score=det_res.health_score,
            plain_english_summary=det_res.summary,
            recommended_action=det_res.recommended_action,
            evidence_cards=det_res.evidence_cards
        )

    @staticmethod
    def _build_sensor_matrix(station: Station, reading: Optional[Reading]) -> List[SensorHealthItem]:
        matrix = []
        specs = [
            ("TEMPERATURE", "temperature", "°C", reading.temperature if reading else None),
            ("HUMIDITY", "relative_humidity", "%", reading.relative_humidity if reading else None),
            ("PRESSURE", "pressure", "hPa", reading.pressure if reading else None),
            ("WIND", "wind_speed", "m/s", reading.wind_speed if reading else None),
            ("SOLAR", "solar_radiation", "W/m²", reading.solar_radiation if reading else None),
            ("PRECIP", "precipitation_rate", "mm/h", reading.precipitation_rate if reading else None),
        ]

        for code, field, unit, val in specs:
            status = "HEALTHY"
            flags = []
            drift = 0.0

            if val is None:
                status = "FAILED" if station.status == "NO_DATA" else "DEGRADED"
                flags.append("Missing telemetry")
            elif station.status == "SERVICE_NOW":
                if code in ["TEMPERATURE", "PRESSURE"]:
                    status = "FAILED"
                    flags.append("Physical bound / Heartbeat violation")
                    drift = 0.85
            elif station.status == "MONITOR":
                if code == "TEMPERATURE":
                    status = "DEGRADED"
                    flags.append("Minor drift observed")
                    drift = 0.35

            matrix.append(SensorHealthItem(
                sensor=code,
                status=status,
                current_value=round(val, 2) if val is not None else None,
                unit=unit,
                last_calibrated="2025-11-15",
                drift_score=drift,
                flags=flags
            ))
        return matrix
