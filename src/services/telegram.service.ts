import { apiClient } from '@/lib/axios';

export const telegramService = {
  getApprovals: async (params?: unknown) => {
    const { data } = await apiClient.get('/telegram/approvals', { params });
    return data;
  },
  approve: async (id: string) => {
    const { data } = await apiClient.post(`/telegram/approvals/${id}/approve`);
    return data;
  },
  reject: async (id: string) => {
    const { data } = await apiClient.post(`/telegram/approvals/${id}/reject`);
    return data;
  },
};
