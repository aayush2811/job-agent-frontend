import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface HealthPayload {
  status: string;
  server?: { running?: boolean; uptime?: number; nodeEnv?: string };
  mongo?: { status?: string; connected?: boolean };
  socket?: { status?: string; connections?: number };
  whatsapp?: { status?: string };
  telegram?: {
    status?: string;
    isPolling?: boolean;
    chatConnected?: boolean;
    enabled?: boolean;
  };
  timestamp?: string;
}

export const healthService = {
  getHealth: async (): Promise<HealthPayload> => {
    const { data } = await axios.get(`${API_URL}/health`, { timeout: 8000 });
    return data?.data || data;
  },
};
