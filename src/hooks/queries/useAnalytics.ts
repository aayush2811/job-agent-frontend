import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { EMPTY_DASHBOARD } from '@/lib/api';
import { useAuthQueryEnabled } from '@/hooks/useAuthQueryEnabled';
import { logger } from '@/lib/logger';

export function useDashboardStats() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      try {
        const res = await analyticsService.getDashboardStats();
        const raw: any = res || {};
        const summary = raw.summary || raw;
        const applications = raw.applications ?? ((summary.autoApplied ?? 0) + (summary.approved ?? 0));
        const appsByDay = raw.dailyActivity || raw.applicationsByDay || [];
        
        return {
          totalJobs: summary.totalJobs ?? summary.total ?? 0,
          applications,
          interviews: 0,
          successRate: applications > 0 
            ? Math.round(((summary.autoApplied ?? 0) / applications) * 100) 
            : (summary.successRate ?? 0),
          dailyActivity: appsByDay.map((d: any) => ({
            name: d.name || d.date || '—',
            apps: d.apps ?? d.count ?? 0,
          })),
        };
      } catch (error) {
        logger.error('Analytics', 'dashboard fetch failed', error);
        return { ...EMPTY_DASHBOARD };
      }
    },
    enabled,
    staleTime: 60000,
    retry: 1,
    placeholderData: EMPTY_DASHBOARD,
  });
}

export function useApplicationStats() {
  const enabled = useAuthQueryEnabled();
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
    enabled,
    staleTime: 60000,
    retry: 1,
  });
}

export function usePipelineStats() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ['pipelineStats'],
    queryFn: async () => {
      try {
        return await analyticsService.getPipelineStats();
      } catch (error) {
        logger.error('Analytics', 'pipeline stats fetch failed', error);
        return null;
      }
    },
    enabled,
    staleTime: 30000,
    retry: 1,
  });
}

export function usePlatformStats() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      try {
        const res = await analyticsService.getPlatformPerformance();
        return res?.platforms || [];
      } catch (error) {
        logger.error('Analytics', 'platform performance fetch failed', error);
        return [];
      }
    },
    enabled,
    staleTime: 60000,
    retry: 1,
  });
}

export function useRealtimeStats() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ['realtimeStats'],
    queryFn: async () => {
      try {
        return await analyticsService.getRealtimeStats();
      } catch (error) {
        logger.error('Analytics', 'realtime stats fetch failed', error);
        return null;
      }
    },
    enabled,
    staleTime: 5000,
    refetchInterval: enabled ? 10000 : false,
    retry: 1,
  });
}

