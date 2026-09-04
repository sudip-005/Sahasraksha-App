import asyncio
import random
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.logging import logger
from .core.exceptions import http_exception_handler, generic_exception_handler
from .db.database import init_db, SessionLocal
from .db.seed_mock_data import seed_database
from .websocket.manager import ws_manager
from .models import Station, Reading
from .api.routes import (
    health_router,
    network_router,
    stations_router,
    alerts_router,
    heartbeat_router,
    maintenance_router,
    live_router,
    analytics_router,
    demo_router
)

# Background telemetry broadcaster task
async def live_telemetry_simulator():
    """Generates real-time telemetry ticks and broadcasts over WebSocket."""
    logger.info("Starting live telemetry broadcast loop...")
    while True:
        try:
            await asyncio.sleep(5.0)
            if ws_manager.active_connections:
                db = SessionLocal()
                try:
                    # Pick a random station to emit a new reading
                    stations = db.query(Station).filter(Station.status != "NO_DATA").all()
                    if stations:
                        st = random.choice(stations)
                        temp_tick = round(28.0 + random.uniform(-1.5, 1.5), 2)
                        pres_tick = round(1011.0 + random.uniform(-0.5, 0.5), 2)
                        rh_tick = round(65.0 + random.uniform(-3.0, 3.0), 1)

                        await ws_manager.broadcast({
                            "event": "TELEMETRY_TICK",
                            "station_id": st.id,
                            "station_name": st.name,
                            "timestamp": datetime.utcnow().isoformat(),
                            "temperature": temp_tick,
                            "pressure": pres_tick,
                            "humidity": rh_tick,
                            "status": st.status,
                            "health_score": st.health_score
                        })
                finally:
                    db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning(f"Error in telemetry simulator loop: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables & seed mock data if empty
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    # Launch background telemetry generator
    sim_task = asyncio.create_task(live_telemetry_simulator())
    yield
    # Shutdown
    sim_task.cancel()
    logger.info("Shutting down SAHASRAKSHA backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Weather Station Health Monitoring Platform for IMD Automatic Weather Stations",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include Routers under API_V1_PREFIX
v1 = settings.API_V1_PREFIX
app.include_router(health_router, prefix=v1, tags=["Health"])
app.include_router(network_router, prefix=v1, tags=["Network"])
app.include_router(stations_router, prefix=v1, tags=["Stations"])
app.include_router(alerts_router, prefix=v1, tags=["Alerts"])
app.include_router(heartbeat_router, prefix=v1, tags=["Heartbeat"])
app.include_router(maintenance_router, prefix=v1, tags=["Maintenance"])
app.include_router(live_router, prefix=v1, tags=["Live Streaming"])
app.include_router(analytics_router, prefix=v1, tags=["Analytics"])
app.include_router(demo_router, prefix=v1, tags=["Demo Mode"])

@app.get("/")
def root():
    return {
        "title": "SAHASRAKSHA API",
        "description": "Sensor-Failure Detection Platform for IMD Automatic Weather Stations",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_PREFIX
    }
