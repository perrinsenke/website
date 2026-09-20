import { create } from 'zustand';

export const useStore = create((set) => ({
  bgMode: 'AUTO', // AUTO translates to FC globally, but BW while reading
  cycleBgMode: () => set((state) => {
    const current = state.bgMode === 'AUTO' ? 'BW' : state.bgMode;
    if (current === 'BW') return { bgMode: 'WB' };
    if (current === 'WB') return { bgMode: 'FC' };
    if (current === 'FC') return { bgMode: 'OFF' };
    return { bgMode: 'BW' };
  }),
  set3DEnabled: (enabled) => set({ bgMode: enabled ? 'AUTO' : 'OFF' }),
}));
