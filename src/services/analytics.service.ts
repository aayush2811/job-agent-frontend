import { apiClient } from '@/lib/axios';

export const analyticsService = {
  getDashboardStats: async () => {
    const { data } = await apiClient.get('/analytics/dashboard');
    return data;
  },
  getApplicationStats: async () => {
    const { data } = await apiClient.get('/analytics/applications');
    return data;
  },
  getPlatformPerformance: async () => {
    const { data } = await apiClient.get('/analytics/platforms');
    return data;
  },
};
