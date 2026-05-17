import { Resume } from '@/types/resume';

type ApiResume = {
  _id?: string;
  id?: string;
  title?: string;
  originalName?: string;
  filename?: string;
  fileUrl?: string;
  fileSize?: number;
  uploadedAt?: string;
  createdAt?: string;
  parsedSkills?: string[];
  parsedExperience?: string;
  parsedKeywords?: string[];
  tags?: string[];
  isDefault?: boolean;
  isActive?: boolean;
  uploadStatus?: string;
  parseError?: string | null;
};

function mapUploadStatus(status?: string): Resume['status'] {
  switch (status) {
    case 'completed':
      return 'ready';
    case 'processing':
    case 'pending':
      return 'parsing';
    case 'failed':
      return 'error';
    default:
      return 'ready';
  }
}

function estimateAtsScore(skills: string[], keywords: string[]): number {
  const n = skills.length + keywords.length;
  if (n === 0) return 50;
  return Math.min(95, 55 + n * 3);
}

export function mapApiResumeToResume(raw: ApiResume): Resume {
  const skills = (raw.parsedSkills || []).map((name) => ({
    name,
    confidence: 80,
  }));

  const keywords = raw.parsedKeywords || [];
  const atsScore = estimateAtsScore(skills.map((s) => s.name), keywords);

  const id = String(raw._id || raw.id || '');

  return {
    id,
    title: raw.title || raw.originalName || 'Untitled Resume',
    originalFileName: raw.originalName || raw.filename || 'resume.pdf',
    uploadDate: raw.uploadedAt || raw.createdAt || new Date().toISOString(),
    fileUrl: raw.fileUrl || '',
    fileSize: raw.fileSize || 0,
    parsedData: {
      skills,
      experienceTimeline: [],
      education: [],
      keywords,
    },
    aiMetrics: {
      atsScore,
      impactScore: Math.min(100, atsScore - 5),
      readabilityScore: 75,
    },
    isDefault: Boolean(raw.isDefault),
    isActive: raw.isActive !== false,
    status: mapUploadStatus(raw.uploadStatus),
    tags: raw.tags || [],
  };
}

export function mapApiResumeList(payload: unknown): Resume[] {
  if (Array.isArray(payload)) {
    return payload.map((r) => mapApiResumeToResume(r as ApiResume));
  }
  if (payload && typeof payload === 'object') {
    const obj = payload as { resumes?: ApiResume[] };
    if (Array.isArray(obj.resumes)) {
      return obj.resumes.map(mapApiResumeToResume);
    }
  }
  return [];
}
