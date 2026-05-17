import { useQuery, useQueryClient } from '@tanstack/react-query';
import { telegramService } from '@/services/telegram.service';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/lib/logger';

export function useTelegramApprovals() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleTelegramUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['telegramApprovals'] });
    };

    socket.on('telegram-approval-requested', handleTelegramUpdate);
    socket.on('telegram-approval-updated', handleTelegramUpdate);

    return () => {
      socket.off('telegram-approval-requested', handleTelegramUpdate);
      socket.off('telegram-approval-updated', handleTelegramUpdate);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['telegramApprovals'],
    queryFn: async () => {
      try {
        const data = await telegramService.getApprovals();
        return data?.data || [];
      } catch (error) {
        logger.error('Telegram', 'approvals fetch failed', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
}
