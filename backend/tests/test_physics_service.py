from datetime import datetime, timedelta
from app.services.physics_service import PhysicsService

class DummyReading:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

def test_nominal_physics_reading():
    reading = DummyReading(
        temperature=28.5,
        relative_humidity=65.0,
        pressure=1012.4,
        wind_speed=4.2,
        wind_direction=180.0,
        solar_radiation=650.0,
        precipitation_rate=0.0,
        dew_point=21.0,
        timestamp=datetime(2026, 6, 15, 12, 0, 0)
    )
    res = PhysicsService.validate_reading(reading)
    assert res.passed is True
    assert len(res.violations) == 0
    assert res.severity == "NONE"

def test_thermodynamic_violation_dew_point_exceeds_temp():
    reading = DummyReading(
        temperature=22.0,
        dew_point=25.5, # Dew point > Temperature is physically impossible
        relative_humidity=85.0,
        pressure=1010.0,
        timestamp=datetime(2026, 6, 15, 12, 0, 0)
    )
    res = PhysicsService.validate_reading(reading)
    assert res.passed is False
    assert any("Thermodynamic violation" in v for v in res.violations)
    assert res.severity == "CRITICAL"

def test_extreme_bounds_violation():
    reading = DummyReading(
        temperature=85.0, # Outside [-40, 60]°C
        dew_point=15.0,
        relative_humidity=120.0, # Outside [0, 100]%
        pressure=450.0, # Outside [500, 1080] hPa
        timestamp=datetime(2026, 6, 15, 12, 0, 0)
    )
    res = PhysicsService.validate_reading(reading)
    assert res.passed is False
    assert len(res.violations) >= 3
    assert res.severity == "CRITICAL"

def test_abrupt_temperature_jump():
    t0 = datetime(2026, 6, 15, 12, 0, 0)
    t1 = t0 + timedelta(minutes=10)
    r0 = DummyReading(temperature=25.0, pressure=1010.0, timestamp=t0)
    r1 = DummyReading(temperature=36.0, pressure=1010.0, timestamp=t1, dew_point=20.0) # 11°C jump in 10 mins

    res = PhysicsService.validate_reading(r1, previous_reading=r0)
    assert res.passed is False
    assert any("jump" in v.lower() for v in res.violations)
