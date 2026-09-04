from .health import router as health_router
from .network import router as network_router
from .stations import router as stations_router
from .alerts import router as alerts_router
from .heartbeat import router as heartbeat_router
from .maintenance import router as maintenance_router
from .live import router as live_router
from .analytics import router as analytics_router
from .demo import router as demo_router

__all__ = [
    "health_router",
    "network_router",
    "stations_router",
    "alerts_router",
    "heartbeat_router",
    "maintenance_router",
    "live_router",
    "analytics_router",
    "demo_router"
]
