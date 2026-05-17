'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

type ChartContainerProps = {
  children: ReactElement;
  className?: string;
  height?: number;
};

/**
 * Fixed-size wrapper so Recharts never receives width/height -1.
 * Defers chart render until after client mount.
 */
export function ChartContainer({
  children,
  className = 'w-full h-[300px] min-h-[300px]',
  height = 300,
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={className}
      style={{ width: '100%', height, minHeight: height }}
    >
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={height}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div
          className="w-full h-full rounded-lg bg-muted/30 animate-pulse"
          style={{ minHeight: height }}
          aria-hidden
        />
      )}
    </div>
  );
}
