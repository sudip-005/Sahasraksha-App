export type HeartbeatStatus = 'NORMAL' | 'DAMPENED' | 'INVERTED' | 'UNAVAILABLE';

export interface HeartbeatPoint {
  timestamp: string;
  raw_pressure: number;
  reconstructed_tide: number;
  residual: number;
}

export interface HeartbeatData {
  station_id: string;
  heartbeat_status: HeartbeatStatus;
  heartbeat_strength: number;
  normal_threshold: number;
  alarm_threshold: number;
  data_points_count: number;
  sampling_window_hours: number;
  message: string;
  series: HeartbeatPoint[];
}
