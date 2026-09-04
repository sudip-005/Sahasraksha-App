export * from './station';
export * from './reading';
export * from './alert';
export * from './heartbeat';
export * from './maintenance';

export interface NetworkOverviewData {
  total_stations: number;
  healthy_stations: number;
  monitor_stations: number;
  service_now_stations: number;
  no_data_stations: number;
  network_health_pct: number;
  active_alerts_count: number;
  hourly_processed_readings: number;
  hourly_anomalies_detected: number;
  reporting_rate_pct: number;
  avg_latency_ms: number;
}

export interface NetworkTrendPoint {
  date: string;
  health_pct: number;
  anomalies: number;
  reporting_pct: number;
}

export interface EvidenceCardData {
  layer: string;
  title: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'UNAVAILABLE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE';
  confidence_pct: number;
  observation: string;
  threshold: string;
  explanation: string;
  key_metrics: Record<string, any>;
}

export interface StationDiagnosisData {
  station_id: string;
  station_name: string;
  overall_status: string;
  health_score: number;
  plain_english_summary: string;
  recommended_action: string;
  evidence_cards: EvidenceCardData[];
}
