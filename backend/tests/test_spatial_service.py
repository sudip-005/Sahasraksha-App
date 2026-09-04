from app.services.spatial_service import SpatialService, haversine_km

class DummyStation:
    def __init__(self, id, name, latitude, longitude, elevation_m=0.0):
        self.id = id
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.elevation_m = elevation_m

class DummyReading:
    def __init__(self, temperature):
        self.temperature = temperature

def test_haversine_calculation():
    # Delhi to Mumbai distance is ~1150 km
    dist = haversine_km(28.5833, 77.2083, 18.8980, 72.8100)
    assert 1100 < dist < 1250

def test_spatial_agreement_concordant():
    target_st = DummyStation("ST_1", "Center Post", 28.0, 77.0)
    target_reading = DummyReading(temperature=30.0)

    # 3 nearby stations within 50 km with similar temperatures
    neighbours = [
        DummyStation("ST_2", "North Post", 28.2, 77.0),
        DummyStation("ST_3", "East Post", 28.0, 77.2),
        DummyStation("ST_4", "South Post", 27.8, 77.0),
    ]
    readings_map = {
        "ST_2": DummyReading(temperature=29.8),
        "ST_3": DummyReading(temperature=30.2),
        "ST_4": DummyReading(temperature=30.0),
    }

    res = SpatialService.validate_station(
        target_station=target_st,
        target_reading=target_reading,
        all_stations=[target_st] + neighbours,
        recent_readings_map=readings_map,
        parameter="temperature"
    )

    assert res.status == "PASS"
    assert res.z_score < 1.0
    assert res.agreement_pct > 80.0

def test_spatial_divergence_discordant():
    target_st = DummyStation("ST_1", "Center Post", 28.0, 77.0)
    target_reading = DummyReading(temperature=45.0) # Highly discordant

    neighbours = [
        DummyStation("ST_2", "North Post", 28.2, 77.0),
        DummyStation("ST_3", "East Post", 28.0, 77.2),
        DummyStation("ST_4", "South Post", 27.8, 77.0),
    ]
    readings_map = {
        "ST_2": DummyReading(temperature=25.0),
        "ST_3": DummyReading(temperature=25.2),
        "ST_4": DummyReading(temperature=24.8),
    }

    res = SpatialService.validate_station(
        target_station=target_st,
        target_reading=target_reading,
        all_stations=[target_st] + neighbours,
        recent_readings_map=readings_map,
        parameter="temperature"
    )

    assert res.status == "FAIL"
    assert res.z_score >= 3.0
    assert res.agreement_pct < 50.0
