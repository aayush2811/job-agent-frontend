export type ActivityKind =
  | 'job_found'
  | 'job_scored'
  | 'match'
  | 'approval'
  | 'applied'
  | 'failed'
  | 'whatsapp'
  | 'telegram'
  | 'resume'
  | 'system';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  message: string;
  timestamp: Date;
  meta?: Record<string, unknown>;
}
