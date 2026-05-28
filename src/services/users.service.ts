import { apiClient } from '@/lib/axios';
import type { AuthUser, OnboardingFlags } from '@/types/auth';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface UserSettings {
  user: AuthUser;
  integrations: {
    whatsapp: Record<string, unknown>;
    telegram: Record<string, unknown>;
  };
  stats: { resumeCount: number };
}

export const usersService = {
  getSettings: async () => {
    const { data } = await apiClient.get<ApiEnvelope<UserSettings>>('/users/settings');
    return data.data;
  },
  patchOnboarding: async (patch: Partial<OnboardingFlags>) => {
    const { data } = await apiClient.patch<ApiEnvelope<{ user: AuthUser }>>(
      '/users/onboarding',
      patch
    );
    return data.data.user;
  },
  patchProfile: async (payload: { name?: string }) => {
    const { data } = await apiClient.patch<ApiEnvelope<{ user: AuthUser }>>(
      '/users/profile',
      payload
    );
    return data.data.user;
  },
};
