import { StationHealthSummary, StationDetail } from '../types';

export interface StationsState {
  items: StationHealthSummary[];
  selectedStation: StationDetail | null;
  filterStatus: string;
}

export const initialStationsState: StationsState = {
  items: [],
  selectedStation: null,
  filterStatus: 'ALL',
};
