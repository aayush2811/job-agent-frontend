'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usersService } from '@/services/users.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Bell, Briefcase, FileText, Send, User, Zap } from 'lucide-react';
import { telegramService } from '@/services/telegram.service';
import { PulseDot } from '@/components/ui/pulse-dot';
import Link from 'next/link';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{
    enabled?: boolean;
    credentials?: boolean;
    state?: { status?: string; isPolling?: boolean; chatConnected?: boolean };
  } | null>(null);
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [prefs, setPrefs] = useState({
    autoApply: true,
    minScore: 80,
    emailAlerts: true,
    telegramAlerts: true,
  });

  useEffect(() => {
    usersService
      .getSettings()
      .then((s) => {
        updateUser(s.user);
        setName(s.user.name);
        setTelegramStatus({
          enabled: Boolean(s.integrations?.telegram),
          state: s.integrations?.telegram as { status?: string; isPolling?: boolean },
        });
      })
      .catch(() => {});

    telegramService
      .getStatus()
      .then((res) => {
        if (res?.data) setTelegramStatus(res.data);
      })
      .catch(() => {});
  }, [updateUser]);

  const sendTelegramTest = async () => {
    setTelegramTesting(true);
    try {
      await telegramService.sendTest();
      toast.success('Test notification sent to Telegram');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || 'Failed to send test notification');
    } finally {
      setTelegramTesting(false);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const updated = await usersService.patchProfile({ name });
      updateUser(updated);
      toast.success('Profile saved');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Control Panel</h1>
        <p className="text-muted-foreground mt-2">
          Profile, automation boundaries, and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-1 hidden sm:inline" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="w-4 h-4 mr-1 hidden sm:inline" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="resumes">
            <FileText className="w-4 h-4 mr-1 hidden sm:inline" />
            Resumes
          </TabsTrigger>
          <TabsTrigger value="notify">
            <Bell className="w-4 h-4 mr-1 hidden sm:inline" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Send className="w-4 h-4 mr-1 hidden sm:inline" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your workspace identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan</label>
                <Input value={user?.plan || 'free'} disabled className="capitalize" />
              </div>
              <Button onClick={saveProfile} disabled={loading}>
                {loading ? 'Saving…' : 'Save profile'}
              </Button>
              {!user?.onboardingComplete && (
                <Link
                  href="/onboarding"
                  className="inline-flex ml-2 h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
                >
                  Complete onboarding
                </Link>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="mt-4 space-y-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Job automation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm">Auto-apply when score ≥ threshold</span>
                <input
                  type="checkbox"
                  checked={prefs.autoApply}
                  onChange={(e) => setPrefs((p) => ({ ...p, autoApply: e.target.checked }))}
                  className="h-4 w-4"
                />
              </label>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum match score (%)</label>
                <Input
                  type="number"
                  value={prefs.minScore}
                  onChange={(e) =>
                    setPrefs((p) => ({ ...p, minScore: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Server thresholds are configured on the backend; these preferences are stored locally
                for your demo workspace.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumes" className="mt-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Resume preferences</CardTitle>
              <CardDescription>Default resume drives AI matching</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/resumes"
                className="inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
              >
                Manage resumes
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="glass-card border-none glow-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Telegram
              </CardTitle>
              <CardDescription>Approval requests and automation alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <PulseDot
                  active={
                    telegramStatus?.state?.isPolling === true ||
                    telegramStatus?.state?.status === 'running'
                  }
                  variant={
                    telegramStatus?.state?.status === 'running' ? 'success' : 'warning'
                  }
                />
                <span>
                  Status: {telegramStatus?.state?.status || 'unknown'}
                  {telegramStatus?.credentials === false && ' (missing credentials)'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Server uses TELEGRAM_CHAT_ID for your workspace. Pipeline jobs notify the
                configured owner chat.
              </p>
              <Button onClick={sendTelegramTest} disabled={telegramTesting}>
                {telegramTesting ? 'Sending…' : 'Send Test Telegram Notification'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notify" className="mt-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Email on apply success</span>
                <input
                  type="checkbox"
                  checked={prefs.emailAlerts}
                  onChange={(e) => setPrefs((p) => ({ ...p, emailAlerts: e.target.checked }))}
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Telegram approval pings</span>
                <input
                  type="checkbox"
                  checked={prefs.telegramAlerts}
                  onChange={(e) => setPrefs((p) => ({ ...p, telegramAlerts: e.target.checked }))}
                />
              </label>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
