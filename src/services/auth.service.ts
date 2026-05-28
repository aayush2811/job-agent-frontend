import { apiClient } from '@/lib/axios';
import type { AuthSession, AuthUser } from '@/types/auth';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  signup: async (payload: { name: string; email: string; password: string }) => {
    const { data } = await apiClient.post<ApiEnvelope<AuthSession>>('/auth/signup', payload);
    return data.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const { data } = await apiClient.post<ApiEnvelope<AuthSession>>('/auth/login', payload);
    return data.data;
  },
  demoLogin: async () => {
    const { data } = await apiClient.post<ApiEnvelope<AuthSession>>('/auth/demo-login');
    return data.data;
  },
  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post<ApiEnvelope<AuthSession>>('/auth/refresh', {
      refreshToken,
    });
    return data.data;
  },
  logout: async (refreshToken: string | null) => {
    if (!refreshToken) return;
    await apiClient.post('/auth/logout', { refreshToken });
  },
  getCurrentUser: async () => {
    const { data } = await apiClient.get<ApiEnvelope<{ user: AuthUser }>>('/auth/me');
    return data.data.user;
  },
};
