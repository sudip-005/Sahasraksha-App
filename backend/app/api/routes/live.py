import asyncio
import json
import random
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from ...websocket.manager import ws_manager
from ...core.logging import logger
from ...db.database import get_db
from ...models import Station, Reading

router = APIRouter()

@router.websocket("/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Initial greeting packet
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "SAHASRAKSHA Live Telemetry Stream Connected",
            "timestamp": datetime.utcnow().isoformat()
        }))

        while True:
            # Keep alive and listen for client commands (e.g. ping)
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "PING":
                    await websocket.send_text(json.dumps({"event": "PONG", "timestamp": datetime.utcnow().isoformat()}))
            except Exception:
                pass

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"Live websocket error: {e}")
        ws_manager.disconnect(websocket)

@router.get("/live/status")
def get_live_status():
    return {
        "active_websocket_subscribers": len(ws_manager.active_connections),
        "stream_status": "ONLINE",
        "timestamp": datetime.utcnow().isoformat()
    }
