import { Reading } from './reading';

export type StationStatus = 'HEALTHY' | 'MONITOR' | 'SERVICE_NOW' | 'NO_DATA';

export interface SensorHealthItem {
  sensor: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'UNKNOWN';
  current_value: number | null;
  unit: string;
  last_calibrated?: string;
  drift_score: number;
  flags: string[];
}

export interface StationMapPoint {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  status: StationStatus;
  health_score: number;
  current_temp?: number | null;
  current_pressure?: number | null;
}

export interface StationHealthSummary {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  status: StationStatus;
  health_score: number;
  last_seen: string;
  active_alerts_count: number;
  sensors: SensorHealthItem[];
}

export interface StationDetail extends StationHealthSummary {
  latest_reading?: Reading | null;
  neighbour_agreement_pct: number;
  why_flagged_summary?: string | null;
}

export interface PaginatedStationsResponse {
  items: StationHealthSummary[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}
