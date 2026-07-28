import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '@/stores/useWalletStore';
import { connectFreighterWallet } from '@/lib/wallet/kit';

describe('EscrowVault Wallet & Store Suite', () => {
  beforeEach(() => {
    useWalletStore.getState().disconnect();
  });

  it('initializes in disconnected state', () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
  });

  it('connects wallet state cleanly', () => {
    const testAddress = 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQW6F6JLH2B35VJ6R4ZPA6Q4U';
    useWalletStore.getState().setWallet(testAddress, 'freighter');

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.address).toBe(testAddress);
    expect(state.walletType).toBe('freighter');
  });

  it('handles freighter connection fallback without throwing', async () => {
    const result = await connectFreighterWallet();
    expect(result.address).toBeDefined();
    expect(result.walletType).toBe('freighter');
  });

  it('disconnects wallet state cleanly', () => {
    useWalletStore.getState().setWallet('GBXG...Q4U', 'freighter');
    useWalletStore.getState().disconnect();

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
  });
});
