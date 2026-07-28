import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { isAllowed, setAllowed, getUserInfo, signTransaction } from '@stellar/freighter-api';

/**
 * Connect to Freighter wallet — NO fake fallback.
 * If Freighter is not installed or user denies, throw real error.
 */
export async function connectFreighterWallet(): Promise<{ address: string; walletType: string }> {
  const allowed = await isAllowed();
  if (!allowed) {
    await setAllowed();
  }

  const userInfo = await getUserInfo();
  if (userInfo && userInfo.publicKey) {
    return {
      address: userInfo.publicKey,
      walletType: 'freighter',
    };
  }

  throw new Error('Freighter wallet is not installed or not connected. Please install Freighter browser extension.');
}

/**
 * Sign a Soroban transaction XDR via Freighter wallet.
 * Returns the signed XDR string. Throws on user rejection.
 */
export async function signTransactionXDR(xdr: string, userAddress: string): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
    accountToSign: userAddress,
  });

  // Freighter v2+ returns { signedTxXdr: string } or a plain string
  if (typeof result === 'string') {
    return result;
  }
  if (result && typeof result === 'object' && 'signedTxXdr' in result) {
    return (result as any).signedTxXdr;
  }

  throw new Error('Freighter returned unexpected signing result');
}
