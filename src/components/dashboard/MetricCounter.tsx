'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export function MetricCounter({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'text-primary',
  glow = false,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  accent?: string;
  glow?: boolean;
}) {
  return (
    <Card
      className={cn(
        'glass-card border-none shadow-md hover:shadow-lg transition-all duration-300',
        glow && 'glow-border'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={cn('h-4 w-4', accent)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-3xl font-bold tracking-tight', accent)}>
          <AnimatedNumber value={value} />
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
      </CardContent>
    </Card>
  );
}
