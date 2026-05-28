import { apiClient } from '@/lib/axios';

export const telegramService = {
  getStatus: async () => {
    const { data } = await apiClient.get('/telegram/status');
    return data;
  },
  sendTest: async () => {
    const { data } = await apiClient.post('/telegram/test');
    return data;
  },
  getApprovals: async () => {
    const { data } = await apiClient.get('/jobs', {
      params: { status: 'pending', limit: 100 },
    });
    return data;
  },
  approve: async (id: string) => {
    const { data } = await apiClient.patch(`/jobs/${id}/approve`);
    return data;
  },
  reject: async (id: string) => {
    const { data } = await apiClient.patch(`/jobs/${id}/reject`);
    return data;
  },
};

