import { WS_BASE_URL, APP_CONFIG } from '../utils/constants';

type MessageHandler = (data: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private listeners: Set<MessageHandler> = new Set();
  private reconnectTimeout: any = null;
  private isExplicitlyClosed = false;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    try {
      this.ws = new WebSocket(WS_BASE_URL);

      this.ws.onopen = () => {
        // Send initial ping/handshake
        this.send({ action: 'PING' });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.listeners.forEach((handler) => handler(payload));
        } catch (e) {
          // ignore parsing error
        }
      };

      this.ws.onclose = () => {
        if (!this.isExplicitlyClosed) {
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, APP_CONFIG.wsReconnectDelayMs);
        }
      };

      this.ws.onerror = () => {
        if (this.ws) {
          this.ws.close();
        }
      };
    } catch {
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, APP_CONFIG.wsReconnectDelayMs);
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  subscribe(handler: MessageHandler) {
    this.listeners.add(handler);
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }
    return () => {
      this.listeners.delete(handler);
    };
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const liveWebSocket = new WebSocketClient();
