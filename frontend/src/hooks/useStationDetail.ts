import { useState, useEffect, useCallback } from 'react';
import { stationApi } from '../services/stationApi';
import { StationDetail, Reading, StationDiagnosisData } from '../types';

export function useStationDetail(stationId: string) {
  const [station, setStation] = useState<StationDetail | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [diagnosis, setDiagnosis] = useState<StationDiagnosisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!stationId) return;
    try {
      setLoading(true);
      setError(null);
      const [detailData, readingsData, diagData] = await Promise.all([
        stationApi.getStationDetail(stationId),
        stationApi.getStationReadings(stationId, 24),
        stationApi.getStationDiagnosis(stationId),
      ]);
      setStation(detailData);
      setReadings(readingsData);
      setDiagnosis(diagData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch station details');
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { station, readings, diagnosis, loading, error, refetch: fetchDetail };
}
