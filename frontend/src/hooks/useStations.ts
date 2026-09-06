import { useState, useEffect, useCallback } from 'react';
import { normalizeStation, stationApi, MlStationRecord } from '../services/stationApi';
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
        limit: 100,
        sort_by: sortBy,
        order,
      });
      const records = Array.isArray(res)
        ? (res as MlStationRecord[]).map(normalizeStation)
        : res.items.map(normalizeStation);
      const mapResponse = await stationApi.getMapPoints();
      setStations(records);
      setTotal(Array.isArray(res) ? records.length : res.total);
      setMapPoints(mapResponse.length > 0 ? mapResponse : records.map((station) => ({
        id: station.id,
        name: station.name,
        code: station.code,
        latitude: station.latitude,
        longitude: station.longitude,
        status: station.status,
        health_score: station.health_score,
        degradation: station.degradation,
        trend_per_day: station.trend_per_day,
        days_to_threshold: station.days_to_threshold,
        high_conf_alerts: station.high_conf_alerts,
        alert_rate_pct: station.alert_rate_pct,
        rate_vs_network: station.rate_vs_network,
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stations');
    } finally {
      setLoading(false);
    }
  }, [search, status, page, sortBy, order]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

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
    refetchMap: fetchStations,
  };
}
