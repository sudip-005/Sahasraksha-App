import { useState, useEffect, useCallback } from 'react';
import { maintenanceApi } from '../services/maintenanceApi';
import { MaintenanceGroupData } from '../types';

export function useMaintenance() {
  const [data, setData] = useState<MaintenanceGroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceApi.getMaintenance();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch maintenance orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = async (payload: {
    station_id: string;
    sensor_type: string;
    priority: string;
    description: string;
    technician?: string;
  }) => {
    try {
      await maintenanceApi.createWorkOrder(payload);
      await fetchMaintenance();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create work order');
      return false;
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  return { data, loading, error, createOrder, refetch: fetchMaintenance };
}
