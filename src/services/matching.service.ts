import { apiClient } from '@/lib/axios';
import type { JobMatchInsight } from '@/types/job';

export const matchingService = {
  getJobMatch: async (jobId: string) => {
    const { data } = await apiClient.get(`/matching/job/${jobId}`);
    return (data?.data || data) as JobMatchInsight;
  },
};
