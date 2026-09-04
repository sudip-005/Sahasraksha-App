import { apiClient } from './api';
import { AlertItem } from '../types';

export const alertApi = {
  getAlerts: (params?: { status?: string; severity?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.limit) query.append('limit', params.limit.toString());
    return apiClient<AlertItem[]>(`/alerts?${query.toString()}`);
  },

  acknowledgeAlert: (id: number) => {
    return apiClient<AlertItem>(`/alerts/${id}/acknowledge`, {
      method: 'POST',
    });
  },
};
