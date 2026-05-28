import { useQuery, useQueryClient } from '@tanstack/react-query';
import { applicationsService } from '@/services/applications.service';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthQueryEnabled } from '@/hooks/useAuthQueryEnabled';
import { logger } from '@/lib/logger';

export function useApplications() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const enabled = useAuthQueryEnabled();

  useEffect(() => {
    if (!socket) return;

    const handleApplicationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    };

    socket.on('application-added', handleApplicationUpdate);
    socket.on('application-updated', handleApplicationUpdate);

    return () => {
      socket.off('application-added', handleApplicationUpdate);
      socket.off('application-updated', handleApplicationUpdate);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      try {
        const data = await applicationsService.getApplications();
        return data?.data || [];
      } catch (error) {
        logger.error('Applications', 'fetch failed', error);
        return [];
      }
    },
    enabled,
    staleTime: 30000,
    retry: 1,
  });
}
