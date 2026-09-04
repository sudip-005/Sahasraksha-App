import { useState, useEffect } from 'react';
import { liveWebSocket } from '../services/websocket';

export interface LiveReadingEvent {
  event: string;
  station_id: string;
  station_name?: string;
  timestamp: string;
  temperature?: number;
  pressure?: number;
  humidity?: number;
  status: string;
  health_score?: number;
  message?: string;
  fault_type?: string;
}

export function useLiveDetection() {
  const [stream, setStream] = useState<LiveReadingEvent[]>([]);
  const [throughputCount, setThroughputCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastAnomaly, setLastAnomaly] = useState<LiveReadingEvent | null>(null);

  useEffect(() => {
    liveWebSocket.connect();
    setIsConnected(true);

    const unsubscribe = liveWebSocket.subscribe((data) => {
      if (data.event === 'CONNECTED') {
        setIsConnected(true);
      } else if (data.event === 'TELEMETRY_TICK') {
        setThroughputCount((prev) => prev + 1);
        setStream((prev) => [data, ...prev.slice(0, 40)]);
      } else if (data.event === 'FAULT_INJECTED') {
        setLastAnomaly(data);
        setStream((prev) => [data, ...prev.slice(0, 40)]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    stream,
    throughputCount,
    isConnected,
    lastAnomaly,
  };
}
