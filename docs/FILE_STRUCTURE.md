# SAHASRAKSHA Repository File Structure

```
Sahasraksha/
├── .agents/
│   └── mcp_config.json
├── docs/
│   ├── FILE_STRUCTURE.md
│   ├── context/
│   │   └── ANTIGRAVITY_CONTEXT.md
│   └── api-contracts/
│       └── openapi-notes.md
├── docker-compose.yml
├── README.md
├── setup_sahasraksha.sh
├── .env.example
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── logging.py
│   │   │   └── exceptions.py
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── seed_mock_data.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── station.py
│   │   │   ├── reading.py
│   │   │   ├── alert.py
│   │   │   └── detection.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── station.py
│   │   │   ├── reading.py
│   │   │   ├── alert.py
│   │   │   ├── heartbeat.py
│   │   │   ├── maintenance.py
│   │   │   └── network.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── physics_service.py
│   │   │   ├── spatial_service.py
│   │   │   ├── heartbeat_service.py
│   │   │   ├── drift_service.py
│   │   │   ├── ml_service.py
│   │   │   ├── detection_service.py
│   │   │   ├── station_service.py
│   │   │   ├── alert_service.py
│   │   │   └── maintenance_service.py
│   │   ├── websocket/
│   │   │   ├── __init__.py
│   │   │   └── manager.py
│   │   └── api/
│   │       ├── __init__.py
│   │       └── routes/
│   │           ├── __init__.py
│   │           ├── health.py
│   │           ├── network.py
│   │           ├── stations.py
│   │           ├── alerts.py
│   │           ├── heartbeat.py
│   │           ├── maintenance.py
│   │           ├── live.py
│   │           ├── analytics.py
│   │           └── demo.py
│   └── tests/
│       ├── __init__.py
│       ├── test_health.py
│       ├── test_stations.py
│       ├── test_detection_service.py
│       ├── test_physics_service.py
│       ├── test_spatial_service.py
│       ├── test_heartbeat_service.py
│       └── test_alerts.py
└── frontend/
    ├── app.json
    ├── babel.config.js
    ├── index.js
    ├── metro.config.js
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── App.tsx
    └── src/
        ├── navigation/
        │   ├── RootNavigator.tsx
        │   ├── BottomTabNavigator.tsx
        │   └── types.ts
        ├── screens/
        │   ├── home/HomeScreen.tsx
        │   ├── map/MapScreen.tsx
        │   ├── alerts/AlertsScreen.tsx
        │   ├── stations/StationsScreen.tsx
        │   ├── stations/StationDetailScreen.tsx
        │   ├── diagnosis/DiagnosisScreen.tsx
        │   ├── heartbeat/PressureHeartbeatScreen.tsx
        │   ├── maintenance/MaintenanceScreen.tsx
        │   ├── live/LiveDetectionScreen.tsx
        │   ├── analytics/AnalyticsScreen.tsx
        │   ├── demo/DemoModeScreen.tsx
        │   ├── edge/EdgeAIScreen.tsx
        │   ├── validation/ValidationScreen.tsx
        │   └── settings/SettingsScreen.tsx
        ├── components/
        │   ├── common/
        │   ├── home/
        │   ├── stations/
        │   ├── alerts/
        │   ├── diagnosis/
        │   ├── maintenance/
        │   └── live/
        ├── map/
        ├── charts/
        ├── services/
        ├── hooks/
        ├── store/
        ├── types/
        ├── theme/
        └── utils/
```
