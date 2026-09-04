# SAHASRAKSHA: Context & Architecture Blueprint
**System Name:** SAHASRAKSHA (सहस्राक्ष — "The Thousand-Eyed Sentinel")
**Subtitle:** Intelligent Weather Station Health Monitoring Platform
**Target Domain:** India Meteorological Department (IMD) Automatic Weather Station (AWS) Network

---

## 1. Executive Summary & Purpose
SAHASRAKSHA is an intelligent, multi-layered sensor-failure detection platform specifically engineered for Automatic Weather Stations across India. 

> [!NOTE]
> **What SAHASRAKSHA Is:**
> A real-time sensor health monitoring, fault diagnosis, and maintenance dispatch platform detecting sensor drifts, freezes, spikes, electrical degradation, and data dropouts.
> 
> **What SAHASRAKSHA Is NOT:**
> This is **NOT** a weather forecasting application. It evaluates the credibility, integrity, and operational health of the physical instruments collecting meteorological data.

---

## 2. The 4-Layer Diagnostic Pipeline

```
Raw Telemetry (T, RH, P, WS, WD, SR, Rain)
          │
          ▼
┌───────────────────────────────────────┐
│ Layer 1: Deterministic Physics Check  │ ──► Dew-point <= Temp, thermodynamic limits,
└──────────────────┬────────────────────┘     physically impossible jumps
                   │
                   ▼
┌───────────────────────────────────────┐
│ Layer 2: Spatial Cross-Validation     │ ──► Haversine k-nearest neighbour agreement,
└──────────────────┬────────────────────┘     spatial z-scores, microclimate elevation delta
                   │
                   ▼
┌───────────────────────────────────────┐
│ Layer 3: Diurnal Pressure Heartbeat   │ ──► Atmospheric solar tides (S1 24h, S2 12h)
└──────────────────┬────────────────────┘     *Must return UNAVAILABLE if < 24h data*
                   │
                   ▼
┌───────────────────────────────────────┐
│ Layer 4: Drift & ML Tie-Breaker       │ ──► 4a: Cumulative CUSUM bias drift
└──────────────────┬────────────────────┘     4b: Isolation Forest (ambiguity tie-breaker only)
                   │
                   ▼
┌───────────────────────────────────────┐
│ Explainable AI (XAI) Synthesis & Alert│ ──► Plain-English reasoning, composite health score,
└───────────────────────────────────────┘     actionable alerts & work orders
```

### Layer 1: Rule-Based Physical Validation (No ML)
- **Thermodynamic Consistency:** $T_{dew} \le T_{air}$ at all times.
- **Physical Bounds:**
  - Temperature: $[-40^\circ\text{C}, 60^\circ\text{C}]$
  - Relative Humidity: $[0\%, 100\%]$
  - Atmospheric Pressure: $[500\,\text{hPa}, 1080\,\text{hPa}]$
  - Wind Speed: $[0\,\text{m/s}, 75\,\text{m/s}]$
  - Solar Radiation: $[0\,\text{W/m}^2, 1400\,\text{W/m}^2]$ (and exactly $0$ during night hours)
  - Rainfall rate: $[0\,\text{mm/h}, 300\,\text{mm/h}]$
- **Rate-of-Change Bounds:** e.g., $> 8^\circ\text{C}$ temperature change in 10 minutes without convective precipitation is flagged as anomalous.

### Layer 2: Spatial Consistency & Neighbour Cross-Check
- Computes Haversine distance to locate top $k$ (default 3 to 5) nearest operational stations within a search radius (e.g. 150 km).
- Accounts for elevation lapse rates (approx. $-6.5^\circ\text{C} / 1000\,\text{m}$) and sea-level pressure reduction.
- Computes spatial z-score: $Z = \frac{|x_i - \mu_{neighbours}|}{\sigma_{neighbours} + \epsilon}$.
- Generates neighbour agreement score percentage ($0-100\%$).

### Layer 3: Diurnal Pressure Heartbeat (Solar Tide Analysis)
- Atmospheric pressure displays universal semidiurnal solar tides ($S_1 \sim 24\,\text{h}$, $S_2 \sim 12\,\text{h}$) peaking at approx 10:00 and 22:00 local solar time, with minima around 04:00 and 16:00.
- When a barometric sensor freezes, drifts, or leaks, this rhythmic signature attenuates or disappears.
- **Strict Compliance:** When sampling has gaps, irregular timestamps, or spans $< 24$ hours, Layer 3 **MUST return `heartbeat_status = "UNAVAILABLE"`** rather than fabricating synthetic data or guessing.

### Layer 4: Drift Detection & ML Tie-Breaker
- **Layer 4a (Drift / CUSUM):** Cumulative sum control charts to catch gradual 0.1°C/day calibration slips that stay inside raw physical limits.
- **Layer 4b (ML Tie-Breaker):** Isolation Forest trained on multi-sensor feature space. **Primacy rule:** The ML layer is strictly a tie-breaker for subtle or ambiguous multi-variate correlations; it can never overturn deterministic physical rule violations from Layer 1 or 2.

---

## 3. Station Health States
- `HEALTHY`: Sensor suite operating within nominal tolerances (Health Score: 85 - 100%).
- `MONITOR`: Low-severity divergence, minor calibration drift, or single-sensor warning (Health Score: 60 - 84%).
- `SERVICE_NOW`: Critical physics violation, persistent freeze, electrical dropout, or confirmed failure requiring field dispatch (Health Score: < 60%).
- `NO_DATA`: Station silent, communication failure, or missing telemetry for $> 6$ hours.

---

## 4. 7 Failure Modes (Demo Injection)
1. **Spike:** Single or multi-sample extreme transient artifact (e.g. electrical interference).
2. **Freeze:** Identical value repeated across consecutive sampling intervals (e.g. frozen ADC/stuck bus).
3. **Drift:** Linear or exponential calibration decay over time.
4. **Step Jump:** Instantaneous offset shift (e.g. mechanical shock, recalibration error).
5. **Noise:** High variance gaussian jitter indicating degraded analog circuitry or loose wiring.
6. **Dropout:** Missing telemetry packets, null or NaN readings.
7. **Sluggish:** Attenuated diurnal response (e.g. bio-fouling, insect nest in radiation shield, clogged barometer).
