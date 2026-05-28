'use client';

import { useEffect, useState } from 'react';
import { useWhatsAppStatus } from '@/hooks/queries/useWhatsApp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, Smartphone, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

export default function WhatsAppPage() {
  const { data: statusData, isLoading } = useWhatsAppStatus();
  const { socket } = useSocket();
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    'Session initialization started...',
    'Awaiting connection state from Puppeteer...'
  ]);

  // Sync REST status to local status
  useEffect(() => {
    if (statusData?.status) {
      setLocalStatus(statusData.status);
    }
  }, [statusData]);

  // Listen to Socket.IO events for live status and qr-updated
  useEffect(() => {
    if (!socket) return;

    const handleStatus = (data: any) => {
      setLocalStatus(data.status);
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${time}] System status changed to: ${data.status.toUpperCase()}`
      ]);
    };

    const handleQr = (data: { qr: string }) => {
      setQrCode(data.qr);
      setLocalStatus('qr');
      const time = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev,
        `[${time}] New QR code generated. Awaiting authentication scan.`
      ]);
    };

    socket.on('whatsapp-status', handleStatus);
    socket.on('qr-updated', handleQr);

    return () => {
      socket.off('whatsapp-status', handleStatus);
      socket.off('qr-updated', handleQr);
    };
  }, [socket]);

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
                <Badge variant={localStatus === 'connected' ? 'default' : localStatus === 'qr' ? 'outline' : 'destructive'} className={localStatus === 'qr' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : ''}>
                  {(localStatus || 'Unknown').toUpperCase()}
                </Badge>
              )}
            </div>
            <CardDescription>Current state of the Puppeteer instance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 min-h-[300px]">
            {isLoading ? (
              <Skeleton className="h-48 w-48 rounded-lg" />
            ) : localStatus === 'connected' ? (
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="w-12 h-12 text-green-500 animate-pulse" />
                </div>
                <p className="font-medium text-lg">Connected Successfully</p>
                <p className="text-sm text-muted-foreground">Your AI agent is authenticated and actively listening to message events.</p>
              </div>
            ) : localStatus === 'qr' ? (
              <div className="text-center space-y-4 flex flex-col items-center">
                {qrCode ? (
                  <>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                      alt="WhatsApp QR Code"
                      className="w-48 h-48 rounded-lg shadow-md border bg-white p-2"
                    />
                    <p className="text-sm text-muted-foreground mt-4">Scan this QR code with WhatsApp on your phone.</p>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground mt-4">Generating pairing QR Code...</p>
                  </>
                )}
              </div>
            ) : localStatus === 'initializing' || localStatus === 'starting' ? (
              <div className="text-center space-y-4 flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-medium text-lg">Initializing Browser...</p>
                <p className="text-sm text-muted-foreground">Puppeteer is starting the Chromium process backend.</p>
              </div>
            ) : localStatus === 'error' ? (
              <div className="text-center space-y-4 flex flex-col items-center">
                <Smartphone className="w-16 h-16 text-red-500 opacity-50" />
                <p className="font-medium text-lg text-red-500">Connection Failed</p>
                <p className="text-sm text-muted-foreground">Pairing failed. Re-initiating Puppeteer reconnect protocol...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 flex flex-col items-center">
                <QrCode className="w-48 h-48 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mt-4">Waiting for pairing request from backend...</p>
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
            <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded-md h-[300px] overflow-y-auto space-y-1">
              {logs.map((log, idx) => (
                <p key={idx}>{`> ${log}`}</p>
              ))}
              {statusData?.fallback && <p className="text-yellow-400">{`> Backend API unreachable. Using fallback state.`}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
