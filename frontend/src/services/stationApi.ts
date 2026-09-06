import { apiClient } from './api';
import {
  PaginatedStationsResponse,
  StationDetail,
  StationMapPoint,
  StationHealthSummary,
  Reading,
  StationDiagnosisData,
} from '../types';

export interface MlStationRecord {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  health: number;
  status: 'SERVICE NOW' | 'SCHEDULE' | 'MONITOR' | 'OK';
  degradation: number;
  trend_per_day: number;
  days_to_threshold: number | null;
  high_conf_alerts: number;
  alert_rate_pct: number;
  rate_vs_network: number;
  last_seen: string;
}

export function normalizeStation(record: MlStationRecord | StationHealthSummary): StationHealthSummary {
  if ('station_id' in record) {
    const status = record.status === 'SERVICE NOW' ? 'SERVICE_NOW' : record.status;
    return {
      id: record.station_id,
      name: record.name,
      code: record.station_id,
      state: '',
      district: record.name,
      latitude: record.lat,
      longitude: record.lon,
      elevation_m: 0,
      status: status as StationHealthSummary['status'],
      health_score: record.health * 100,
      last_seen: record.last_seen,
      active_alerts_count: record.high_conf_alerts,
      sensors: [],
      degradation: record.degradation,
      trend_per_day: record.trend_per_day,
      days_to_threshold: record.days_to_threshold,
      high_conf_alerts: record.high_conf_alerts,
      alert_rate_pct: record.alert_rate_pct,
      rate_vs_network: record.rate_vs_network,
    };
  }
  return record;
}

export const stationApi = {
  getStations: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.order) query.append('order', params.order);

    return apiClient<PaginatedStationsResponse | MlStationRecord[]>(`/stations?${query.toString()}`);
  },

  getMapPoints: () => {
    return apiClient<StationMapPoint[]>('/stations/map');
  },

  getTimeseries: (id: string, from?: string, to?: string) => {
    const query = new URLSearchParams();
    if (from) query.append('from', from);
    if (to) query.append('to', to);
    return apiClient<StationTimeseriesPoint[]>(`/stations/${id}/timeseries?${query.toString()}`);
  },

  getStationAlerts: (id: string) => apiClient<StationAlertRecord[]>(`/stations/${id}/alerts`),

  getStationDetail: (id: string) => {
    return apiClient<StationDetail>(`/stations/${id}`);
  },

  getStationReadings: (id: string, hours: number = 24) => {
    return apiClient<Reading[]>(`/stations/${id}/readings?hours=${hours}`);
  },

  getStationDiagnosis: (id: string) => {
    return apiClient<StationDiagnosisData>(`/stations/${id}/diagnosis`);
  },
};

export interface StationTimeseriesPoint {
  timestamp: string;
  T: number | null;
  P: number | null;
  RH: number | null;
  flag: number;
  amp_ratio_P: number | null;
}

export interface StationAlertRecord {
  timestamp: string;
  flag: number;
  reason: string;
  severity: number;
  confidence: number;
  degradation: number;
  evidence: Array<[string, number]>;
}
