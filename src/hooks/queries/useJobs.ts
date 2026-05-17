import { useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/lib/logger';

export function useJobs() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleJobUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
    };

    socket.on('job-added', handleJobUpdate);
    socket.on('job-updated', handleJobUpdate);
    socket.on('job-deleted', handleJobUpdate);

    return () => {
      socket.off('job-added', handleJobUpdate);
      socket.off('job-updated', handleJobUpdate);
      socket.off('job-deleted', handleJobUpdate);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      try {
        const data = await jobsService.getJobs();
        const raw = data?.data || data || {};
        return raw.jobs || [];
      } catch (error) {
        logger.error('Jobs', 'fetch failed', error);
        return [];
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
        const raw = data?.data || data || {};
        return {
          total: raw.totalJobs ?? raw.total ?? 0,
          pending: raw.pending ?? 0,
          approved: raw.approved ?? raw.autoApplied ?? 0,
          rejected: raw.rejected ?? 0,
        };
      } catch (error) {
        logger.error('Jobs', 'stats fetch failed', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}
