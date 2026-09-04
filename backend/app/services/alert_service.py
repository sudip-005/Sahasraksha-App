from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..models import Alert, Station
from ..schemas.alert import AlertResponse

class AlertService:
    @staticmethod
    def get_alerts(
        db: Session,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50
    ) -> List[AlertResponse]:
        query = db.query(Alert, Station.name, Station.code).join(
            Station, Alert.station_id == Station.id
        )

        if status and status.upper() != "ALL":
            query = query.filter(Alert.status == status.upper())
        if severity and severity.upper() != "ALL":
            query = query.filter(Alert.severity == severity.upper())

        results = query.order_by(desc(Alert.created_at)).limit(limit).all()

        responses = []
        for alert, s_name, s_code in results:
            # Build evidence bullet points
            bullets = []
            ev = alert.evidence_json or {}
            for k, v in ev.items():
                bullets.append(f"{k.replace('_', ' ').title()}: {v}")

            responses.append(AlertResponse(
                id=alert.id,
                station_id=alert.station_id,
                sensor_type=alert.sensor_type,
                severity=alert.severity,
                status=alert.status,
                title=alert.title,
                message=alert.message,
                evidence_json=ev,
                created_at=alert.created_at,
                updated_at=alert.updated_at,
                station_name=s_name,
                station_code=s_code,
                evidence_bullets=bullets
            ))
        return responses

    @staticmethod
    def acknowledge_alert(db: Session, alert_id: int) -> Optional[AlertResponse]:
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if not alert:
            return None
        alert.status = "ACKNOWLEDGED"
        db.commit()
        db.refresh(alert)
        st = db.query(Station).filter(Station.id == alert.station_id).first()
        return AlertResponse(
            id=alert.id,
            station_id=alert.station_id,
            sensor_type=alert.sensor_type,
            severity=alert.severity,
            status=alert.status,
            title=alert.title,
            message=alert.message,
            evidence_json=alert.evidence_json or {},
            created_at=alert.created_at,
            updated_at=alert.updated_at,
            station_name=st.name if st else None,
            station_code=st.code if st else None,
            evidence_bullets=[]
        )
