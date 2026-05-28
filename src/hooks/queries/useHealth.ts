import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/services/health.service';
import { useAuthQueryEnabled } from '@/hooks/useAuthQueryEnabled';

export function useSystemHealth() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => healthService.getHealth(),
    enabled,
    refetchInterval: enabled ? 10000 : false,
    staleTime: 5000,
  });
}
