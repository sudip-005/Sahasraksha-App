import { useState, useEffect, useCallback } from 'react';
import { networkApi } from '../services/networkApi';
import { NetworkOverviewData, NetworkTrendPoint } from '../types';

export function useNetworkOverview() {
  const [overview, setOverview] = useState<NetworkOverviewData | null>(null);
  const [trends, setTrends] = useState<NetworkTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewData, trendData] = await Promise.all([
        networkApi.getOverview(),
        networkApi.getTrend(10),
      ]);
      setOverview(overviewData);
      setTrends(trendData.trends);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch network overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, [fetchOverview]);

  return { overview, trends, loading, error, refetch: fetchOverview };
}
