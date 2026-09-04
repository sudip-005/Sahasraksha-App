import { useState, useEffect, useCallback } from 'react';
import { stationApi } from '../services/stationApi';
import { StationHealthSummary, StationMapPoint } from '../types';

export function useStations(initialStatus: string = 'ALL') {
  const [stations, setStations] = useState<StationHealthSummary[]>([]);
  const [mapPoints, setMapPoints] = useState<StationMapPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('health_score');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await stationApi.getStations({
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
        page,
        limit: 20,
        sort_by: sortBy,
        order,
      });
      setStations(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, sortBy, order]);

  const fetchMapPoints = useCallback(async () => {
    try {
      const points = await stationApi.getMapPoints();
      setMapPoints(points);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    fetchMapPoints();
  }, [fetchMapPoints]);

  return {
    stations,
    mapPoints,
    total,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    order,
    setOrder,
    loading,
    error,
    refetch: fetchStations,
    refetchMap: fetchMapPoints,
  };
}
