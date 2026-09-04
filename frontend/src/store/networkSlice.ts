import { NetworkOverviewData } from '../types';

export interface NetworkState {
  overview: NetworkOverviewData | null;
  lastFetched: number | null;
}

export const initialNetworkState: NetworkState = {
  overview: null,
  lastFetched: null,
};
