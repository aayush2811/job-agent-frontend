import { apiClient } from '@/lib/axios';

export const whatsappService = {
  getStatus: async () => {
    const { data } = await apiClient.get('/whatsapp/status');
    return data;
  },
  getQrCode: async () => {
    const { data } = await apiClient.get('/whatsapp/qr');
    return data;
  },
  disconnect: async () => {
    const { data } = await apiClient.post('/whatsapp/disconnect');
    return data;
  },
  getLogs: async () => {
    const { data } = await apiClient.get('/whatsapp/logs');
    return data;
  },
};
