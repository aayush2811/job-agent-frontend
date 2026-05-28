import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { telegramService } from '@/services/telegram.service';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthQueryEnabled } from '@/hooks/useAuthQueryEnabled';
import { logger } from '@/lib/logger';

export function useTelegramApprovals() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const enabled = useAuthQueryEnabled();

  useEffect(() => {
    if (!socket) return;

    const handleTelegramUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['telegramApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineStats'] });
    };

    socket.on('approval-pending', handleTelegramUpdate);
    socket.on('approval-resolved', handleTelegramUpdate);
    socket.on('telegram-approval-requested', handleTelegramUpdate);
    socket.on('telegram-approval-updated', handleTelegramUpdate);
    socket.on('job-matched', handleTelegramUpdate);
    socket.on('match-updated', handleTelegramUpdate);

    return () => {
      socket.off('approval-pending', handleTelegramUpdate);
      socket.off('approval-resolved', handleTelegramUpdate);
      socket.off('telegram-approval-requested', handleTelegramUpdate);
      socket.off('telegram-approval-updated', handleTelegramUpdate);
      socket.off('job-matched', handleTelegramUpdate);
      socket.off('match-updated', handleTelegramUpdate);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['telegramApprovals'],
    queryFn: async () => {
      try {
        const res = await telegramService.getApprovals();
        const raw = res?.data || res || {};
        return raw.jobs || (Array.isArray(raw) ? raw : []);
      } catch (error) {
        logger.error('Telegram', 'approvals fetch failed', error);
        return [];
      }
    },
    enabled,
    staleTime: 30000,
    retry: 1,
  });
}

export function useApproveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => telegramService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineStats'] });
    },
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => telegramService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['pipelineStats'] });
    },
  });
}

