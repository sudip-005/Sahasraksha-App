import { Colors } from '../theme/colors';
import { StationStatus } from '../types/station';

export function getStatusColor(status: StationStatus | string): string {
  switch (status?.toUpperCase()) {
    case 'HEALTHY':
      return Colors.healthy;
    case 'MONITOR':
      return Colors.monitor;
    case 'SERVICE_NOW':
    case 'CRITICAL':
    case 'FAILED':
      return Colors.serviceNow;
    case 'NO_DATA':
    case 'UNKNOWN':
    default:
      return Colors.noData;
  }
}

export function getStatusLabel(status: StationStatus | string): string {
  switch (status?.toUpperCase()) {
    case 'HEALTHY':
      return 'Healthy';
    case 'MONITOR':
      return 'Under Monitoring';
    case 'SERVICE_NOW':
      return 'Service Now';
    case 'NO_DATA':
      return 'No Data / Silent';
    default:
      return status || 'Unknown';
  }
}
