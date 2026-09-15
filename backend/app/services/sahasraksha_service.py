"""
Adapter around the validated Sahasraksha streaming detector.

The backend previously reimplemented detection independently of ml/sahasraksha
(a hardcoded analytical tide model in heartbeat_service, an IsolationForest
trained on np.random.normal in ml_service). Those reimplementations were never
validated -- none of the notebook's results applied to what the app actually
computed.

This module calls the real detector instead: the same StreamingSahasraksha
class that the notebook validates and that compiles to the ESP32 firmware.
Verdicts produced here are therefore the verdicts the published metrics
describe.

Design notes
------------
StreamingSahasraksha is an ONLINE detector: update() consumes one observation
and returns a verdict with no lookahead. It needs per-station harmonic
coefficients, which fit_coeffs() derives offline from that station's history.
We fit on the station's own readings, then replay them in order, and report
the final verdict -- which is exactly how the device behaves in the field.
"""
from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

# ml/ lives at the repo root, two levels above backend/app/services
_ML_DIR = Path(__file__).resolve().parents[3] / "ml"
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

from ..schemas.demo import EvidenceCardData

# Minimum observations before a harmonic fit is meaningful. Below this the
# detector cannot establish a climatology and we say so rather than guess.
MIN_READINGS_FOR_FIT = 48


@dataclass
class SahasrakshaVerdict:
    """Raw output of the real detector, before UI mapping."""
    available: bool
    reason: str = "unavailable"
    flag: int = 0
    severity: float = 0.0
    degradation: float = 0.0
    evidence: List[Any] = field(default_factory=list)
    readings_used: int = 0
    note: str = ""


# reason -> (failure_type, human summary, recommended action)
_REASON_MAP: Dict[str, tuple] = {
    "ok": ("NONE", "No anomaly detected in the current telemetry window.",
           "No action required. Continue routine monitoring."),
    "range": ("SPIKE", "A reading fell outside physically possible bounds.",
              "Inspect the sensor element and ADC path; a value this far out "
              "is a hardware fault, not weather."),
    "step": ("STEP", "Consecutive readings jumped further than physics allows.",
             "Check for loose wiring or an intermittent connection at the "
             "sensor interface."),
    "frozen": ("FREEZE", "The sensor repeated an identical value past the "
               "run-length limit.",
               "The element or its ADC has likely locked up. Power-cycle and, "
               "if it persists, replace the sensor."),
    "missing": ("DROPOUT", "One or more channels stopped reporting values.",
                "Verify power, storage and the cellular modem. Dispatch a "
                "field engineer if the gap persists."),
    "degrading": ("SLUGGISH", "The semidiurnal pressure tide has weakened -- "
                  "the barometer is responding sluggishly.",
                  "Schedule a barometer calibration check. Readings may still "
                  "look plausible while the instrument is already degrading."),
    "drift": ("DRIFT", "A small one-way bias has accumulated over an extended "
              "period.",
              "Schedule a calibration check against a reference instrument."),
    "anomaly": ("NOISE", "Residual behaviour is statistically inconsistent "
                "with this station's own history.",
                "Review the recent trace; if it persists, schedule an "
                "inspection."),
}

# evidence key prefix -> (layer, readable title, explanation)
_EVIDENCE_MAP = [
    ("range_",     "Physics",  "Gross range gate",
     "Value outside the physically possible bound for this channel. "
     "No training data is involved -- this is a hard limit."),
    ("step_",      "Physics",  "Step limit",
     "Change from the previous reading exceeded what the atmosphere can "
     "physically produce in one interval."),
    ("frozen_",    "Physics",  "Frozen run length",
     "Identical values repeated beyond the allowed run. A real sensor "
     "always shows some variation."),
    ("gate_dewpoint", "Physics", "Dewpoint law",
     "Dewpoint exceeded air temperature, which is thermodynamically "
     "impossible. An untrained physical gate."),
    ("spatial_z_",  "Spatial",  "Neighbour disagreement",
     "This station deviates from the median of its neighbours. Regional "
     "weather moves the whole network; a faulty sensor moves alone."),
    ("cusum_",      "Drift",    "CUSUM accumulation",
     "Small one-way bias accumulated over time. No single reading looks "
     "wrong, but the sum of them does."),
    ("tide_loss",   "Heartbeat", "S2 tide attenuation",
     "The semidiurnal solar pressure tide has weakened. This degrades "
     "before raw pressure values look wrong."),
    ("runlen_",     "Physics",  "Repeat run",
     "Repeated identical values detected on this channel."),
    ("z_",          "Residual", "Standardised residual",
     "Deviation from this station's own expected value, after removing the "
     "daily and annual cycles."),
]


def _classify_evidence(key: str) -> tuple:
    for prefix, layer, title, explanation in _EVIDENCE_MAP:
        if key.startswith(prefix) or key == prefix:
            return layer, title, explanation
    return "Residual", key, "Detector evidence term."


class SahasrakshaService:
    """Runs the validated streaming detector over a station's readings."""

    @classmethod
    def evaluate(cls, station: Any, readings: List[Any]) -> SahasrakshaVerdict:
        """Replay a station's readings through the real detector.

        Returns available=False when the station has too little history for a
        harmonic fit, rather than fabricating a climatology.
        """
        if not readings:
            return SahasrakshaVerdict(
                available=False, reason="missing", flag=1,
                note="No telemetry records in the monitoring window.")

        if len(readings) < MIN_READINGS_FOR_FIT:
            return SahasrakshaVerdict(
                available=False, readings_used=len(readings),
                note=(f"Only {len(readings)} observations available; the "
                      f"harmonic climatology needs at least "
                      f"{MIN_READINGS_FOR_FIT} before it is meaningful."))

        try:
            import numpy as np
            import pandas as pd
            from sahasraksha.stream import StreamingSahasraksha, fit_coeffs
        except Exception as exc:  # pragma: no cover - import environment issue
            return SahasrakshaVerdict(
                available=False,
                note=f"Detector unavailable in this environment: {exc}")

        lon = float(getattr(station, "longitude", 0.0) or 0.0)
        sid = str(station.id)

        rows = []
        for r in readings:
            rows.append({
                "station_id": sid,
                "timestamp": r.timestamp,
                "lon": lon,
                "T": r.temperature,
                "P": r.pressure,
                "RH": r.relative_humidity,
            })
        df = pd.DataFrame(rows).sort_values("timestamp").reset_index(drop=True)
        df["timestamp"] = pd.to_datetime(df["timestamp"])

        # A fit needs finite values; bail out honestly if the window is empty.
        if df[["T", "P", "RH"]].notna().any(axis=1).sum() < MIN_READINGS_FOR_FIT:
            return SahasrakshaVerdict(
                available=False, readings_used=len(df),
                note="Too many missing values to fit a climatology.")

        try:
            coeffs = fit_coeffs(df)
            if sid not in coeffs:
                return SahasrakshaVerdict(
                    available=False, readings_used=len(df),
                    note="Harmonic fit did not converge for this station.")

            detector = StreamingSahasraksha(coeffs)
            lst_series = ((df["timestamp"].dt.hour
                           + df["timestamp"].dt.minute / 60.0)
                          + lon / 15.0) % 24.0
            doy_series = df["timestamp"].dt.dayofyear.astype(float)

            verdict = None
            for i in range(len(df)):
                verdict = detector.update(
                    sid,
                    float(lst_series.iloc[i]),
                    float(doy_series.iloc[i]),
                    {"T": df["T"].iloc[i],
                     "P": df["P"].iloc[i],
                     "RH": df["RH"].iloc[i]},
                )
        except Exception as exc:  # pragma: no cover - defensive
            return SahasrakshaVerdict(
                available=False, readings_used=len(df),
                note=f"Detector error: {exc}")

        if verdict is None:
            return SahasrakshaVerdict(available=False, readings_used=len(df),
                                      note="Detector returned no verdict.")

        return SahasrakshaVerdict(
            available=True,
            reason=str(verdict.get("reason", "ok")),
            flag=int(verdict.get("flag", 0)),
            severity=float(verdict.get("severity", 0.0)),
            degradation=float(verdict.get("degradation", 0.0)),
            evidence=list(verdict.get("evidence", []) or []),
            readings_used=len(df),
        )

    # ------------------------------------------------------------------ UI

    @staticmethod
    def health_score(v: SahasrakshaVerdict) -> float:
        """Severity is 0-1 from the detector; health is its complement."""
        if not v.available:
            return 0.0
        return round(max(0.0, min(100.0, (1.0 - v.severity) * 100.0)), 1)

    @staticmethod
    def status(v: SahasrakshaVerdict) -> str:
        if not v.available:
            return "NO_DATA"
        if not v.flag:
            return "HEALTHY"
        if v.reason in ("range", "step", "frozen", "missing"):
            return "SERVICE_NOW"
        if v.severity >= 0.8:
            return "SERVICE_NOW"
        return "MONITOR"

    @staticmethod
    def failure_type(v: SahasrakshaVerdict) -> str:
        return _REASON_MAP.get(v.reason, ("NONE",))[0]

    @staticmethod
    def summary(v: SahasrakshaVerdict, station_name: str) -> str:
        if not v.available:
            return f"Station '{station_name}': {v.note}"
        mapped = _REASON_MAP.get(v.reason)
        if not mapped:
            return f"Station '{station_name}': detector reported '{v.reason}'."
        return f"Station '{station_name}': {mapped[1]}"

    @staticmethod
    def recommended_action(v: SahasrakshaVerdict) -> str:
        if not v.available:
            return ("Accumulate more telemetry before diagnosis. No "
                    "climatology can be fitted from the current window.")
        mapped = _REASON_MAP.get(v.reason)
        return mapped[2] if mapped else "Review the station's recent trace."

    @classmethod
    def evidence_cards(cls, v: SahasrakshaVerdict) -> List[EvidenceCardData]:
        """Map detector evidence terms onto explainable UI cards."""
        if not v.available:
            return [EvidenceCardData(
                layer="Physics",
                title="Climatology Fit",
                status="UNAVAILABLE",
                severity="NONE",
                confidence_pct=0.0,
                observation=v.note or "Insufficient history.",
                threshold=f"Minimum {MIN_READINGS_FOR_FIT} observations",
                explanation=("The detector refuses to fabricate a climatology "
                             "from too short a window. It reports nothing "
                             "rather than guessing."),
                key_metrics={"readings_used": v.readings_used},
            )]

        cards: List[EvidenceCardData] = []

        # Hard verdict card -- always present, states the overall call.
        is_flagged = bool(v.flag)
        cards.append(EvidenceCardData(
            layer="Fusion",
            title="Layer Fusion Verdict",
            status="FAIL" if is_flagged else "PASS",
            severity=("CRITICAL" if v.severity >= 0.8
                      else "HIGH" if v.severity >= 0.5
                      else "MEDIUM" if is_flagged else "NONE"),
            confidence_pct=round(v.severity * 100.0, 1) if is_flagged else 100.0,
            observation=(f"Detector reason: '{v.reason}', severity "
                         f"{v.severity:.3f}."),
            threshold="Any layer firing raises a flag (OR fusion)",
            explanation=("Six layers each catch a different family of failure. "
                         "This is the fused result, produced by the same "
                         "detector the published metrics describe."),
            key_metrics={"reason": v.reason, "severity": v.severity,
                         "observations_replayed": v.readings_used},
        ))

        # One card per evidence term the detector actually returned.
        # When nothing is flagged these are informational, not warnings --
        # marking a healthy station's residuals as WARN would be misleading.
        for item in v.evidence:
            try:
                key, value = item[0], item[1]
            except (TypeError, IndexError):
                continue
            layer, title, explanation = _classify_evidence(str(key))
            cards.append(EvidenceCardData(
                layer=layer,
                title=title,
                status="FAIL" if is_flagged else "PASS",
                severity="HIGH" if is_flagged else "NONE",
                confidence_pct=round(v.severity * 100.0, 1) if is_flagged else 100.0,
                observation=f"{key} = {value}",
                threshold="Per-layer threshold, see notebook Part 24",
                explanation=explanation,
                key_metrics={str(key): value},
            ))

        # The tide heartbeat is the signature layer; surface it explicitly
        # whenever it has a measurable reading.
        if v.degradation > 0.0:
            cards.append(EvidenceCardData(
                layer="Heartbeat",
                title="S2 Tide Heartbeat",
                status="FAIL" if v.degradation > 0.45 else "PASS",
                severity="HIGH" if v.degradation > 0.45 else "NONE",
                confidence_pct=round(v.degradation * 100.0, 1),
                observation=(f"Semidiurnal amplitude is "
                             f"{v.degradation * 100:.1f}% below this station's "
                             f"own established baseline."),
                threshold="Degradation above 0.45 flags the barometer",
                explanation=("Atmospheric pressure rises and falls twice daily "
                             "at every latitude. A fouled or sluggish barometer "
                             "damps that pulse before its raw values look "
                             "wrong."),
                key_metrics={"degradation": v.degradation},
            ))

        return cards
