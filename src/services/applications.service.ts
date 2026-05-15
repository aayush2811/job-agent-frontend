import { apiClient } from '@/lib/axios';

export const applicationsService = {
  getApplications: async (params?: unknown) => {
    const { data } = await apiClient.get('/applications', { params });
    return data;
  },
  getApplicationById: async (id: string) => {
    const { data } = await apiClient.get(`/applications/${id}`);
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch(`/applications/${id}/status`, { status });
    return data;
  },
  addNote: async (id: string, note: string) => {
    const { data } = await apiClient.post(`/applications/${id}/notes`, { note });
    return data;
  },
};
