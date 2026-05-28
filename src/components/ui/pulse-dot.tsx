'use client';

import { cn } from '@/lib/utils';

export function PulseDot({
  active = true,
  variant = 'success',
  className,
}: {
  active?: boolean;
  variant?: 'success' | 'warning' | 'danger' | 'primary';
  className?: string;
}) {
  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    primary: 'bg-primary',
  };

  return (
    <span className={cn('relative inline-flex h-2.5 w-2.5', className)}>
      {active && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            colors[variant]
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', colors[variant])} />
    </span>
  );
}
