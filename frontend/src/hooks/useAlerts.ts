import { useState, useEffect, useCallback } from 'react';
import { alertApi } from '../services/alertApi';
import { AlertItem } from '../types';

export function useAlerts(initialStatus: string = 'ACTIVE', limit: number = 50) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [severity, setSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await alertApi.getAlerts({
        status: status !== 'ALL' ? status : undefined,
        severity: severity !== 'ALL' ? severity : undefined,
        limit,
      });
      setAlerts(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [status, severity, limit]);

  const acknowledgeAlert = async (id: number) => {
    try {
      await alertApi.acknowledgeAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return {
    alerts,
    status,
    setStatus,
    severity,
    setSeverity,
    loading,
    error,
    acknowledgeAlert,
    refetch: fetchAlerts,
  };
}
