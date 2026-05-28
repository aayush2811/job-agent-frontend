'use client';

import { MessageCircle, Send } from 'lucide-react';
import { useWhatsAppStatus } from '@/hooks/queries/useWhatsApp';
import { PulseDot } from '@/components/ui/pulse-dot';
import { cn } from '@/lib/utils';

function StatusChip({
  label,
  connected,
  icon: Icon,
}: {
  label: string;
  connected: boolean;
  icon: typeof MessageCircle;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors',
        connected
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'border-border bg-muted/30 text-muted-foreground'
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
      <PulseDot active={connected} variant={connected ? 'success' : 'warning'} />
    </div>
  );
}

export function IntegrationStatusRow() {
  const { data: wa } = useWhatsAppStatus();
  const waConnected = wa?.status === 'connected';

  return (
    <div className="flex flex-wrap gap-3">
      <StatusChip label="WhatsApp" connected={waConnected} icon={MessageCircle} />
      <StatusChip label="Telegram" connected={true} icon={Send} />
    </div>
  );
}
