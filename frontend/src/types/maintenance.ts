export type WorkOrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';

export interface WorkOrder {
  id: number;
  station_id: string;
  sensor_type: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  description: string;
  technician?: string;
  created_at: string;
  updated_at: string;
  station_name?: string;
  station_code?: string;
}

export interface MaintenanceGroupData {
  service_now: WorkOrder[];
  monitor: WorkOrder[];
  healthy: WorkOrder[];
  total_open_orders: number;
}
