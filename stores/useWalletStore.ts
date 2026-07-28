import { create } from 'zustand';

export type SupportedWallet = 'freighter' | 'lobstr' | 'xbull' | 'hana' | 'rabet' | 'albedo';

interface WalletState {
  address: string | null;
  walletType: SupportedWallet | null;
  network: string;
  balanceXLM: string;
  balanceUSDC: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  setWallet: (address: string, walletType: SupportedWallet) => void;
  setBalances: (xlm: string, usdc: string) => void;
  setNetwork: (network: string) => void;
  setConnecting: (isConnecting: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  walletType: null,
  network: 'TESTNET',
  balanceXLM: '0.00',
  balanceUSDC: '0.00',
  isConnected: false,
  isConnecting: false,
  error: null,

  setWallet: (address, walletType) =>
    set({ address, walletType, isConnected: true, isConnecting: false, error: null }),

  setBalances: (balanceXLM, balanceUSDC) => set({ balanceXLM, balanceUSDC }),

  setNetwork: (network) => set({ network }),

  setConnecting: (isConnecting) => set({ isConnecting }),

  setError: (error) => set({ error, isConnecting: false }),

  disconnect: () =>
    set({
      address: null,
      walletType: null,
      isConnected: false,
      balanceXLM: '0.00',
      balanceUSDC: '0.00',
      error: null,
    }),
}));
