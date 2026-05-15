import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  user: unknown | null;
  setUser: (user: unknown | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  user: null,
  setUser: (user) => set({ user }),
}));
