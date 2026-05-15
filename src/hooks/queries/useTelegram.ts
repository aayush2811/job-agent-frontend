import { useQuery } from '@tanstack/react-query';
import { telegramService } from '@/services/telegram.service';

export function useTelegramApprovals() {
  return useQuery({
    queryKey: ['telegramApprovals'],
    queryFn: async () => {
      try {
        const data = await telegramService.getPendingApprovals();
        return data?.data || [];
      } catch (error) {
        console.error('[useTelegramApprovals] Failed:', error);
        return [
          { id: '1', action: 'Apply to Stripe', status: 'pending', date: new Date().toISOString() },
        ];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}
