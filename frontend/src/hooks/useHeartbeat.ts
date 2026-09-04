import { useState, useEffect, useCallback } from 'react';
import { heartbeatApi } from '../services/heartbeatApi';
import { HeartbeatData } from '../types';

export function useHeartbeat(stationId: string) {
  const [data, setData] = useState<HeartbeatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHeartbeat = useCallback(async () => {
    if (!stationId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await heartbeatApi.getHeartbeat(stationId);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pressure heartbeat');
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    fetchHeartbeat();
  }, [fetchHeartbeat]);

  return { data, loading, error, refetch: fetchHeartbeat };
}
