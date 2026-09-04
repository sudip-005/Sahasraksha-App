import { apiClient } from './api';
import { HeartbeatData } from '../types';

export const heartbeatApi = {
  getHeartbeat: (stationId: string) => {
    return apiClient<HeartbeatData>(`/stations/${stationId}/heartbeat`);
  },
};
