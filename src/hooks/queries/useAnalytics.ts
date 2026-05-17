import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { EMPTY_DASHBOARD } from '@/lib/api';
import { logger } from '@/lib/logger';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        return await analyticsService.getDashboardStats();
      } catch (error) {
        logger.error('Analytics', 'dashboard fetch failed', error);
        return { ...EMPTY_DASHBOARD };
      }
    },
    staleTime: 60000,
    retry: 1,
    placeholderData: EMPTY_DASHBOARD,
  });
}

export function useApplicationStats() {
  return useQuery({
    queryKey: ['applicationStats'],
    queryFn: async () => {
      try {
        return await analyticsService.getApplicationStats();
      } catch (error) {
        logger.error('Analytics', 'applications fetch failed', error);
        return {
          summary: { total: 0, successRate: 0 },
          dailyActivity: [],
          recentApplications: [],
        };
      }
    },
    staleTime: 60000,
    retry: 1,
  });
}
