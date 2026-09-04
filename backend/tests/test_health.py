import pytest

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "SAHASRAKSHA" in data["title"]
    assert data["version"] == "1.0.0"

def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["service"] == "SAHASRAKSHA"
    assert "database" in data
