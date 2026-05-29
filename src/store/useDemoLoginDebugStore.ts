import { create } from 'zustand';

interface DemoLoginDebugState {
  apiUrl: string;
  endpointCalled: string;
  responseStatus: string;
  errorMessage: string;
  setDebugInfo: (info: {
    apiUrl: string;
    endpointCalled: string;
    responseStatus: string;
    errorMessage: string;
  }) => void;
  clearDebugInfo: () => void;
}

export const useDemoLoginDebugStore = create<DemoLoginDebugState>((set) => ({
  apiUrl: '',
  endpointCalled: '',
  responseStatus: '',
  errorMessage: '',
  setDebugInfo: (info) => set(info),
  clearDebugInfo: () => set({ apiUrl: '', endpointCalled: '', responseStatus: '', errorMessage: '' }),
}));
