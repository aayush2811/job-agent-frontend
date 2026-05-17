import { apiClient } from '@/lib/axios';
import { EMPTY_DASHBOARD, unwrapData } from '@/lib/api';

export type DashboardStats = typeof EMPTY_DASHBOARD;

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/analytics/dashboard');
    return unwrapData<DashboardStats>(data, EMPTY_DASHBOARD);
  },

  getApplicationStats: async () => {
    const { data } = await apiClient.get('/analytics/applications');
    return unwrapData(data, {
      summary: { total: 0, successRate: 0 },
      dailyActivity: [],
      recentApplications: [],
    });
  },

  getPlatformPerformance: async () => {
    const { data } = await apiClient.get('/analytics/platforms');
    return unwrapData(data, { platforms: [] });
  },
};
