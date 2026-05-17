'use client';

import { useEffect } from 'react';
import { useWhatsAppStatus } from '@/hooks/queries/useWhatsApp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, Smartphone } from 'lucide-react';

export default function WhatsAppPage() {
  const { data: status, isLoading, error } = useWhatsAppStatus();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient">WhatsApp Automation</h1>
        <p className="text-muted-foreground mt-2">Manage your connected WhatsApp session for outreach.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-500" />
                Connection Status
              </CardTitle>
              {isLoading ? <Skeleton className="h-5 w-16" /> : (
                <Badge variant={status?.status === 'connected' ? 'default' : 'destructive'}>
                  {status?.status || 'Unknown'}
                </Badge>
              )}
            </div>
            <CardDescription>Current state of the Puppeteer instance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 min-h-[300px]">
            {isLoading ? (
              <Skeleton className="h-48 w-48 rounded-lg" />
            ) : status?.status === 'connected' ? (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-12 h-12 text-green-500" />
                </div>
                <p className="font-medium text-lg">Connected Successfully</p>
                <p className="text-sm text-muted-foreground">Your AI agent can now send and receive messages.</p>
              </div>
            ) : (
              <div className="text-center space-y-4 flex flex-col items-center">
                <QrCode className="w-48 h-48 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mt-4">Waiting for QR Code from backend...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle>Session Logs</CardTitle>
            <CardDescription>Live output from the WhatsApp service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded-md h-[300px] overflow-y-auto">
              <p>{`> Session started...`}</p>
              <p>{`> Awaiting authentication...`}</p>
              {status?.fallback && <p className="text-yellow-400">{`> Backend API unreachable. Using fallback state.`}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
