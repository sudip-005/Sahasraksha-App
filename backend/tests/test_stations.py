import pytest

def test_get_stations_list(client):
    response = client.get("/api/v1/stations")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) > 0

def test_get_stations_map(client):
    response = client.get("/api/v1/stations/map")
    assert response.status_code == 200
    points = response.json()
    assert isinstance(points, list)
    assert len(points) > 0
    first = points[0]
    assert "latitude" in first
    assert "longitude" in first
    assert "status" in first

    ml_point = next(point for point in points if point["id"] == "42111099999")
    assert ml_point["latitude"] == 30.317
    assert ml_point["longitude"] == 78.033
    assert ml_point["health_score"] == 97.1
    assert ml_point["condition"] == "Healthy data coverage"

def test_get_station_detail(client):
    response = client.get("/api/v1/stations/AWS_DEL_01")
    assert response.status_code == 200
    detail = response.json()
    assert detail["id"] == "AWS_DEL_01"
    assert "Safdarjung" in detail["name"]
    assert "sensors" in detail
    assert len(detail["sensors"]) == 6

def test_get_station_not_found(client):
    response = client.get("/api/v1/stations/NON_EXISTENT_STATION")
    assert response.status_code == 404
