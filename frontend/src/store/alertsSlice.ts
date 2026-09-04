import { AlertItem } from '../types';

export interface AlertsState {
  items: AlertItem[];
  filterSeverity: string;
}

export const initialAlertsState: AlertsState = {
  items: [],
  filterSeverity: 'ALL',
};
