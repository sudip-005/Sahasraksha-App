from datetime import datetime, timedelta
from app.services.detection_service import DetectionService

class DummyStation:
    def __init__(self, id="AWS_01", name="Test Station", latitude=28.5, longitude=77.2, elevation_m=200.0):
        self.id = id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.elevation_m = elevation_m

class DummyReading:
    def __init__(self, t=28.0, rh=60.0, p=1010.0, dp=20.0, ts=None):
        self.temperature = t
        self.relative_humidity = rh
        self.pressure = p
        self.wind_speed = 3.0
        self.wind_direction = 180.0
        self.solar_radiation = 500.0
        self.precipitation_rate = 0.0
        self.dew_point = dp
        self.timestamp = ts or datetime.utcnow()

def test_detection_service_healthy_flow():
    st = DummyStation()
    now = datetime.utcnow()
    readings = [
        DummyReading(t=25.0 + (i % 3), p=1012.0 + (i % 2), ts=now - timedelta(hours=30 - i))
        for i in range(30)
    ]

    res = DetectionService.evaluate_station(st, readings, [st], {st.id: readings[-1]})
    assert res.status in ["HEALTHY", "MONITOR"]
    assert res.health_score >= 60.0
    assert len(res.evidence_cards) == 4
    assert res.evidence_cards[0].layer == "Physics"
    assert res.evidence_cards[1].layer == "Spatial"
    assert res.evidence_cards[2].layer == "Heartbeat"
    assert res.evidence_cards[3].layer == "Drift-ML"

def test_detection_service_no_data():
    st = DummyStation()
    res = DetectionService.evaluate_station(st, [], [st], {})
    assert res.status == "NO_DATA"
    assert res.health_score == 0.0
    assert res.failure_type == "DROPOUT"
    assert len(res.alerts_to_generate) == 1
