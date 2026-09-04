import { apiClient } from './api';

export interface FaultInjectionPayload {
  station_id: string;
  sensor_type: string;
  fault_type: string;
  intensity?: number;
  duration_minutes?: number;
}

export const demoApi = {
  injectFault: (payload: FaultInjectionPayload) => {
    return apiClient<any>('/demo/inject-fault', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  resetDemo: () => {
    return apiClient<any>('/demo/reset', {
      method: 'POST',
    });
  },
};
