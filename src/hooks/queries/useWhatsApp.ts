import { useQuery } from '@tanstack/react-query';
import { whatsappService } from '@/services/whatsapp.service';

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ['whatsappStatus'],
    queryFn: async () => {
      try {
        const data = await whatsappService.getStatus();
        return data?.data || { status: 'disconnected' };
      } catch (error) {
        console.error('[useWhatsAppStatus] Failed:', error);
        return { status: 'disconnected', fallback: true };
      }
    },
    staleTime: 10000,
    retry: 1,
  });
}
