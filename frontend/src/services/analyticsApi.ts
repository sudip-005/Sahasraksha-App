import { apiClient } from './api';

export const analyticsApi = {
  getAnalytics: () => {
    return apiClient<any>('/analytics');
  },
};
