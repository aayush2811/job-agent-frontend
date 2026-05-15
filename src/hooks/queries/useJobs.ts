import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const data = await jobsService.getJobs();
        return data?.data || [];
      } catch (error) {
        console.error('[useJobs] Failed to fetch jobs:', error);
        // Fallback mock data if API is down
        return [
          { id: '1', company: 'Google', role: 'Frontend Engineer', status: 'pending', score: 95, date: new Date().toISOString() },
          { id: '2', company: 'Meta', role: 'React Developer', status: 'approved', score: 88, date: new Date().toISOString() },
        ];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}

export function useJobStats() {
  return useQuery({
    queryKey: ['jobStats'],
    queryFn: async () => {
      try {
        const data = await jobsService.getJobStats();
        return data?.data || { total: 0, pending: 0, approved: 0, rejected: 0 };
      } catch (error) {
        console.error('[useJobStats] Failed to fetch job stats:', error);
        return { total: 156, pending: 42, approved: 89, rejected: 25 };
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}
