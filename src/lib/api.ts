import { AxiosError } from 'axios';

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export function unwrapData<T>(payload: unknown, fallback: T): T {
  if (payload == null) return fallback;
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const inner = (payload as ApiResponse<T>).data;
    return (inner ?? fallback) as T;
  }
  return payload as T;
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (error instanceof AxiosError) {
    if (!error.response) {
      return 'Network error — check API URL and server CORS';
    }
    const data = error.response.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export const EMPTY_DASHBOARD = {
  totalJobs: 0,
  applications: 0,
  successRate: 0,
  dailyActivity: [] as { name: string; apps: number; count?: number; date?: string }[],
  interviews: 0,
  offers: 0,
};
