import { apiClient } from './api';
import {
  PaginatedStationsResponse,
  StationDetail,
  StationMapPoint,
  Reading,
  StationDiagnosisData,
} from '../types';

export const stationApi = {
  getStations: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    order?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.order) query.append('order', params.order);

    return apiClient<PaginatedStationsResponse>(`/stations?${query.toString()}`);
  },

  getMapPoints: () => {
    return apiClient<StationMapPoint[]>('/stations/map');
  },

  getStationDetail: (id: string) => {
    return apiClient<StationDetail>(`/stations/${id}`);
  },

  getStationReadings: (id: string, hours: number = 24) => {
    return apiClient<Reading[]>(`/stations/${id}/readings?hours=${hours}`);
  },

  getStationDiagnosis: (id: string) => {
    return apiClient<StationDiagnosisData>(`/stations/${id}/diagnosis`);
  },
};
