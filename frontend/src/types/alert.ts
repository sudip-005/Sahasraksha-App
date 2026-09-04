export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AlertItem {
  id: number;
  station_id: string;
  sensor_type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  evidence_json: Record<string, any>;
  created_at: string;
  updated_at: string;
  station_name?: string;
  station_code?: string;
  evidence_bullets: string[];
}
