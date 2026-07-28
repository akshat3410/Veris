'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from '@/stores/useWalletStore';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import {
  Contract,
  TransactionBuilder,
  rpc,
  nativeToScVal,
  BASE_FEE,
  Address,
  xdr,
  Keypair,
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

export type TxStage = 'idle' | 'simulating' | 'signing' | 'submitting' | 'pending' | 'confirmed' | 'failed';

export interface TxState {
  stage: TxStage;
  txHash: string | null;
  error: string | null;
}

// ─── Address Validation ─────────────────────────────────────────────
// Stellar SDK's `new Address(str)` only accepts C... (contract) keys.
// For G... (account) keys, we must validate the StrKey and build the
// ScVal manually.  This helper guarantees a valid ScVal or throws.

function isValidStellarPublicKey(key: string): boolean {
  try {
    Keypair.fromPublicKey(key);
    return true;
  } catch {
    return false;
  }
}

function isValidContractId(id: string): boolean {
  try {
    new Address(id); // Address() only accepts C... keys
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert any Stellar address (G... public key OR C... contract ID) to an ScVal.
 * Throws with a descriptive message if the address is invalid.
 */
function addressToScVal(addr: string): xdr.ScVal {
  if (!addr || typeof addr !== 'string') {
    throw new Error('Address is empty or not a string');
  }
  const trimmed = addr.trim();

  // C... contract address
  if (trimmed.startsWith('C') && trimmed.length === 56) {
    return new Address(trimmed).toScVal();
  }

  // G... account address
  if (trimmed.startsWith('G') && trimmed.length === 56) {
    if (!isValidStellarPublicKey(trimmed)) {
      throw new Error(`Invalid Stellar public key: ${trimmed}`);
    }
    // Build ScVal manually: scvAddress(scAddressTypeAccount(publicKeyTypeEd25519(rawBytes)))
    const kp = Keypair.fromPublicKey(trimmed);
    const accountId = xdr.PublicKey.publicKeyTypeEd25519(kp.rawPublicKey());
    const scAddress = xdr.ScAddress.scAddressTypeAccount(accountId);
    return xdr.ScVal.scvAddress(scAddress);
  }

  throw new Error(`Unsupported address format (must start with G or C, 56 chars): ${trimmed}`);
}

// ─── Soroban Type Helpers ────────────────────────────────────────────

function sorobanString(str: string): xdr.ScVal {
  return xdr.ScVal.scvString(str);
}

function encodeMilestoneInput(title: string, amount: bigint): xdr.ScVal {
  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('amount'),
      val: nativeToScVal(amount, { type: 'i128' }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol('title'),
      val: sorobanString(title),
    }),
  ]);
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useEscrowContract() {
  const [txState, setTxState] = useState<TxState>({
    stage: 'idle',
    txHash: null,
    error: null,
  });

  const queryClient = useQueryClient();
  const { address } = useWalletStore();

  const resetTx = () => setTxState({ stage: 'idle', txHash: null, error: null });

  /**
   * Core pipeline: simulate → sign (Freighter) → submit → poll
   */
  const executeContractCall = async (
    method: string,
    args: xdr.ScVal[],
  ): Promise<boolean> => {
    if (!address) {
      setTxState({ stage: 'failed', txHash: null, error: 'Connect your Freighter wallet first.' });
      return false;
    }

    try {
      // ── Step 1: Build & Simulate ──────────────────────────────────
      setTxState({ stage: 'simulating', txHash: null, error: null });
      console.log(`[Soroban] Calling ${method} with ${args.length} args`);

      const server = new rpc.Server(SOROBAN_CONFIG.rpcUrl);
      const contract = new Contract(SOROBAN_CONFIG.contractId);
      const operation = contract.call(method, ...args);

      // Get the caller's account (auto-fund via Friendbot if needed)
      let account;
      try {
        account = await server.getAccount(address);
      } catch {
        console.log('[Soroban] Account not found, funding via Friendbot...');
        await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
        await new Promise((r) => setTimeout(r, 2000));
        account = await server.getAccount(address);
      }

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(60)
        .build();

      // Use prepareTransaction (simulation + assembly in one call)
      let preparedTx;
      try {
        preparedTx = await server.prepareTransaction(tx);
      } catch (simErr: any) {
        throw new Error(`Simulation failed: ${simErr?.message || simErr}`);
      }

      // ── Step 2: Sign via Freighter ────────────────────────────────
      setTxState({ stage: 'signing', txHash: null, error: null });
      const xdrToSign = preparedTx.toXDR();
      console.log('[Soroban] Requesting Freighter signature...');

      const signedXdr = await signTransaction(xdrToSign, {
        networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
        accountToSign: address,
      });

      if (!signedXdr || typeof signedXdr !== 'string' || signedXdr.length < 10) {
        throw new Error('Freighter returned empty or invalid signed XDR');
      }

      // ── Step 3: Submit ────────────────────────────────────────────
      setTxState({ stage: 'submitting', txHash: null, error: null });
      console.log('[Soroban] Submitting signed transaction...');

      const signedTx = TransactionBuilder.fromXDR(signedXdr, SOROBAN_CONFIG.networkPassphrase);
      const sendRes = await server.sendTransaction(signedTx);

      if (sendRes.status === 'ERROR') {
        throw new Error(`Submission rejected: ${JSON.stringify(sendRes.errorResult)}`);
      }

      const txHash = sendRes.hash;

      // ── Step 4: Poll for confirmation ─────────────────────────────
      setTxState({ stage: 'pending', txHash, error: null });
      console.log(`[Soroban] Polling tx: ${txHash}`);

      let statusRes = await server.getTransaction(txHash);
      let attempts = 0;
      while (statusRes.status === rpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 20) {
        await new Promise((r) => setTimeout(r, 1000));
        statusRes = await server.getTransaction(txHash);
        attempts++;
      }

      // Fire webhook (best-effort)
      try {
        await fetch('/api/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: method,
            txHash,
            contractId: SOROBAN_CONFIG.contractId,
            status: statusRes.status,
          }),
        });
      } catch {
        // webhook is optional
      }

      if (statusRes.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        setTxState({ stage: 'confirmed', txHash, error: null });
        queryClient.invalidateQueries({ queryKey: ['escrows'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        console.log(`[Soroban] ✅ Confirmed: ${txHash}`);
        return true;
      } else {
        throw new Error(`Transaction failed on-chain: status=${statusRes.status}`);
      }
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      console.error('[Soroban] ❌ Error:', msg);
      setTxState({ stage: 'failed', txHash: null, error: msg });
      return false;
    }
  };

  // ─── Contract Methods ──────────────────────────────────────────────

  const createEscrow = async (
    title: string,
    beneficiary: string,
    arbiter: string,
    milestones: { title: string; amount: string }[]
  ) => {
    if (!address) return false;

    // Validate ALL addresses BEFORE touching XDR
    let depositorScVal: xdr.ScVal;
    let beneficiaryScVal: xdr.ScVal;
    let arbiterScVal: xdr.ScVal;
    let tokenScVal: xdr.ScVal;

    try {
      depositorScVal = addressToScVal(address);
    } catch (e: any) {
      setTxState({ stage: 'failed', txHash: null, error: `Invalid depositor address: ${e.message}` });
      return false;
    }

    try {
      beneficiaryScVal = addressToScVal(beneficiary || address);
    } catch (e: any) {
      setTxState({ stage: 'failed', txHash: null, error: `Invalid beneficiary address: ${e.message}` });
      return false;
    }

    try {
      arbiterScVal = addressToScVal(arbiter || address);
    } catch (e: any) {
      setTxState({ stage: 'failed', txHash: null, error: `Invalid arbiter address: ${e.message}` });
      return false;
    }

    try {
      tokenScVal = addressToScVal(SOROBAN_CONFIG.usdcTokenId);
    } catch (e: any) {
      setTxState({ stage: 'failed', txHash: null, error: `Invalid token address: ${e.message}` });
      return false;
    }

    // Build milestones Vec<MilestoneInput>
    const milestoneScVals = milestones.map((m) =>
      encodeMilestoneInput(
        m.title || 'Milestone',
        BigInt(Math.round((parseFloat(m.amount) || 1) * 1e7))
      )
    );

    return executeContractCall('create_escrow', [
      depositorScVal,
      beneficiaryScVal,
      arbiterScVal,
      tokenScVal,
      sorobanString(title || 'Escrow Contract'),
      xdr.ScVal.scvVec(milestoneScVals),
    ]);
  };

  const submitMilestoneWork = async (escrowId: number, milestoneIndex: number, proofCid: string) => {
    return executeContractCall('submit_milestone_work', [
      nativeToScVal(escrowId, { type: 'u64' }),
      nativeToScVal(milestoneIndex, { type: 'u32' }),
      sorobanString(proofCid),
    ]);
  };

  const approveMilestone = async (escrowId: number, milestoneIndex: number) => {
    return executeContractCall('approve_milestone', [
      nativeToScVal(escrowId, { type: 'u64' }),
      nativeToScVal(milestoneIndex, { type: 'u32' }),
    ]);
  };

  const disputeMilestone = async (escrowId: number, milestoneIndex: number, reasonCid: string) => {
    return executeContractCall('dispute_milestone', [
      nativeToScVal(escrowId, { type: 'u64' }),
      nativeToScVal(milestoneIndex, { type: 'u32' }),
      sorobanString(reasonCid),
    ]);
  };

  const resolveDispute = async (
    escrowId: number,
    milestoneIndex: number,
    beneficiaryAmount: string,
    depositorAmount: string
  ) => {
    return executeContractCall('resolve_dispute', [
      nativeToScVal(escrowId, { type: 'u64' }),
      nativeToScVal(milestoneIndex, { type: 'u32' }),
      nativeToScVal(BigInt(Math.round(parseFloat(beneficiaryAmount) * 1e7)), { type: 'i128' }),
      nativeToScVal(BigInt(Math.round(parseFloat(depositorAmount) * 1e7)), { type: 'i128' }),
    ]);
  };

  const cancelEscrow = async (escrowId: number) => {
    return executeContractCall('cancel_escrow', [nativeToScVal(escrowId, { type: 'u64' })]);
  };

  return {
    txState,
    resetTx,
    createEscrow,
    submitMilestoneWork,
    approveMilestone,
    disputeMilestone,
    resolveDispute,
    cancelEscrow,
  };
}
