import { apiClient } from '@/lib/axios';
import { unwrapData } from '@/lib/api';
import { mapApiResumeToResume, mapApiResumeList } from '@/lib/mapResume';
import { Resume } from '@/types/resume';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

function resolveFileUrl(fileUrl: string): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `${API_BASE}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
}

export const resumesService = {
  getResumes: async (): Promise<Resume[]> => {
    const { data } = await apiClient.get('/resumes');
    const inner = unwrapData<{ resumes?: unknown[] }>(data, { resumes: [] });
    const list = mapApiResumeList(inner);
    return list.map((r) => ({
      ...r,
      fileUrl: resolveFileUrl(r.fileUrl),
    }));
  },

  getResumeById: async (id: string): Promise<Resume> => {
    const { data } = await apiClient.get(`/resumes/${id}`);
    const raw = unwrapData<{ resume?: unknown }>(data, {});
    const resume = mapApiResumeToResume(
      (raw as { resume?: Record<string, unknown> }).resume || (raw as Record<string, unknown>)
    );
    return { ...resume, fileUrl: resolveFileUrl(resume.fileUrl) };
  },

  uploadResume: async (file: File, meta?: { title?: string; tags?: string }) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (meta?.title) formData.append('title', meta.title);
    if (meta?.tags) formData.append('tags', meta.tags);

    const { data } = await apiClient.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const raw = unwrapData<{ resume?: unknown }>(data, {});
    const resume = mapApiResumeToResume(
      (raw as { resume?: Record<string, unknown> }).resume || (raw as Record<string, unknown>)
    );
    return { ...resume, fileUrl: resolveFileUrl(resume.fileUrl) };
  },

  updateResume: async (id: string, updates: Partial<Resume>) => {
    const { data } = await apiClient.patch(`/resumes/${id}`, {
      title: updates.title,
      tags: updates.tags,
      isActive: updates.isActive,
    });
    const raw = unwrapData<{ resume?: unknown }>(data, {});
    return mapApiResumeToResume(
      (raw as { resume?: Record<string, unknown> }).resume || (raw as Record<string, unknown>)
    );
  },

  deleteResume: async (id: string) => {
    const { data } = await apiClient.delete(`/resumes/${id}`);
    return unwrapData(data, { deleted: true });
  },

  setAsDefault: async (id: string) => {
    const { data } = await apiClient.post(`/resumes/${id}/default`);
    const raw = unwrapData<{ resume?: unknown }>(data, {});
    return mapApiResumeToResume(
      (raw as { resume?: Record<string, unknown> }).resume || (raw as Record<string, unknown>)
    );
  },
};
