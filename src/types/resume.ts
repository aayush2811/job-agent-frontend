export interface Skill {
  name: string;
  confidence: number; // 0-100
  yearsOfExperience?: number;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  impactScore?: number; // 0-100 AI evaluation
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear?: string;
}

export interface ParsedData {
  skills: Skill[];
  experienceTimeline: Experience[];
  education: Education[];
  keywords: string[];
}

export interface AIMetrics {
  atsScore: number; // Overall ATS compatibility
  impactScore: number; // AI-evaluated impact
  readabilityScore: number; // Text clarity
}

export interface ResumePerformance {
  applicationsSubmitted: number;
  interviewsGranted: number;
  successRate: number; // percentage
}

export interface Resume {
  id: string;
  title: string;
  originalFileName: string;
  uploadDate: string;
  fileUrl: string;
  fileSize: number; // in bytes
  
  parsedData: ParsedData;
  aiMetrics: AIMetrics;
  performanceAnalytics?: ResumePerformance;
  
  isDefault: boolean;
  isActive: boolean;
  status: 'uploading' | 'parsing' | 'analyzing' | 'ready' | 'error';
  tags: string[];
}

export interface ResumeStats {
  total: number;
  ready: number;
  averageAtsScore: number;
  topSkills: string[];
}
