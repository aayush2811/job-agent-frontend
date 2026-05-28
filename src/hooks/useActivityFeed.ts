'use client';

import { useActivityStore } from '@/store/useActivityStore';

export function useActivityFeed(limit = 20) {
  const items = useActivityStore((s) => s.items);
  const pulseAt = useActivityStore((s) => s.pulseAt);
  return {
    activities: items.slice(0, limit),
    pulseAt,
    count: items.length,
  };
}
