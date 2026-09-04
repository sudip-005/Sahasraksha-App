from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.ensemble import IsolationForest

class MLAnomalyResult:
    def __init__(
        self,
        is_anomaly: bool,
        anomaly_score: float, # 0.0 (nominal) to 1.0 (severe anomaly)
        confidence: float,
        is_tie_breaker_applied: bool,
        explanation: str
    ):
        self.is_anomaly = is_anomaly
        self.anomaly_score = anomaly_score
        self.confidence = confidence
        self.is_tie_breaker_applied = is_tie_breaker_applied
        self.explanation = explanation

class MLService:
    """
    Layer 4b: Multivariate Machine Learning Anomaly Tie-Breaker.
    
    STRICT ARCHITECTURAL RULE:
    Machine Learning is ONLY invoked as a tie-breaker when deterministic Layers 1-3
    leave the station health in an ambiguous borderline zone (health score ~ 60-84%).
    ML CANNOT override clear deterministic physical violations.
    """

    _model: Optional[IsolationForest] = None

    @classmethod
    def _get_or_train_baseline_model(cls) -> IsolationForest:
        if cls._model is None:
            # Train a light synthetic baseline IsolationForest on typical atmospheric covariance
            np.random.seed(42)
            n_samples = 500
            temps = np.random.normal(28.0, 6.0, n_samples)
            # RH inversely correlates with temperature
            rhs = np.clip(100.0 - (temps - 15.0) * 2.5 + np.random.normal(0, 8.0, n_samples), 10.0, 98.0)
            pressures = np.random.normal(1010.0, 5.0, n_samples)
            winds = np.clip(np.random.exponential(3.5, n_samples), 0.0, 25.0)

            X_baseline = np.column_stack([temps, rhs, pressures, winds])
            model = IsolationForest(contamination=0.05, random_state=42)
            model.fit(X_baseline)
            cls._model = model
        return cls._model

    @classmethod
    def evaluate_ambiguity(
        cls,
        reading: Any,
        is_borderline: bool = False
    ) -> MLAnomalyResult:
        if not is_borderline:
            return MLAnomalyResult(
                is_anomaly=False,
                anomaly_score=0.1,
                confidence=0.95,
                is_tie_breaker_applied=False,
                explanation="Deterministic layers conclusive. ML tie-breaker standby."
            )

        model = cls._get_or_train_baseline_model()
        temp = getattr(reading, "temperature", 25.0) or 25.0
        rh = getattr(reading, "relative_humidity", 60.0) or 60.0
        press = getattr(reading, "pressure", 1010.0) or 1010.0
        wind = getattr(reading, "wind_speed", 3.0) or 3.0

        sample = np.array([[temp, rh, press, wind]])
        raw_score = -float(model.score_samples(sample)[0]) # higher means more anomalous
        pred = model.predict(sample)[0] # -1 anomaly, 1 inlier

        normalized_score = max(0.0, min(1.0, (raw_score - 0.35) * 3.5))
        is_anomaly = pred == -1 or normalized_score > 0.65

        if is_anomaly:
            msg = (
                f"ML Tie-Breaker: Multivariate Isolation Forest identified anomalous joint probability "
                f"(score: {round(normalized_score, 2)}) across temperature-humidity-pressure covariance."
            )
        else:
            msg = (
                f"ML Tie-Breaker: Multi-sensor feature vector conforms to expected atmospheric joint distributions "
                f"(anomaly score: {round(normalized_score, 2)})."
            )

        return MLAnomalyResult(
            is_anomaly=is_anomaly,
            anomaly_score=round(normalized_score, 2),
            confidence=round(0.80 + abs(0.5 - normalized_score) * 0.3, 2),
            is_tie_breaker_applied=True,
            explanation=msg
        )
