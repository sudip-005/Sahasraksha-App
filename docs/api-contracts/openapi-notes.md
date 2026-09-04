# SAHASRAKSHA API Contracts & Endpoints Specification

Base URL: `/api/v1`

## 1. Service Health
- `GET /health`
  - Response: `{ "status": "healthy", "service": "sahasraksha-backend", "database": "connected", "version": "1.0.0", "timestamp": "ISO8601" }`

## 2. Network Telemetry & Trend
- `GET /network/overview`
  - Response:
    ```json
    {
      "total_stations": 42,
      "healthy_stations": 34,
      "monitor_stations": 5,
      "service_now_stations": 2,
      "no_data_stations": 1,
      "network_health_pct": 88.5,
      "active_alerts_count": 7,
      "hourly_processed_readings": 240,
      "hourly_anomalies_detected": 4,
      "reporting_rate_pct": 97.6,
      "avg_latency_ms": 42.1
    }
    ```
- `GET /network/trend`
  - Query: `?days=10`
  - Response: Array of `{ "date": "YYYY-MM-DD", "health_pct": 89.2, "anomalies": 5, "reporting_pct": 98.1 }`

## 3. Station Management
- `GET /stations`
  - Query: `?status=SERVICE_NOW&search=delhi&page=1&limit=20&sort_by=health_score`
  - Response: `{ "items": [...StationHealthSummary], "total": 1, "page": 1, "pages": 1 }`
- `GET /stations/map`
  - Returns compact coordinate list for high-speed map marker clustering.
- `GET /stations/{id}`
  - Detailed metadata, current sensor readings, individual sensor health matrix.
- `GET /stations/{id}/readings`
  - Query: `?hours=24`
  - Raw time series data with quality flags.
- `GET /stations/{id}/diagnosis`
  - Full 4-layer Explainable AI diagnostic summary:
    - Layer 1 (Physics check outcome, violated rules)
    - Layer 2 (Spatial neighbour consensus, z-score, closest stations)
    - Layer 3 (Pressure heartbeat status: NORMAL / DAMPENED / INVERTED / UNAVAILABLE)
    - Layer 4 (CUSUM drift bias and ML tie-breaker score)
    - Plain-English conclusion and recommended corrective action.
- `GET /stations/{id}/heartbeat`
  - Hourly barometric pressure curve, synthetic reference tide wave (S1+S2), heartbeat strength metric, and threshold classification.
  - **Returns `heartbeat_status: "UNAVAILABLE"` if sampling < 24h.**

## 4. Alerts & Maintenance
- `GET /alerts`
  - Query: `?limit=10&status=ACTIVE&severity=CRITICAL`
- `POST /alerts/{id}/acknowledge`
- `GET /maintenance`
  - Grouped triage list: `service_now`, `monitor`, `healthy`.
- `POST /maintenance/work-orders`
  - Payload: `{ "station_id": "AWS_001", "sensor_type": "PRESSURE", "priority": "CRITICAL", "description": "Diurnal solar tide dampened; suspected transducer blockage" }`

## 5. Analytics
- `GET /analytics`
  - Failure mode distribution (Spike, Freeze, Drift, Step Jump, Noise, Dropout, Sluggish).
  - Diagnostic layer contribution percentages (Physics 45%, Spatial 30%, Heartbeat 15%, Drift/ML 10%).
  - Ingestion throughput metrics.

## 6. Demo Mode Fault Injection
- `POST /demo/inject-fault`
  - Payload: `{ "station_id": "AWS_001", "sensor_type": "TEMPERATURE", "fault_type": "DRIFT", "intensity": 3.5, "duration_minutes": 60 }`
- `POST /demo/reset`
  - Restores nominal station states.

## 7. Real-Time Streaming
- `WS /api/v1/live`
  - Pushes live telemetry events, anomaly triggers, and alert broadcasts in real time.
