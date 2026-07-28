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
} from '@stellar/stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

export type TxStage = 'idle' | 'simulating' | 'signing' | 'submitting' | 'pending' | 'confirmed' | 'failed';

export interface TxState {
  stage: TxStage;
  txHash: string | null;
  error: string | null;
}

// ─── Address → ScVal (no Keypair, no sodium-native) ─────────────────

function addressToScVal(addr: string): xdr.ScVal {
  if (!addr || typeof addr !== 'string') {
    throw new Error(`Address is empty or not a string`);
  }
  const trimmed = addr.trim();
  if (trimmed.length !== 56 || (!/^[GC]/.test(trimmed))) {
    throw new Error(`Invalid Stellar address (must be 56 chars starting with G or C): "${trimmed.slice(0, 10)}..."`);
  }
  // Address class handles BOTH G... (account) and C... (contract) keys
  return new Address(trimmed).toScVal();
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
   * Core pipeline: build → simulate → sign (Freighter) → submit → poll
   * Every step has numbered logging so we can trace failures.
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
      // ── STEP 1: Create server & contract ──────────────────────────
      console.log('[Step 1] Creating server & contract...');
      const server = new rpc.Server(SOROBAN_CONFIG.rpcUrl);
      const contract = new Contract(SOROBAN_CONFIG.contractId);
      console.log('[Step 1] ✅ Done');

      // ── STEP 2: Build operation ───────────────────────────────────
      console.log(`[Step 2] Building operation: ${method} with ${args.length} args`);
      const operation = contract.call(method, ...args);
      console.log('[Step 2] ✅ Done');

      // ── STEP 3: Get account ───────────────────────────────────────
      setTxState({ stage: 'simulating', txHash: null, error: null });
      console.log(`[Step 3] Fetching account: ${address}`);
      let account;
      try {
        account = await server.getAccount(address);
      } catch {
        console.log('[Step 3] Account not found, funding via Friendbot...');
        await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
        await new Promise((r) => setTimeout(r, 3000));
        account = await server.getAccount(address);
      }
      console.log('[Step 3] ✅ Done, seq:', account.sequenceNumber());

      // ── STEP 4: Build transaction ─────────────────────────────────
      console.log('[Step 4] Building transaction...');
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(60)
        .build();
      console.log('[Step 4] ✅ Done');

      // ── STEP 5: Simulate via prepareTransaction ───────────────────
      console.log('[Step 5] Simulating (prepareTransaction)...');
      let preparedTx;
      try {
        preparedTx = await server.prepareTransaction(tx);
      } catch (simErr: any) {
        const simMsg = simErr?.message || String(simErr);
        console.error('[Step 5] ❌ Simulation failed:', simMsg);
        throw new Error(`Simulation failed: ${simMsg}`);
      }
      console.log('[Step 5] ✅ Done');

      // ── STEP 6: Get XDR for signing ───────────────────────────────
      console.log('[Step 6] Serializing XDR for signing...');
      const xdrToSign = preparedTx.toXDR();
      console.log('[Step 6] ✅ XDR length:', xdrToSign.length);

      // ── STEP 7: Sign via Freighter ────────────────────────────────
      setTxState({ stage: 'signing', txHash: null, error: null });
      console.log('[Step 7] Requesting Freighter signature...');
      const freighterResult = await signTransaction(xdrToSign, {
        networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
        address: address,
      });

      if (freighterResult.error) {
        throw new Error(`Freighter error: ${freighterResult.error.message || JSON.stringify(freighterResult.error)}`);
      }

      const signedXdr = freighterResult.signedTxXdr;

      if (!signedXdr || signedXdr.length < 20) {
        throw new Error('Freighter returned empty signed transaction. Did you reject the popup?');
      }
      console.log('[Step 7] ✅ Signed XDR length:', signedXdr.length);

      // ── STEP 8: Parse & submit ────────────────────────────────────
      setTxState({ stage: 'submitting', txHash: null, error: null });
      console.log('[Step 8] Parsing signed XDR & submitting...');
      const signedTx = TransactionBuilder.fromXDR(signedXdr, SOROBAN_CONFIG.networkPassphrase);
      const sendRes = await server.sendTransaction(signedTx);

      if (sendRes.status === 'ERROR') {
        throw new Error(`Submission rejected: ${JSON.stringify(sendRes.errorResult)}`);
      }

      const txHash = sendRes.hash;
      console.log('[Step 8] ✅ Submitted, hash:', txHash);

      // ── STEP 9: Poll for confirmation ─────────────────────────────
      setTxState({ stage: 'pending', txHash, error: null });
      console.log('[Step 9] Polling for confirmation...');

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
      } catch { /* webhook is optional */ }

      if (statusRes.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        setTxState({ stage: 'confirmed', txHash, error: null });
        queryClient.invalidateQueries({ queryKey: ['escrows'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        console.log(`[Step 9] ✅ CONFIRMED: https://stellar.expert/explorer/testnet/tx/${txHash}`);
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

    console.log('[createEscrow] Encoding arguments...');
    console.log('  depositor:', address);
    console.log('  beneficiary:', beneficiary || '(using depositor)');
    console.log('  arbiter:', arbiter || '(using depositor)');
    console.log('  token:', SOROBAN_CONFIG.usdcTokenId);
    console.log('  milestones:', milestones.length);

    try {
      const depositorScVal = addressToScVal(address);
      const beneficiaryScVal = addressToScVal(beneficiary || address);
      const arbiterScVal = addressToScVal(arbiter || address);
      const tokenScVal = addressToScVal(SOROBAN_CONFIG.usdcTokenId);

      const milestoneScVals = milestones.map((m) =>
        encodeMilestoneInput(
          m.title || 'Milestone',
          BigInt(Math.round((parseFloat(m.amount) || 1) * 1e7))
        )
      );

      console.log('[createEscrow] ✅ All args encoded successfully');

      return executeContractCall('create_escrow', [
        depositorScVal,
        beneficiaryScVal,
        arbiterScVal,
        tokenScVal,
        sorobanString(title || 'Escrow Contract'),
        xdr.ScVal.scvVec(milestoneScVals),
      ]);
    } catch (e: any) {
      console.error('[createEscrow] ❌ Arg encoding failed:', e.message);
      setTxState({ stage: 'failed', txHash: null, error: `Encoding error: ${e.message}` });
      return false;
    }
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
