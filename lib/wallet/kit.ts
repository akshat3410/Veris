import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { isAllowed, setAllowed, getAddress, signTransaction } from '@stellar/freighter-api';

/**
 * Connect to Freighter wallet — NO fake fallback.
 * If Freighter is not installed or user denies, throw real error.
 */
export async function connectFreighterWallet(): Promise<{ address: string; walletType: string }> {
  const allowed = await isAllowed();
  if (!allowed) {
    await setAllowed();
  }

  const { address, error } = await getAddress();
  if (error) {
    throw new Error(`Freighter error: ${error.message || JSON.stringify(error)}`);
  }
  if (address) {
    return {
      address,
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
    address: userAddress,
  });

  if (result.error) {
    throw new Error(`Freighter signing error: ${result.error.message || JSON.stringify(result.error)}`);
  }

  const signedXdr = result.signedTxXdr;

  if (!signedXdr) {
    throw new Error('Freighter returned empty signed transaction');
  }

  return signedXdr;
}
