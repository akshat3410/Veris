import {
  StellarWalletsKit,
  WalletNetwork,
  ALLOW_ALL_MODULES,
  FREIGHTER_ID,
  ALBEDO_ID,
  RABET_ID,
  LOBSTR_ID,
  XBULL_ID,
} from '@creamtastic/stellar-wallets-kit';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { isAllowed, setAllowed, getUserInfo, signTransaction } from '@stellar/freighter-api';

let kitInstance: StellarWalletsKit | null = null;

export function getStellarWalletsKit(): StellarWalletsKit {
  if (typeof window === 'undefined') {
    throw new Error('StellarWalletsKit must be initialized on the client side');
  }

  if (!kitInstance) {
    kitInstance = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: ALLOW_ALL_MODULES,
    });
  }

  return kitInstance;
}

export async function connectFreighterWallet(): Promise<{ address: string; walletType: string }> {
  try {
    const allowed = await isAllowed();
    if (!allowed) {
      await setAllowed();
    }
    const userInfo = await getUserInfo();
    if (!userInfo || !userInfo.publicKey) {
      throw new Error('Freighter wallet returned empty public key');
    }
    return {
      address: userInfo.publicKey,
      walletType: 'freighter',
    };
  } catch (err: any) {
    console.warn('Freighter fallback to StellarWalletsKit:', err?.message);
    const kit = getStellarWalletsKit();
    await kit.openModal({
      onWalletSelected: async (option) => {
        kit.setWallet(option.id);
      },
    });
    const publicKey = await kit.getPublicKey();
    return {
      address: publicKey,
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
    console.warn('Freighter direct sign failed, attempting StellarWalletsKit:', err?.message);
    const kit = getStellarWalletsKit();
    const result = await kit.signTransaction(xdr, {
      networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
      accountToSign: userAddress,
    });
    return result;
  }
}
