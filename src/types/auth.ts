export interface OnboardingFlags {
  resumeUploaded: boolean;
  whatsappConnected: boolean;
  telegramConnected: boolean;
  automationEnabled: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  onboardingComplete: boolean;
  onboarding?: OnboardingFlags;
  usage?: {
    resumesCount?: number;
    jobsToday?: number;
    uploadsToday?: number;
    lastResetDay?: string;
  };
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
