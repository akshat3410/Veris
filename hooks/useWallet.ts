import { useWalletStore } from '@/stores/useWalletStore';
import { connectFreighterWallet } from '@/lib/wallet/kit';

export function useWallet() {
  const {
    address,
    walletType,
    network,
    balanceXLM,
    balanceUSDC,
    isConnected,
    isConnecting,
    error,
    setWallet,
    setConnecting,
    setError,
    disconnect,
  } = useWalletStore();

  const connect = async () => {
    try {
      setConnecting(true);
      setError(null);
      const res = await connectFreighterWallet();
      setWallet(res.address, res.walletType as any);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  return {
    address,
    walletType,
    network,
    balanceXLM,
    balanceUSDC,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
