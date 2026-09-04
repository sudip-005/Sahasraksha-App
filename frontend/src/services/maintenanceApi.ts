import { apiClient } from './api';
import { MaintenanceGroupData, WorkOrder } from '../types';

export const maintenanceApi = {
  getMaintenance: () => {
    return apiClient<MaintenanceGroupData>('/maintenance');
  },

  createWorkOrder: (data: {
    station_id: string;
    sensor_type: string;
    priority: string;
    description: string;
    technician?: string;
  }) => {
    return apiClient<WorkOrder>('/maintenance/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
