# SAHASRAKSHA

Intelligent Weather Station Health Monitoring — sensor-failure detection
platform for IMD Automatic Weather Stations across India.

This is NOT a weather forecasting application. See
`docs/context/ANTIGRAVITY_CONTEXT.md` for the full project context and
`docs/FILE_STRUCTURE.md` for the repository layout.

## Structure
- `backend/`  — FastAPI service (REST + WebSocket)
- `frontend/` — React Native app (TypeScript)
- `docs/`     — SRS-derived context and API contract notes

## Quick start (once services are implemented)
```
# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run start
```
