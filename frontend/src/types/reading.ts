export interface Reading {
  id?: number;
  station_id: string;
  timestamp: string;
  temperature: number | null;
  relative_humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  solar_radiation: number | null;
  precipitation_rate: number | null;
  dew_point: number | null;
  battery_voltage?: number;
  is_flagged?: boolean;
  flags_json?: string[];
}
