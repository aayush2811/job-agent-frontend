'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  FileUp,
  MessageCircle,
  Send,
  Zap,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumeUpload } from '@/components/resumes/ResumeUpload';
import { useAuthStore } from '@/store/useAuthStore';
import { usersService } from '@/services/users.service';
import { useResumes } from '@/hooks/queries/useResumes';

type StepKey = 'resume' | 'whatsapp' | 'telegram' | 'automation';

const STEPS: { key: StepKey; title: string; description: string; icon: typeof FileUp }[] = [
  {
    key: 'resume',
    title: 'Upload your first resume',
    description: 'PDF or DOCX — used for AI job matching.',
    icon: FileUp,
  },
  {
    key: 'whatsapp',
    title: 'Connect WhatsApp',
    description: 'Link the inbox where job leads arrive.',
    icon: MessageCircle,
  },
  {
    key: 'telegram',
    title: 'Connect Telegram',
    description: 'Approve applications from your phone.',
    icon: Send,
  },
  {
    key: 'automation',
    title: 'Enable automation',
    description: 'Turn on scoring, matching, and auto-apply.',
    icon: Zap,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { data: resumes, refetch: refetchResumes } = useResumes();
  const [flags, setFlags] = useState(user?.onboarding);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersService
      .getSettings()
      .then((settings) => {
        updateUser(settings.user);
        setFlags(settings.user.onboarding);
      })
      .catch(() => {
        /* optional */
      });
  }, [updateUser]);

  useEffect(() => {
    if (resumes && resumes.length > 0) {
      setFlags((prev) => {
        if (!prev) {
          return {
            resumeUploaded: true,
            whatsappConnected: false,
            telegramConnected: false,
            automationEnabled: false,
          };
        }
        return { ...prev, resumeUploaded: true };
      });
    }
  }, [resumes]);

  const markStep = async (patch: Partial<NonNullable<typeof flags>>) => {
    setSaving(true);
    try {
      const updated = await usersService.patchOnboarding(patch);
      updateUser(updated);
      setFlags(updated.onboarding);
      if (updated.onboardingComplete) {
        toast.success('Onboarding complete');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  const isDone = (key: StepKey) => {
    if (!flags) return false;
    switch (key) {
      case 'resume':
        return flags.resumeUploaded || (resumes?.length ?? 0) > 0;
      case 'whatsapp':
        return flags.whatsappConnected;
      case 'telegram':
        return flags.telegramConnected;
      case 'automation':
        return flags.automationEnabled;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center gap-3">
        <Briefcase className="w-6 h-6 text-primary" />
        <span className="font-semibold text-lg">Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</span>
      </header>

      <main className="max-w-2xl mx-auto py-10 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Set up your workspace</h1>
          <p className="text-muted-foreground mt-2">
            Complete these steps to start receiving and applying to jobs securely.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const done = isDone(step.key);
            const Icon = step.icon;
            return (
              <Card key={step.key} className="glass-card border-none">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-normal">
                          Step {index + 1}
                        </span>
                        {step.title}
                      </CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                    <Icon className="w-5 h-5 text-primary opacity-60" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {step.key === 'resume' && !done && (
                    <div className="border border-dashed rounded-lg p-4">
                      <ResumeUpload
                        onSuccess={() => {
                          refetchResumes();
                          markStep({ resumeUploaded: true });
                        }}
                      />
                    </div>
                  )}
                  {step.key === 'whatsapp' && (
                    <Link
                      href="/whatsapp"
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        done && 'pointer-events-none opacity-50'
                      )}
                    >
                      Open WhatsApp setup
                    </Link>
                  )}
                  {step.key === 'telegram' && (
                    <Link
                      href="/telegram"
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        done && 'pointer-events-none opacity-50'
                      )}
                    >
                      Open Telegram setup
                    </Link>
                  )}
                  {step.key === 'whatsapp' && !done && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={saving}
                      onClick={() => markStep({ whatsappConnected: true })}
                    >
                      Mark WhatsApp connected
                    </Button>
                  )}
                  {step.key === 'telegram' && !done && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={saving}
                      onClick={() => markStep({ telegramConnected: true })}
                    >
                      Mark Telegram connected
                    </Button>
                  )}
                  {step.key === 'automation' && (
                    <Button
                      disabled={saving || done}
                      onClick={() => markStep({ automationEnabled: true })}
                    >
                      Enable automation
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {user?.onboardingComplete && (
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Go to dashboard
          </Button>
        )}
      </main>
    </div>
  );
}
