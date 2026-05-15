import { apiClient } from '@/lib/axios';

export const jobsService = {
  getJobs: async (params?: unknown) => {
    const { data } = await apiClient.get('/jobs', { params });
    return data;
  },
  getJobById: async (id: string) => {
    const { data } = await apiClient.get(`/jobs/${id}`);
    return data;
  },
  approveJob: async (id: string) => {
    const { data } = await apiClient.patch(`/jobs/${id}/approve`);
    return data;
  },
  rejectJob: async (id: string) => {
    const { data } = await apiClient.patch(`/jobs/${id}/reject`);
    return data;
  },
  deleteJob: async (id: string) => {
    const { data } = await apiClient.delete(`/jobs/${id}`);
    return data;
  },
  getJobStats: async () => {
    const { data } = await apiClient.get('/jobs/stats');
    return data;
  },
};
