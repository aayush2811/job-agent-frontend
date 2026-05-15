import { useQuery } from '@tanstack/react-query';
import { applicationsService } from '@/services/applications.service';

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      try {
        const data = await applicationsService.getApplications();
        return data?.data || [];
      } catch (error) {
        console.error('[useApplications] Failed:', error);
        return [
          { id: '1', company: 'Netflix', status: 'interview', date: new Date().toISOString() },
          { id: '2', company: 'Amazon', status: 'applied', date: new Date().toISOString() },
        ];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}
