import pytest

def test_get_alerts_list(client):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
    assert len(alerts) > 0
    first = alerts[0]
    assert "severity" in first
    assert "title" in first
    assert "status" in first

def test_acknowledge_alert(client):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    alert_id = alerts[0]["id"]

    ack_res = client.post(f"/api/v1/alerts/{alert_id}/acknowledge")
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "ACKNOWLEDGED"
