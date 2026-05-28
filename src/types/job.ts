export interface RecommendedResumeRef {
  _id: string;
  title?: string;
  category?: string;
  isDefault?: boolean;
  fileUrl?: string;
}

export interface JobRecord {
  _id: string;
  id?: string;
  company?: string;
  role?: string;
  status?: string;
  matchScore?: number;
  resumeMatchScore?: number;
  confidence?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  experienceMatch?: string;
  recommendedResumeId?: RecommendedResumeRef | string | null;
  createdAt?: string;
  updatedAt?: string;
  email?: string;
  location?: string;
}

export interface JobMatchInsight {
  matchScore: number;
  confidence: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  recommendedResume: RecommendedResumeRef | null;
  pipelineScore?: number;
}
