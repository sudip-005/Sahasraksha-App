import math
from typing import List, Dict, Any, Optional
import numpy as np

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class SpatialValidationResult:
    def __init__(
        self,
        passed: bool,
        status: str, # PASS, WARN, FAIL, INSUFFICIENT_DATA
        z_score: float,
        agreement_pct: float,
        nearest_neighbours_count: int,
        neighbour_details: List[Dict[str, Any]],
        message: str
    ):
        self.passed = passed
        self.status = status
        self.z_score = z_score
        self.agreement_pct = agreement_pct
        self.nearest_neighbours_count = nearest_neighbours_count
        self.neighbour_details = neighbour_details
        self.message = message

class SpatialService:
    """
    Layer 2: Spatial cross-validation with nearest neighbour network.
    Uses Haversine distance, elevation lapse corrections, and spatial z-scores.
    """

    MAX_RADIUS_KM = 350.0 # Maximum radius to consider as a climatological neighbour
    LAPSE_RATE_TEMP_PER_KM = 6.5 # Standard atmospheric environmental lapse rate: -6.5°C per km

    @classmethod
    def validate_station(
        cls,
        target_station: Any,
        target_reading: Any,
        all_stations: List[Any],
        recent_readings_map: Dict[str, Any],
        parameter: str = "temperature"
    ) -> SpatialValidationResult:
        if not target_reading or getattr(target_reading, parameter, None) is None:
            return SpatialValidationResult(
                passed=True,
                status="INSUFFICIENT_DATA",
                z_score=0.0,
                agreement_pct=100.0,
                nearest_neighbours_count=0,
                neighbour_details=[],
                message="Target reading parameter is unavailable."
            )

        target_val = getattr(target_reading, parameter)
        target_lat = target_station.latitude
        target_lon = target_station.longitude
        target_elev = getattr(target_station, "elevation_m", 0.0)

        # 1. Identify neighbours within radius
        neighbours = []
        for st in all_stations:
            if st.id == target_station.id:
                continue
            dist = haversine_km(target_lat, target_lon, st.latitude, st.longitude)
            if dist <= cls.MAX_RADIUS_KM:
                st_reading = recent_readings_map.get(st.id)
                if st_reading and getattr(st_reading, parameter, None) is not None:
                    raw_neighbour_val = getattr(st_reading, parameter)
                    
                    # Apply elevation correction for temperature
                    elev_delta_km = (target_elev - getattr(st, "elevation_m", 0.0)) / 1000.0
                    corrected_val = raw_neighbour_val
                    if parameter == "temperature":
                        # Adjust neighbour value to target elevation
                        corrected_val = raw_neighbour_val - (elev_delta_km * cls.LAPSE_RATE_TEMP_PER_KM)

                    neighbours.append({
                        "station_id": st.id,
                        "name": st.name,
                        "distance_km": round(dist, 1),
                        "raw_val": raw_neighbour_val,
                        "corrected_val": round(corrected_val, 2)
                    })

        # Sort neighbours by distance
        neighbours.sort(key=lambda x: x["distance_km"])
        k_neighbours = neighbours[:5]

        if len(k_neighbours) < 2:
            return SpatialValidationResult(
                passed=True,
                status="PASS",
                z_score=0.0,
                agreement_pct=95.0,
                nearest_neighbours_count=len(k_neighbours),
                neighbour_details=k_neighbours,
                message=f"Sparse regional coverage ({len(k_neighbours)} neighbours). Defaulting to pass."
            )

        # 2. Compute spatial mean & standard deviation (with distance weighting)
        values = [n["corrected_val"] for n in k_neighbours]
        distances = [max(1.0, n["distance_km"]) for n in k_neighbours]
        weights = [1.0 / d for d in distances]
        weights = [w / sum(weights) for w in weights]

        weighted_mean = float(np.average(values, weights=weights))
        std_dev = float(np.std(values))
        min_std = 1.0 if parameter == "temperature" else 1.5 # baseline natural microclimate variability
        effective_std = max(std_dev, min_std)

        # 3. Compute spatial Z-Score
        z_score = abs(target_val - weighted_mean) / effective_std
        agreement_pct = round(max(0.0, min(100.0, (1.0 - (z_score / 3.5)) * 100.0)), 1)

        if z_score >= 3.0:
            status = "FAIL"
            passed = False
            msg = (
                f"Severe spatial divergence: {parameter.title()} {target_val} deviates by {round(z_score, 1)}σ "
                f"from neighbour consensus mean ({round(weighted_mean, 1)})."
            )
        elif z_score >= 2.0:
            status = "WARN"
            passed = True
            msg = (
                f"Moderate spatial discrepancy: {parameter.title()} {target_val} diverges by {round(z_score, 1)}σ "
                f"from nearby stations."
            )
        else:
            status = "PASS"
            passed = True
            msg = f"Strong spatial agreement ({agreement_pct}%) with {len(k_neighbours)} nearest stations."

        return SpatialValidationResult(
            passed=passed,
            status=status,
            z_score=round(z_score, 2),
            agreement_pct=agreement_pct,
            nearest_neighbours_count=len(k_neighbours),
            neighbour_details=k_neighbours,
            message=msg
        )
