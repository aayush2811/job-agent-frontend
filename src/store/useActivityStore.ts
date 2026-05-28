import { create } from 'zustand';
import type { ActivityItem } from '@/types/activity';

const MAX_ITEMS = 80;

interface ActivityState {
  items: ActivityItem[];
  pulseAt: number;
  push: (item: Omit<ActivityItem, 'id'> & { id?: string }) => void;
  pushMany: (items: ActivityItem[]) => void;
  clear: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  items: [],
  pulseAt: 0,
  push: (item) =>
    set((state) => {
      const entry: ActivityItem = {
        id: item.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind: item.kind,
        title: item.title,
        message: item.message,
        timestamp: item.timestamp,
        meta: item.meta,
      };
      return {
        items: [entry, ...state.items].slice(0, MAX_ITEMS),
        pulseAt: Date.now(),
      };
    }),
  pushMany: (items) =>
    set((state) => ({
      items: [...items, ...state.items].slice(0, MAX_ITEMS),
      pulseAt: Date.now(),
    })),
  clear: () => set({ items: [], pulseAt: 0 }),
}));
