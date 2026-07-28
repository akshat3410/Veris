import { create } from 'zustand';

export type ModalType = 'connect_wallet' | 'create_escrow' | 'submit_work' | 'dispute' | 'resolve_dispute' | null;

interface UIState {
  theme: 'dark' | 'light';
  activeModal: ModalType;
  selectedEscrowId: number | null;
  selectedMilestoneIndex: number | null;

  toggleTheme: () => void;
  openModal: (modal: ModalType, escrowId?: number, milestoneIndex?: number) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  activeModal: null,
  selectedEscrowId: null,
  selectedMilestoneIndex: null,

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        if (nextTheme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      }
      return { theme: nextTheme };
    }),

  openModal: (modal, escrowId = undefined, milestoneIndex = undefined) =>
    set({
      activeModal: modal,
      selectedEscrowId: escrowId ?? null,
      selectedMilestoneIndex: milestoneIndex ?? null,
    }),

  closeModal: () => set({ activeModal: null, selectedEscrowId: null, selectedMilestoneIndex: null }),
}));
