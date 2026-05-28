'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { bootstrapAuthSession } from '@/lib/auth-session';
import { useAuthReady } from '@/hooks/useAuthQueryEnabled';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, hasHydrated } = useAuthReady();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      console.log('[Login] Already authenticated, redirecting to /dashboard');
      router.replace('/dashboard');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleDemoLogin = async () => {
    console.log('[Login] Entering Demo Mode');
    console.log('[Login] demo mode enabled');
    setIsLoading(true);
    try {
      const session = await authService.demoLogin();
      await bootstrapAuthSession(session, queryClient);
      useAuthStore.setState({ isDemoMode: true });
      toast.success('Successfully logged in (Demo Mode)');
      console.log('[Login] redirecting dashboard');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to start Demo Mode. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (email === 'demo@jobagent.ai' && password === 'demo123') {
      console.log('[Login] Demo credentials used, calling backend demo-login');
      console.log('[Login] demo mode enabled');
      try {
        const session = await authService.demoLogin();
        await bootstrapAuthSession(session, queryClient);
        useAuthStore.setState({ isDemoMode: true });
        toast.success('Successfully logged in (Demo Mode)');
        console.log('[Login] redirecting dashboard');
        router.push('/dashboard');
      } catch {
        toast.error('Failed to log in as Demo User. Is backend running?');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const session = await authService.login({ email, password });
      await bootstrapAuthSession(session, queryClient);
      toast.success('Successfully logged in');
      if (!session.user.onboardingComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch {
      toast.error('Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-3xl rounded-full mix-blend-multiply opacity-70 animate-blob" />
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-500/20 blur-3xl rounded-full mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />

      <Card className="w-full max-w-md glass-card border-none shadow-2xl z-10">
        <CardHeader className="space-y-1 items-center pb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-gradient">AI Job Agent</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your automation dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-primary/45 hover:border-primary text-primary hover:bg-primary/5 mt-1"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Continue with Demo Account
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            No account?{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
