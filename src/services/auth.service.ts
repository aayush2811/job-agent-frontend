import { apiClient } from '@/lib/axios';

export const authService = {
  login: async (credentials: unknown) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },
  logout: async () => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};
