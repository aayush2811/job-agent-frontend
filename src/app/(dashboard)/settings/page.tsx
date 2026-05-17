'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure system preferences and AI agent boundaries.</p>
      </div>
      
      <div className="grid gap-6">
        <Card className="glass-card border-none shadow-md">
          <CardHeader>
            <CardTitle>AI Preferences</CardTitle>
            <CardDescription>Adjust the boundaries for your auto-apply agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Match Score (%)</label>
              <Input type="number" defaultValue={80} className="w-full max-w-xs bg-background/50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Job Titles (comma separated)</label>
              <Input defaultValue="Frontend Engineer, React Developer" className="w-full bg-background/50" />
            </div>
            <Button className="mt-4">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
