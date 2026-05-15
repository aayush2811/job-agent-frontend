'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (email === 'admin@example.com' && password === 'admin123') {
        setTimeout(() => {
          login({ email: 'admin@example.com', name: 'Admin User' }, 'dummy_token');
          toast.success('Successfully logged in');
          router.push('/dashboard');
        }, 800);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Failed to log in. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Background */}
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
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                Email
              </label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                Password
              </label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 backdrop-blur-sm"
              />
            </div>
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <p className="text-xs text-muted-foreground mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
