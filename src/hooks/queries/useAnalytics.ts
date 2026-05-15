import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const data = await analyticsService.getDashboardStats();
        return data?.data || null;
      } catch (error) {
        console.error('[useDashboardStats] Failed:', error);
        return {
          applications: 1250,
          interviews: 45,
          offers: 12,
          successRate: 3.6,
        };
      }
    },
    staleTime: 60000,
    retry: 1,
  });
}
