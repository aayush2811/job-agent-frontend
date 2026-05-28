import { apiClient } from '@/lib/axios';
import { EMPTY_DASHBOARD, unwrapData } from '@/lib/api';

export type DashboardStats = typeof EMPTY_DASHBOARD & {
  pendingApprovals?: number;
  autoApplied?: number;
  failedApplications?: number;
  totalApplications?: number;
  whatsappConnected?: boolean;
  telegramConnected?: boolean;
  activeQueue?: number;
  processingJobs?: number;
  realtimeStatus?: string;
};

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/analytics/dashboard');
    return unwrapData<DashboardStats>(data, EMPTY_DASHBOARD);
  },

  getApplicationStats: async () => {
    const { data } = await apiClient.get('/analytics/applications');
    return unwrapData(data, {
      summary: { total: 0, successRate: 0, rejectionRate: 0, retries: 0, totalJobs: 0 },
      dailyApplications: [],
      dailyActivity: [],
      applicationsByPlatform: [{ platform: 'WhatsApp', count: 0 }],
      recentApplications: [],
    });
  },

  getPipelineStats: async () => {
    const { data } = await apiClient.get('/analytics/pipeline');
    return unwrapData(data, {
      stages: [],
      found: 0,
      scored: 0,
      approvalPending: 0,
      applying: 0,
      applied: 0,
      rejected: 0,
      failed: 0,
    });
  },

  getRealtimeStats: async () => {
    const { data } = await apiClient.get('/analytics/realtime');
    return unwrapData(data, {
      activeSockets: 0,
      whatsappStatus: 'disconnected',
      whatsappConnected: false,
      telegramConnected: false,
      queueSize: 0,
      processingJobs: 0,
      latestActivity: [],
    });
  },

  getPlatformPerformance: async () => {
    const { data } = await apiClient.get('/analytics/platforms');
    return unwrapData(data, { platforms: [] });
  },
};
