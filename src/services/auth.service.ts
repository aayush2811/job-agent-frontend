import { apiClient } from '@/lib/axios';
import type { AuthSession, AuthUser } from '@/types/auth';
import { useDemoLoginDebugStore } from '@/store/useDemoLoginDebugStore';

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
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const endpoint = '/auth/demo-login';
    const requestUrl = `${apiBaseUrl}${endpoint}`;
    const method = 'POST';

    console.log(`[Demo Login] ---> Request URL: ${requestUrl}`);
    console.log(`[Demo Login] ---> HTTP Method: ${method}`);

    // Update debug panel with pending request state
    useDemoLoginDebugStore.getState().setDebugInfo({
      apiUrl: apiBaseUrl,
      endpointCalled: endpoint,
      responseStatus: 'Pending...',
      errorMessage: '',
    });

    try {
      const response = await apiClient.post<ApiEnvelope<AuthSession>>(endpoint);

      console.log(`[Demo Login] <--- Response Status: ${response.status}`);
      console.log(`[Demo Login] <--- Response Body:`, response.data);

      useDemoLoginDebugStore.getState().setDebugInfo({
        apiUrl: apiBaseUrl,
        endpointCalled: endpoint,
        responseStatus: `${response.status} ${response.statusText || 'OK'}`,
        errorMessage: '',
      });

      return response.data.data;
    } catch (error: any) {
      const responseStatus = error.response ? `${error.response.status} ${error.response.statusText || ''}` : 'Network Error';
      const responseBody = error.response ? error.response.data : null;
      const errorStack = error.stack || 'No error stack available';

      console.error(`[Demo Login] <--- Response Status: ${responseStatus}`);
      if (responseBody) {
        console.error(`[Demo Login] <--- Response Body:`, responseBody);
      }
      console.error(`[Demo Login] <--- Error Stack:`, errorStack);

      // If demo login endpoint is missing, create a safe frontend fallback.
      // Missing check: 404 response status OR no response (e.g. backend server is not running).
      const isMissing = !error.response || error.response.status === 404;

      if (isMissing) {
        const fallbackMsg = `Endpoint missing/unreachable. Activating safe frontend fallback.`;
        console.warn(`[Demo Login] ${fallbackMsg}`);
        useDemoLoginDebugStore.getState().setDebugInfo({
          apiUrl: apiBaseUrl,
          endpointCalled: endpoint,
          responseStatus: `${responseStatus} (Fallback Active)`,
          errorMessage: error.message || fallbackMsg,
        });

        // Safe frontend fallback return value
        return {
          user: {
            id: 'demo-user',
            name: 'Demo User',
            email: 'demo@jobagent.ai',
            role: 'admin',
            plan: 'free',
            onboardingComplete: true,
          } as any,
          accessToken: 'demo-token',
          refreshToken: 'demo-refresh',
        };
      }

      // If it's a real backend failure (e.g. 500, 400, etc.), update the debug info and rethrow the error
      useDemoLoginDebugStore.getState().setDebugInfo({
        apiUrl: apiBaseUrl,
        endpointCalled: endpoint,
        responseStatus,
        errorMessage: error.response?.data?.message || error.message || 'Backend Error',
      });
      
      throw error;
    }
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
