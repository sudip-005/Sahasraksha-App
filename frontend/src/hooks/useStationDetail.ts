import { useState, useEffect, useCallback } from 'react';
import { normalizeStation, stationApi, StationAlertRecord, StationTimeseriesPoint } from '../services/stationApi';
import { StationDetail, Reading, StationDiagnosisData } from '../types';

export function useStationDetail(stationId: string) {
  const [station, setStation] = useState<StationDetail | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [diagnosis, setDiagnosis] = useState<StationDiagnosisData | null>(null);
  const [timeseries, setTimeseries] = useState<StationTimeseriesPoint[]>([]);
  const [mlAlerts, setMlAlerts] = useState<StationAlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!stationId) return;
    try {
      setLoading(true);
      setError(null);
      const [stationData, readingsData, diagData, timeseriesData, alertData] = await Promise.all([
        stationApi.getStations({}),
        stationApi.getStationReadings(stationId, 24).catch(() => []),
        stationApi.getStationDiagnosis(stationId).catch(() => null),
        stationApi.getTimeseries(stationId).catch(() => []),
        stationApi.getStationAlerts(stationId).catch(() => []),
      ]);
      const records = Array.isArray(stationData) ? stationData : stationData.items;
      const stationSummary = records.map(normalizeStation).find((item) => item.id === stationId);
      const detailData = stationSummary
        ? { ...stationSummary, neighbour_agreement_pct: 0, why_flagged_summary: null }
        : null;
      setStation(detailData);
      setReadings(readingsData);
      setDiagnosis(diagData);
      setTimeseries(timeseriesData);
      setMlAlerts(alertData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch station details');
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { station, readings, diagnosis, timeseries, mlAlerts, loading, error, refetch: fetchDetail };
}
