from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from ..models import WorkOrder, Station
from ..schemas.maintenance import WorkOrderCreate, WorkOrderResponse, MaintenanceGroup

class MaintenanceService:
    @staticmethod
    def get_maintenance_group(db: Session) -> MaintenanceGroup:
        orders = db.query(WorkOrder, Station.name, Station.code).join(
            Station, WorkOrder.station_id == Station.id
        ).order_by(desc(WorkOrder.created_at)).all()

        service_now = []
        monitor = []
        healthy = []

        for wo, s_name, s_code in orders:
            resp = WorkOrderResponse(
                id=wo.id,
                station_id=wo.station_id,
                sensor_type=wo.sensor_type,
                priority=wo.priority,
                status=wo.status,
                description=wo.description,
                technician=wo.technician,
                created_at=wo.created_at,
                updated_at=wo.updated_at,
                station_name=s_name,
                station_code=s_code
            )
            if wo.priority == "CRITICAL" or wo.priority == "HIGH":
                service_now.append(resp)
            elif wo.priority == "MEDIUM":
                monitor.append(resp)
            else:
                healthy.append(resp)

        return MaintenanceGroup(
            service_now=service_now,
            monitor=monitor,
            healthy=healthy,
            total_open_orders=len([o for o, _, _ in orders if o.status != "COMPLETED"])
        )

    @staticmethod
    def create_work_order(db: Session, data: WorkOrderCreate) -> WorkOrderResponse:
        wo = WorkOrder(
            station_id=data.station_id,
            sensor_type=data.sensor_type,
            priority=data.priority,
            description=data.description,
            technician=data.technician,
            status="OPEN"
        )
        db.add(wo)
        db.commit()
        db.refresh(wo)

        st = db.query(Station).filter(Station.id == data.station_id).first()
        return WorkOrderResponse(
            id=wo.id,
            station_id=wo.station_id,
            sensor_type=wo.sensor_type,
            priority=wo.priority,
            status=wo.status,
            description=wo.description,
            technician=wo.technician,
            created_at=wo.created_at,
            updated_at=wo.updated_at,
            station_name=st.name if st else None,
            station_code=st.code if st else None
        )
