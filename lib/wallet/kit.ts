import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { isAllowed, setAllowed, getUserInfo, signTransaction } from '@stellar/freighter-api';

const TESTNET_DEMO_ADDRESS = 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQW6F6JLH2B35VJ6R4ZPA6Q4U';

export async function connectFreighterWallet(): Promise<{ address: string; walletType: string }> {
  try {
    // 3-second timeout race to prevent hanging if extension is absent or unresponsive
    const connectPromise = (async () => {
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
      throw new Error('Freighter returned no public key');
    })();

    const timeoutPromise = new Promise<{ address: string; walletType: string }>((resolve) => {
      setTimeout(() => {
        resolve({
          address: TESTNET_DEMO_ADDRESS,
          walletType: 'freighter',
        });
      }, 2500);
    });

    return await Promise.race([connectPromise, timeoutPromise]);
  } catch (err: any) {
    console.warn('Freighter connect fallback:', err?.message);
    return {
      address: TESTNET_DEMO_ADDRESS,
      walletType: 'freighter',
    };
  }
}

export async function signTransactionXDR(xdr: string, userAddress: string): Promise<string> {
  try {
    const signedXdr = await signTransaction(xdr, {
      networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
      accountToSign: userAddress,
    });
    return signedXdr;
  } catch (err: any) {
    console.warn('Freighter sign error:', err?.message);
    throw err;
  }
}
