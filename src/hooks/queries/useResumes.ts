import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumesService } from '@/services/resumes.service';
import { Resume } from '@/types/resume';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { logger } from '@/lib/logger';

export function useResumes() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleResumeUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    };

    socket.on('resume-uploaded', handleResumeUpdate);
    socket.on('resume-updated', handleResumeUpdate);
    socket.on('resume-deleted', handleResumeUpdate);

    return () => {
      socket.off('resume-uploaded', handleResumeUpdate);
      socket.off('resume-updated', handleResumeUpdate);
      socket.off('resume-deleted', handleResumeUpdate);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      try {
        return await resumesService.getResumes();
      } catch (error) {
        logger.error('Resumes', 'fetch failed', error);
        return [] as Resume[];
      }
    },
    staleTime: 30000,
    retry: 1,
    placeholderData: [] as Resume[],
  });
}

export function useResumeStats() {
  const { data: resumes = [] } = useResumes();

  const stats = {
    total: resumes.length,
    ready: resumes.filter((r) => r.status === 'ready').length,
    averageAtsScore: resumes.length
      ? Math.round(
          resumes.reduce((acc, curr) => acc + (curr.aiMetrics?.atsScore || 0), 0) /
            resumes.length
        )
      : 0,
    topSkills: [] as string[],
  };

  const skillCounts: Record<string, number> = {};
  resumes.forEach((r) => {
    r.parsedData?.skills?.forEach((s) => {
      skillCounts[s.name] = (skillCounts[s.name] || 0) + 1;
    });
  });
  stats.topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name]) => name);

  return { data: stats, isLoading: false };
}

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => resumesService.uploadResume(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumesService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

export function useSetDefaultResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resumesService.setAsDefault(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['resumes'] });
      const previousResumes = queryClient.getQueryData<Resume[]>(['resumes']);

      if (previousResumes) {
        queryClient.setQueryData<Resume[]>(['resumes'], (old) =>
          (old || []).map((r) => ({ ...r, isDefault: r.id === id }))
        );
      }
      return { previousResumes };
    },
    onError: (_err, _id, context) => {
      if (context?.previousResumes) {
        queryClient.setQueryData(['resumes'], context.previousResumes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Resume> }) =>
      resumesService.updateResume(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
}
