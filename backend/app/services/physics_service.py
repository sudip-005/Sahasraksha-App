from typing import Optional, Dict, Any, List
from datetime import datetime

class PhysicsValidationResult:
    def __init__(self, passed: bool, violations: List[str], severity: str, details: Dict[str, Any]):
        self.passed = passed
        self.violations = violations
        self.severity = severity # NONE, LOW, MEDIUM, CRITICAL
        self.details = details

class PhysicsService:
    """
    Layer 1: Deterministic rule-based physical validation.
    Enforces thermodynamic consistency, physical limits, and impossible rate-of-change thresholds.
    Strictly deterministic - NO MACHINE LEARNING.
    """

    # Physical boundaries
    BOUNDS = {
        "temperature": (-40.0, 60.0),        # °C
        "relative_humidity": (0.0, 100.0),   # %
        "pressure": (500.0, 1080.0),         # hPa
        "wind_speed": (0.0, 75.0),           # m/s
        "wind_direction": (0.0, 360.0),      # degrees
        "solar_radiation": (0.0, 1400.0),    # W/m^2
        "precipitation_rate": (0.0, 300.0),  # mm/h
    }

    # Max physically possible rate of change per 15 minutes
    MAX_15MIN_RATE = {
        "temperature": 8.0,  # °C
        "pressure": 6.0,     # hPa
        "relative_humidity": 45.0 # %
    }

    @classmethod
    def validate_reading(
        cls,
        reading: Any,
        previous_reading: Optional[Any] = None
    ) -> PhysicsValidationResult:
        violations = []
        severity = "NONE"
        details: Dict[str, Any] = {}

        # 1. Extreme Physical Bounds Check
        for param, (low, high) in cls.BOUNDS.items():
            val = getattr(reading, param, None)
            if val is not None:
                if val < low or val > high:
                    violations.append(
                        f"{param.replace('_', ' ').title()} value {val} is outside physical limits [{low}, {high}]."
                    )
                    severity = "CRITICAL"
                    details[f"{param}_out_of_bounds"] = {"value": val, "expected_range": [low, high]}

        # 2. Thermodynamic Consistency: Dew Point <= Air Temperature
        temp = getattr(reading, "temperature", None)
        dew_point = getattr(reading, "dew_point", None)
        if temp is not None and dew_point is not None:
            # Tolerating up to 0.1°C instrument noise margin
            if dew_point > (temp + 0.1):
                violations.append(
                    f"Thermodynamic violation: Dew point ({dew_point}°C) exceeds ambient temperature ({temp}°C)."
                )
                severity = "CRITICAL"
                details["thermodynamic_inconsistency"] = {
                    "temperature": temp,
                    "dew_point": dew_point,
                    "delta": round(dew_point - temp, 2)
                }

        # 3. Solar Radiation at Night Check
        solar = getattr(reading, "solar_radiation", None)
        timestamp = getattr(reading, "timestamp", None)
        if solar is not None and timestamp is not None and isinstance(timestamp, datetime):
            hour = timestamp.hour
            # Approximate night hours in India (20:00 - 05:00)
            if (hour >= 20 or hour < 5) and solar > 5.0:
                violations.append(
                    f"Solar radiation anomaly: Sensor reports {solar} W/m² during nighttime (hour {hour}:00)."
                )
                if severity != "CRITICAL":
                    severity = "MEDIUM"
                details["nighttime_solar_radiation"] = {"hour": hour, "solar_radiation": solar}

        # 4. Temporal Rate-of-Change Check (if sequential reading provided)
        if previous_reading and timestamp and getattr(previous_reading, "timestamp", None):
            delta_sec = (timestamp - previous_reading.timestamp).total_seconds()
            if 0 < delta_sec <= 1800: # within 30 minutes
                time_ratio = 900.0 / delta_sec # normalize to 15 min

                prev_t = getattr(previous_reading, "temperature", None)
                if temp is not None and prev_t is not None:
                    t_jump = abs(temp - prev_t) * time_ratio
                    if t_jump > cls.MAX_15MIN_RATE["temperature"]:
                        violations.append(
                            f"Abrupt temperature jump: {round(t_jump, 1)}°C/15min exceeds physical gradient limit."
                        )
                        severity = "CRITICAL" if severity != "CRITICAL" else severity
                        details["temp_jump"] = {"jump_rate": round(t_jump, 2), "limit": cls.MAX_15MIN_RATE["temperature"]}

                prev_p = getattr(previous_reading, "pressure", None)
                curr_p = getattr(reading, "pressure", None)
                if curr_p is not None and prev_p is not None:
                    p_jump = abs(curr_p - prev_p) * time_ratio
                    if p_jump > cls.MAX_15MIN_RATE["pressure"]:
                        violations.append(
                            f"Abrupt pressure jump: {round(p_jump, 1)} hPa/15min exceeds physical acoustic limit."
                        )
                        severity = "CRITICAL"
                        details["pressure_jump"] = {"jump_rate": round(p_jump, 2), "limit": cls.MAX_15MIN_RATE["pressure"]}

        passed = len(violations) == 0
        return PhysicsValidationResult(
            passed=passed,
            violations=violations,
            severity=severity,
            details=details
        )
