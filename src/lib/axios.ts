import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiErrorMessage } from '@/lib/api';
import { logger } from '@/lib/logger';
import { getAccessToken, getRefreshToken } from '@/lib/auth-tokens';
import { useAuthStore, selectAuthReady } from '@/store/useAuthStore';
import { socketService } from '@/socket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const AUTH_REQUEST_LOG =
  process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true' || process.env.NODE_ENV === 'development';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;
let isLoggingOut = false;

function resolveBearerToken(): string | null {
  return useAuthStore.getState().token || getAccessToken();
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken || getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    const session = data?.data;
    if (!session?.accessToken || !session?.refreshToken || !session?.user) {
      return null;
    }
    useAuthStore
      .getState()
      .setSession(session.user, session.accessToken, session.refreshToken);
    socketService.reconnectWithToken(session.accessToken);
    return session.accessToken as string;
  } catch {
    return null;
  }
}

function redirectToLogin() {
  if (isLoggingOut) return;
  isLoggingOut = true;
  useAuthStore.getState().logout();
  socketService.disconnect();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
  setTimeout(() => {
    isLoggingOut = false;
  }, 2000);
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = resolveBearerToken();
      const authReady = selectAuthReady(useAuthStore.getState());

      if (AUTH_REQUEST_LOG) {
        const path = `${config.method?.toUpperCase() ?? 'GET'} ${config.url ?? ''}`;
        logger.debug(
          'API',
          `${path} authAttached=${Boolean(token)} authReady=${authReady}`
        );
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _skipRefresh?: boolean;
    };

    const url = original?.url || '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      original &&
      !original._retry &&
      !original._skipRefresh &&
      !isAuthRoute &&
      selectAuthReady(useAuthStore.getState())
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken && original.headers) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }

      redirectToLogin();
      return Promise.reject(error);
    }

    const message = getApiErrorMessage(error);
    if (error.response?.status && error.response.status >= 500) {
      logger.error('API', `${error.config?.method?.toUpperCase()} ${error.config?.url}`, message);
    } else if (!error.response) {
      logger.warn('API', `network ${error.config?.url}`, message);
    } else if (error.response.status !== 401) {
      logger.debug('API', `${error.config?.method} ${error.config?.url}`, message);
    }
    return Promise.reject(error);
  }
);
