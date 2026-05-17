import { useQuery, useQueryClient } from '@tanstack/react-query';
import { whatsappService } from '@/services/whatsapp.service';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/lib/logger';

export function useWhatsAppStatus() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleWhatsAppUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappStatus'] });
    };

    socket.on('whatsapp-message-received', handleWhatsAppUpdate);
    socket.on('whatsapp-message-sent', handleWhatsAppUpdate);
    socket.on('whatsapp-status-changed', handleWhatsAppUpdate);

    return () => {
      socket.off('whatsapp-message-received', handleWhatsAppUpdate);
      socket.off('whatsapp-message-sent', handleWhatsAppUpdate);
      socket.off('whatsapp-status-changed', handleWhatsAppUpdate);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['whatsappStatus'],
    queryFn: async () => {
      try {
        const data = await whatsappService.getStatus();
        return data?.data || { status: 'disconnected' };
      } catch (error) {
        logger.error('WhatsApp', 'status fetch failed', error);
        return { status: 'disconnected', fallback: true };
      }
    },
    staleTime: 10000,
    retry: 1,
  });
}
