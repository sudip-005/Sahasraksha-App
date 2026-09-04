import math
from datetime import datetime, timedelta
from app.services.heartbeat_service import HeartbeatService

class DummyReading:
    def __init__(self, pressure, timestamp):
        self.pressure = pressure
        self.timestamp = timestamp

def test_heartbeat_unavailable_on_insufficient_samples():
    # Only 5 samples (requires >= 20)
    now = datetime(2026, 6, 15, 12, 0, 0)
    readings = [
        DummyReading(1012.0, now - timedelta(hours=i))
        for i in range(5)
    ]
    readings.reverse()

    res = HeartbeatService.analyze_readings("ST_TEST", readings)
    assert res.status == "UNAVAILABLE"
    assert res.strength == 0.0
    assert "insufficient sampling" in res.message.lower()

def test_heartbeat_unavailable_on_short_timespan():
    # 25 samples but all within 2 hours
    now = datetime(2026, 6, 15, 12, 0, 0)
    readings = [
        DummyReading(1012.0 + (i * 0.01), now - timedelta(minutes=i * 4))
        for i in range(25)
    ]
    readings.reverse()

    res = HeartbeatService.analyze_readings("ST_TEST", readings)
    assert res.status == "UNAVAILABLE"
    assert res.strength == 0.0

def test_heartbeat_dampened_on_flatline_sensor():
    # 48 hourly samples with identical pressure (frozen diaphragm)
    now = datetime(2026, 6, 15, 12, 0, 0)
    readings = [
        DummyReading(1010.5, now - timedelta(hours=i))
        for i in range(48)
    ]
    readings.reverse()

    res = HeartbeatService.analyze_readings("ST_TEST", readings)
    assert res.status == "DAMPENED"
    assert res.strength <= 0.1
    assert "frozen sensor" in res.message.lower()

def test_heartbeat_normal_on_synthesized_solar_tides():
    # 48 hourly samples following realistic S1 + S2 solar tidal wave
    now = datetime(2026, 6, 15, 12, 0, 0)
    readings = []
    base_p = 1013.25
    for i in range(48, -1, -1):
        t = now - timedelta(hours=i)
        hour_val = t.hour
        s1 = 0.6 * math.cos(2 * math.pi * (hour_val - 6.0) / 24.0)
        s2 = 1.3 * math.cos(4 * math.pi * (hour_val - 10.0) / 24.0)
        p = base_p + s1 + s2
        readings.append(DummyReading(p, t))

    res = HeartbeatService.analyze_readings("ST_TEST", readings)
    assert res.status == "NORMAL"
    assert res.strength >= 0.70
    assert "nominal diurnal solar tide" in res.message.lower()
