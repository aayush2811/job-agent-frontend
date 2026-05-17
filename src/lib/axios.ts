import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiErrorMessage } from '@/lib/api';
import { logger } from '@/lib/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
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
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    const message = getApiErrorMessage(error);
    if (error.response?.status && error.response.status >= 500) {
      logger.error('API', `${error.config?.method?.toUpperCase()} ${error.config?.url}`, message);
    } else if (!error.response) {
      logger.warn('API', `network ${error.config?.url}`, message);
    } else {
      logger.debug('API', `${error.config?.method} ${error.config?.url}`, message);
    }
    return Promise.reject(error);
  }
);
