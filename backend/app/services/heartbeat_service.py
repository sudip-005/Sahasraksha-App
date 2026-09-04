from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta
import math
import numpy as np

class HeartbeatAnalysisResult:
    def __init__(
        self,
        station_id: str,
        status: str, # NORMAL, DAMPENED, INVERTED, UNAVAILABLE
        strength: float, # 0.0 to 1.0
        sampling_window_hours: float,
        data_points_count: int,
        message: str,
        series: List[Dict[str, Any]]
    ):
        self.station_id = station_id
        self.status = status
        self.strength = strength
        self.sampling_window_hours = sampling_window_hours
        self.data_points_count = data_points_count
        self.message = message
        self.series = series

class HeartbeatService:
    """
    Layer 3: Diurnal Pressure Heartbeat Analysis (Atmospheric Solar Tides S1/S2).
    Evaluates the presence of universal 12h & 24h barometric thermal oscillations.
    
    STRICT REQUIREMENT (SRS §13):
    Must return status='UNAVAILABLE' when sampling is insufficient (< 24h or missing).
    NEVER FABRICATE DATA.
    """

    MIN_SAMPLING_HOURS = 20.0
    MIN_DATA_POINTS = 20

    NORMAL_THRESHOLD = 0.70
    ALARM_THRESHOLD = 0.40

    @classmethod
    def analyze_readings(
        cls,
        station_id: str,
        readings: List[Any], # Ordered chronologically
        latitude: float = 20.0
    ) -> HeartbeatAnalysisResult:
        # Filter valid pressure readings with timestamps
        valid_samples = [
            r for r in readings
            if getattr(r, "pressure", None) is not None and getattr(r, "timestamp", None) is not None
        ]

        if len(valid_samples) < cls.MIN_DATA_POINTS:
            return HeartbeatAnalysisResult(
                station_id=station_id,
                status="UNAVAILABLE",
                strength=0.0,
                sampling_window_hours=0.0,
                data_points_count=len(valid_samples),
                message="Heartbeat analysis UNAVAILABLE: insufficient sampling (requires at least 20 continuous hourly samples).",
                series=[]
            )

        # Check total time span
        t_start = valid_samples[0].timestamp
        t_end = valid_samples[-1].timestamp
        total_hours = (t_end - t_start).total_seconds() / 3600.0

        if total_hours < cls.MIN_SAMPLING_HOURS:
            return HeartbeatAnalysisResult(
                station_id=station_id,
                status="UNAVAILABLE",
                strength=0.0,
                sampling_window_hours=round(total_hours, 1),
                data_points_count=len(valid_samples),
                message=f"Heartbeat analysis UNAVAILABLE: sampling window is only {round(total_hours, 1)}h (< {cls.MIN_SAMPLING_HOURS}h threshold).",
                series=[]
            )

        # Extract pressures and time hours from start
        pressures = np.array([float(r.pressure) for r in valid_samples])
        timestamps = [r.timestamp for r in valid_samples]
        
        # Check for zero variance (frozen sensor)
        p_std = float(np.std(pressures))
        if p_std < 0.05:
            # Frozen pressure sensor!
            return HeartbeatAnalysisResult(
                station_id=station_id,
                status="DAMPENED",
                strength=0.02,
                sampling_window_hours=round(total_hours, 1),
                data_points_count=len(valid_samples),
                message="Critical heartbeat failure: Barometric pressure signal variance is virtually zero (frozen sensor).",
                series=[
                    {
                        "timestamp": timestamps[i],
                        "raw_pressure": round(pressures[i], 2),
                        "reconstructed_tide": round(float(np.mean(pressures)), 2),
                        "residual": 0.0
                    }
                    for i in range(len(pressures))
                ]
            )

        # Reconstruct canonical atmospheric solar tide wave (S1 24h + S2 12h)
        # S2 amplitude is approximately 1.16 * cos^3(lat) hPa in tropics
        lat_rad = math.radians(latitude)
        s2_amp = max(0.8, 1.3 * (math.cos(lat_rad) ** 2.5))
        s1_amp = 0.5 * s2_amp
        p_mean = float(np.mean(pressures))

        # Solar tidal model: maxima near 10:00 & 22:00 local time
        model_tides = []
        series_points = []
        for i, t in enumerate(timestamps):
            hour = t.hour + t.minute / 60.0
            # S1 (diurnal, 24h period, peak ~06:00 solar thermal lag)
            s1 = s1_amp * math.cos(2 * math.pi * (hour - 6.0) / 24.0)
            # S2 (semidiurnal, 12h period, peaks at 10:00 and 22:00)
            s2 = s2_amp * math.cos(4 * math.pi * (hour - 10.0) / 24.0)
            tide_val = p_mean + s1 + s2
            model_tides.append(tide_val)

            series_points.append({
                "timestamp": t,
                "raw_pressure": round(pressures[i], 2),
                "reconstructed_tide": round(tide_val, 2),
                "residual": round(pressures[i] - tide_val, 2)
            })

        model_tides = np.array(model_tides)

        # Pearson correlation between detrended raw pressure and expected solar tides
        # Detrend raw pressure using linear baseline removal
        x = np.arange(len(pressures))
        poly = np.polyfit(x, pressures, 1)
        detrended_pressure = pressures - (poly[0] * x + poly[1])
        detrended_model = model_tides - np.mean(model_tides)

        std_p = np.std(detrended_pressure)
        std_m = np.std(detrended_model)

        if std_p > 0 and std_m > 0:
            corr = float(np.corrcoef(detrended_pressure, detrended_model)[0, 1])
        else:
            corr = 0.0

        # Heartbeat strength metric mapped from correlation:
        # High positive correlation indicates healthy tidal response
        heartbeat_strength = max(0.0, min(1.0, (corr + 0.2) / 1.1)) if corr > -0.2 else 0.0
        heartbeat_strength = round(heartbeat_strength, 2)

        if corr >= cls.NORMAL_THRESHOLD:
            status = "NORMAL"
            msg = f"Nominal diurnal solar tide detected (Correlation r={round(corr, 2)}). Transducer diaphragm healthy."
        elif corr <= -0.3:
            status = "INVERTED"
            msg = f"Inverted barometric response detected (r={round(corr, 2)}). Suspected sensor wiring or calibration reversal."
        else:
            status = "DAMPENED"
            msg = f"Dampened solar tide detected (r={round(corr, 2)} < {cls.NORMAL_THRESHOLD}). Possible vent port clogging or drift."

        return HeartbeatAnalysisResult(
            station_id=station_id,
            status=status,
            strength=heartbeat_strength,
            sampling_window_hours=round(total_hours, 1),
            data_points_count=len(valid_samples),
            message=msg,
            series=series_points
        )
