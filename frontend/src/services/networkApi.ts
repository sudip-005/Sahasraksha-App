import { apiClient } from './api';
import { NetworkOverviewData, NetworkTrendPoint } from '../types';

export const networkApi = {
  getOverview: () => {
    return apiClient<NetworkOverviewData>('/network/overview');
  },

  getTrend: (days: number = 10) => {
    return apiClient<{ days: number; trends: NetworkTrendPoint[] }>(`/network/trend?days=${days}`);
  },
};
