from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from ...db.database import get_db
from ...services.station_service import StationService
from ...schemas.station import (
    PaginatedStationsResponse, StationDetail, StationMapPoint
)
from ...schemas.reading import ReadingResponse
from ...schemas.demo import StationDiagnosisResponse
from ...core.exceptions import StationNotFoundException

router = APIRouter()

@router.get("/stations", response_model=PaginatedStationsResponse)
def list_stations(
    search: Optional[str] = Query(None, description="Search by name, code, state, or district"),
    status: Optional[str] = Query(None, description="Filter: ALL, HEALTHY, MONITOR, SERVICE_NOW, NO_DATA"),
    sort_by: str = Query("health_score", description="Field to sort by: health_score, name, last_seen"),
    order: str = Query("asc", description="Sort direction: asc, desc"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return StationService.get_stations(
        db=db,
        search=search,
        status=status,
        sort_by=sort_by,
        order=order,
        page=page,
        limit=limit
    )

@router.get("/stations/map", response_model=List[StationMapPoint])
def get_stations_map(db: Session = Depends(get_db)):
    return StationService.get_map_points(db)

@router.get("/stations/{id}", response_model=StationDetail)
def get_station_detail(id: str, db: Session = Depends(get_db)):
    detail = StationService.get_station_detail(db, id)
    if not detail:
        raise StationNotFoundException(id)
    return detail

@router.get("/stations/{id}/readings", response_model=List[ReadingResponse])
def get_station_readings(
    id: str,
    hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db)
):
    detail = StationService.get_station_detail(db, id)
    if not detail:
        raise StationNotFoundException(id)
    return StationService.get_readings(db, id, hours)

@router.get("/stations/{id}/diagnosis", response_model=StationDiagnosisResponse)
def get_station_diagnosis(id: str, db: Session = Depends(get_db)):
    diag = StationService.get_diagnosis(db, id)
    if not diag:
        raise StationNotFoundException(id)
    return diag
