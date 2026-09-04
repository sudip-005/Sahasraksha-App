from typing import List, Dict, Any, Optional
import numpy as np

class DriftDetectionResult:
    def __init__(
        self,
        has_drift: bool,
        severity: str, # NONE, LOW, MEDIUM, HIGH
        drift_direction: str, # POSITIVE, NEGATIVE, NONE
        cusum_statistic: float,
        estimated_drift_rate_per_day: float,
        message: str
    ):
        self.has_drift = has_drift
        self.severity = severity
        self.drift_direction = drift_direction
        self.cusum_statistic = cusum_statistic
        self.estimated_drift_rate_per_day = estimated_drift_rate_per_day
        self.message = message

class DriftService:
    """
    Layer 4a: Cumulative Sum (CUSUM) Control Chart for slow sensor degradation.
    Identifies small, persistent calibration bias (e.g. +0.2°C/day) that remains
    inside absolute physical bounds.
    """

    @classmethod
    def analyze_cusum(
        cls,
        series: List[float],
        target_mean: Optional[float] = None,
        k_slack: float = 0.5,
        h_threshold: float = 4.0
    ) -> DriftDetectionResult:
        if len(series) < 15:
            return DriftDetectionResult(
                has_drift=False,
                severity="NONE",
                drift_direction="NONE",
                cusum_statistic=0.0,
                estimated_drift_rate_per_day=0.0,
                message="Insufficient continuous time-series data for CUSUM drift detection."
            )

        arr = np.array(series, dtype=float)
        mean_val = target_mean if target_mean is not None else float(np.mean(arr[:10]))
        std_val = max(0.2, float(np.std(arr[:10])))

        # Standardized residuals
        z = (arr - mean_val) / std_val

        # CUSUM accumulators
        s_pos = 0.0
        s_neg = 0.0
        max_s_pos = 0.0
        max_s_neg = 0.0

        for val in z:
            s_pos = max(0.0, s_pos + val - k_slack)
            s_neg = max(0.0, s_neg - val - k_slack)
            if s_pos > max_s_pos:
                max_s_pos = s_pos
            if s_neg > max_s_neg:
                max_s_neg = s_neg

        drift_stat = max(max_s_pos, max_s_neg)
        has_drift = drift_stat >= h_threshold

        if not has_drift:
            return DriftDetectionResult(
                has_drift=False,
                severity="NONE",
                drift_direction="NONE",
                cusum_statistic=round(drift_stat, 2),
                estimated_drift_rate_per_day=0.0,
                message="No cumulative bias drift detected. Sensor baseline calibration is stable."
            )

        # Determine direction and linear rate
        direction = "POSITIVE" if max_s_pos > max_s_neg else "NEGATIVE"
        time_steps = np.arange(len(arr))
        slope, _ = np.polyfit(time_steps, arr, 1)
        # Assuming hourly sampling, 24 steps = 1 day
        drift_rate_per_day = round(slope * 24.0, 3)

        if drift_stat > (h_threshold * 2.0):
            severity = "HIGH"
        else:
            severity = "MEDIUM"

        msg = (
            f"Persistent cumulative drift detected ({direction.lower()}). "
            f"CUSUM stat={round(drift_stat, 1)} (threshold={h_threshold}). "
            f"Estimated drift velocity: {drift_rate_per_day} units/day."
        )

        return DriftDetectionResult(
            has_drift=True,
            severity=severity,
            drift_direction=direction,
            cusum_statistic=round(drift_stat, 2),
            estimated_drift_rate_per_day=drift_rate_per_day,
            message=msg
        )
