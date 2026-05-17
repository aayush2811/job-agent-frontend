import { ResumeDashboard } from '@/components/resumes/ResumeDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Intelligence | AI Job Agent',
  description: 'Manage and optimize your professional profiles for AI matching.',
};

export default function ResumesPage() {
  return <ResumeDashboard />;
}
