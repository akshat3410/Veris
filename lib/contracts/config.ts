import { Asset, Networks } from '@stellar/stellar-sdk';

// Compute the native XLM Stellar Asset Contract (SAC) address for testnet
const nativeXlmSac = (() => {
  try {
    return Asset.native().contractId(Networks.TESTNET);
  } catch {
    // Fallback: known native XLM SAC on Stellar Testnet
    return 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMWAXA26TX27N5';
  }
})();

export const SOROBAN_CONFIG = {
  network: 'testnet',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; July 2015',
  // Deployed Soroban Milestone Escrow Contract ID
  contractId: 'CB6A4VZYMV3IOT4JNYA26XWX2UBR2LISJQOTHI3Z5Y3FVQMSZDXEQJXT',
  deployerAddress: 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQW6F6JLH2B35VJ6R4ZPA6Q4U',
  // Native XLM Stellar Asset Contract (SAC) for token operations
  usdcTokenId: nativeXlmSac,
};
