from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from .physics_service import PhysicsService, PhysicsValidationResult
from .spatial_service import SpatialService, SpatialValidationResult
from .heartbeat_service import HeartbeatService, HeartbeatAnalysisResult
from .drift_service import DriftService, DriftDetectionResult
from .ml_service import MLService, MLAnomalyResult
from ..schemas.demo import EvidenceCardData, StationDiagnosisResponse

class DetectionResult:
    def __init__(
        self,
        health_score: float,
        status: str, # HEALTHY, MONITOR, SERVICE_NOW, NO_DATA
        failure_type: str, # NONE, SPIKE, FREEZE, DRIFT, STEP, NOISE, DROPOUT, SLUGGISH
        summary: str,
        recommended_action: str,
        evidence_cards: List[EvidenceCardData],
        alerts_to_generate: List[Dict[str, Any]]
    ):
        self.health_score = health_score
        self.status = status
        self.failure_type = failure_type
        self.summary = summary
        self.recommended_action = recommended_action
        self.evidence_cards = evidence_cards
        self.alerts_to_generate = alerts_to_generate

class DetectionService:
    """
    Pipeline Aggregator: Orchestrates Layers 1-4, synthesizes Explainable AI (XAI)
    evidence cards, computes composite health score, and flags maintenance/alerts.
    """

    @classmethod
    def evaluate_station(
        cls,
        station: Any,
        readings: List[Any], # Ordered chronologically, newest last
        all_stations: List[Any],
        recent_readings_map: Dict[str, Any]
    ) -> DetectionResult:
        if not readings:
            return DetectionResult(
                health_score=0.0,
                status="NO_DATA",
                failure_type="DROPOUT",
                summary=f"Station '{station.name}' has ceased transmitting telemetry.",
                recommended_action="Dispatch field engineer to inspect power system, solar battery, or cellular modem.",
                evidence_cards=[
                    EvidenceCardData(
                        layer="Physics",
                        title="Telemetry Ingestion Check",
                        status="FAIL",
                        severity="CRITICAL",
                        confidence_pct=100.0,
                        observation="No telemetry records received within monitoring horizon.",
                        threshold="Max allowed telemetry gap: 6 hours",
                        explanation="Telemetry stream completely dropped out.",
                        key_metrics={"readings_count": 0}
                    )
                ],
                alerts_to_generate=[{
                    "sensor_type": "TELEMETRY",
                    "severity": "CRITICAL",
                    "title": f"Telemetry Ingestion Dropout: {station.name}",
                    "message": "Zero telemetry readings received in the last monitoring window.",
                    "evidence": {"readings_count": 0}
                }]
            )

        latest_reading = readings[-1]
        previous_reading = readings[-2] if len(readings) >= 2 else None

        # --- Layer 1: Physics Validation ---
        physics_res = PhysicsService.validate_reading(latest_reading, previous_reading)

        # --- Layer 2: Spatial Cross-Validation ---
        spatial_res = SpatialService.validate_station(
            target_station=station,
            target_reading=latest_reading,
            all_stations=all_stations,
            recent_readings_map=recent_readings_map,
            parameter="temperature"
        )

        # --- Layer 3: Diurnal Pressure Heartbeat ---
        heartbeat_res = HeartbeatService.analyze_readings(
            station_id=station.id,
            readings=readings,
            latitude=station.latitude
        )

        # --- Layer 4a: Cumulative Drift ---
        recent_temps = [
            float(r.temperature) for r in readings[-48:]
            if getattr(r, "temperature", None) is not None
        ]
        drift_res = DriftService.analyze_cusum(recent_temps)

        # Initial baseline health calculation
        base_score = 100.0
        alerts = []
        failure_type = "NONE"

        # Check for freeze (stuck values across last 5 readings)
        if len(readings) >= 5:
            last_5_t = [r.temperature for r in readings[-5:] if getattr(r, "temperature", None) is not None]
            if len(last_5_t) == 5 and max(last_5_t) == min(last_5_t):
                failure_type = "FREEZE"
                base_score -= 50.0

        # Layer 1 deductions
        if not physics_res.passed:
            deduction = 45.0 if physics_res.severity == "CRITICAL" else 20.0
            base_score -= deduction
            if failure_type == "NONE":
                failure_type = "SPIKE" if "jump" in str(physics_res.violations) else "PHYSICS_VIOLATION"
            alerts.append({
                "sensor_type": "TEMPERATURE" if "Dew point" in str(physics_res.violations) else "MULTI",
                "severity": "CRITICAL" if physics_res.severity == "CRITICAL" else "WARNING",
                "title": f"Physics Rule Violation at {station.name}",
                "message": "; ".join(physics_res.violations),
                "evidence": physics_res.details
            })

        # Layer 2 deductions
        if spatial_res.status == "FAIL":
            base_score -= 30.0
            if failure_type == "NONE":
                failure_type = "SPATIAL_DIVERGENCE"
            alerts.append({
                "sensor_type": "TEMPERATURE",
                "severity": "WARNING",
                "title": f"Spatial Divergence at {station.name}",
                "message": spatial_res.message,
                "evidence": {"z_score": spatial_res.z_score, "neighbours": spatial_res.neighbour_details}
            })
        elif spatial_res.status == "WARN":
            base_score -= 10.0

        # Layer 3 deductions (Respecting UNAVAILABLE rule)
        if heartbeat_res.status == "DAMPENED":
            base_score -= 25.0
            if failure_type == "NONE":
                failure_type = "SLUGGISH"
            alerts.append({
                "sensor_type": "PRESSURE",
                "severity": "WARNING",
                "title": f"Attenuated Diurnal Pressure Heartbeat at {station.name}",
                "message": heartbeat_res.message,
                "evidence": {"strength": heartbeat_res.strength, "status": heartbeat_res.status}
            })
        elif heartbeat_res.status == "INVERTED":
            base_score -= 40.0
            if failure_type == "NONE":
                failure_type = "INVERTED_PRESSURE"
            alerts.append({
                "sensor_type": "PRESSURE",
                "severity": "CRITICAL",
                "title": f"Inverted Atmospheric Tide at {station.name}",
                "message": heartbeat_res.message,
                "evidence": {"strength": heartbeat_res.strength}
            })
        # Note: If heartbeat_res.status == "UNAVAILABLE", NO deduction! We never penalize for insufficient window.

        # Layer 4a deductions
        if drift_res.has_drift:
            deduction = 20.0 if drift_res.severity == "HIGH" else 10.0
            base_score -= deduction
            if failure_type == "NONE":
                failure_type = "DRIFT"
            alerts.append({
                "sensor_type": "TEMPERATURE",
                "severity": "WARNING",
                "title": f"Cumulative Sensor Drift at {station.name}",
                "message": drift_res.message,
                "evidence": {"cusum_stat": drift_res.cusum_statistic, "rate": drift_res.estimated_drift_rate_per_day}
            })

        # --- Layer 4b: ML Tie-Breaker (Only in borderline zone) ---
        is_borderline = 60.0 <= base_score <= 85.0
        ml_res = MLService.evaluate_ambiguity(latest_reading, is_borderline=is_borderline)
        if is_borderline and ml_res.is_anomaly:
            base_score -= 15.0

        health_score = round(max(0.0, min(100.0, base_score)), 1)

        # Status categorization
        if health_score >= 85.0:
            status = "HEALTHY"
        elif health_score >= 60.0:
            status = "MONITOR"
        else:
            status = "SERVICE_NOW"

        # Evidence Cards synthesis for Explainable AI
        evidence_cards = [
            EvidenceCardData(
                layer="Physics",
                title="Thermodynamic & Bounds Validation",
                status="PASS" if physics_res.passed else "FAIL",
                severity=physics_res.severity,
                confidence_pct=99.0,
                observation=f"{'All 7 physical constraints satisfied.' if physics_res.passed else '; '.join(physics_res.violations)}",
                threshold="DewPoint <= Temp, Temp in [-40,60]°C, Press in [500,1080]hPa",
                explanation=(
                    "Deterministic verification that meteorological values conform strictly to thermodynamic "
                    "laws and instrumentation engineering limits."
                ),
                key_metrics=physics_res.details
            ),
            EvidenceCardData(
                layer="Spatial",
                title="Neighbour Regional Cross-Check",
                status=spatial_res.status,
                severity="HIGH" if spatial_res.status == "FAIL" else ("MEDIUM" if spatial_res.status == "WARN" else "NONE"),
                confidence_pct=spatial_res.agreement_pct,
                observation=spatial_res.message,
                threshold="|Z-score| < 2.0σ (Warn: 2.0-3.0σ, Fail: >3.0σ)",
                explanation="Haversine-weighted correlation against nearest operational AWS within regional radius.",
                key_metrics={"z_score": spatial_res.z_score, "agreement_pct": spatial_res.agreement_pct, "neighbours": spatial_res.nearest_neighbours_count}
            ),
            EvidenceCardData(
                layer="Heartbeat",
                title="Diurnal Solar-Tide Barometric Heartbeat",
                status=heartbeat_res.status,
                severity="CRITICAL" if heartbeat_res.status in ["INVERTED", "DAMPENED"] else "NONE",
                confidence_pct=round(heartbeat_res.strength * 100.0, 1),
                observation=heartbeat_res.message,
                threshold=f"Correlation >= {HeartbeatService.NORMAL_THRESHOLD} (Normal), < {HeartbeatService.ALARM_THRESHOLD} (Alarm)",
                explanation=(
                    "Atmospheric 12h/24h solar tide harmonic analysis. Returns UNAVAILABLE if data window < 24h."
                ),
                key_metrics={
                    "strength": heartbeat_res.strength,
                    "window_hours": heartbeat_res.sampling_window_hours,
                    "points": heartbeat_res.data_points_count
                }
            ),
            EvidenceCardData(
                layer="Drift-ML",
                title="CUSUM Bias & Multivariate Tie-Breaker",
                status="WARN" if drift_res.has_drift or ml_res.is_anomaly else "PASS",
                severity=drift_res.severity if drift_res.has_drift else ("LOW" if ml_res.is_anomaly else "NONE"),
                confidence_pct=round(ml_res.confidence * 100.0, 1),
                observation=f"{drift_res.message} | {ml_res.explanation}",
                threshold="CUSUM H=4.0; Isolation Forest joint boundary",
                explanation=(
                    "Continuous cumulative sum monitoring for slow sensor degradation, coupled with an ML tie-breaker "
                    "for multi-sensor ambiguity."
                ),
                key_metrics={"cusum_stat": drift_res.cusum_statistic, "ml_anomaly_score": ml_res.anomaly_score}
            )
        ]

        # Plain-English engineering conclusion
        if status == "HEALTHY":
            summary = (
                f"Station '{station.name}' is operating in full health (Score: {health_score}%). All 4 diagnostic "
                "layers confirmed thermodynamic validity, spatial agreement, and robust barometric oscillation."
            )
            recommended_action = "No intervention required. Routine telemetry cycle active."
        elif status == "MONITOR":
            summary = (
                f"Station '{station.name}' shows minor degradation (Score: {health_score}%). "
                f"Primary contributor: {failure_type}. Sensor readings remain usable but require observation."
            )
            recommended_action = "Schedule remote diagnostic sweep; verify calibration offset during next routine maintenance."
        else:
            summary = (
                f"URGENT: Station '{station.name}' has experienced sensor failure (Score: {health_score}%). "
                f"Identified failure pattern: {failure_type}. Multi-layer evidence indicates compromised telemetry."
            )
            recommended_action = "Issue high-priority work order. Dispatch technician to inspect sensor assembly."

        return DetectionResult(
            health_score=health_score,
            status=status,
            failure_type=failure_type,
            summary=summary,
            recommended_action=recommended_action,
            evidence_cards=evidence_cards,
            alerts_to_generate=alerts
        )
