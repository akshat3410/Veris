import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from '@/stores/useWalletStore';
import { signTransactionXDR } from '@/lib/wallet/kit';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import {
  Contract,
  TransactionBuilder,
  rpc,
  nativeToScVal,
  BASE_FEE,
  Address,
  Account,
  xdr,
} from '@stellar/stellar-sdk';

export type TxStage = 'idle' | 'simulating' | 'signing' | 'submitting' | 'pending' | 'confirmed' | 'failed';

export interface TxState {
  stage: TxStage;
  txHash: string | null;
  error: string | null;
}

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
   * Helper to execute Soroban transaction with full simulation, sign, and submission pipeline
   */
  const executeContractCall = async (
    method: string,
    args: any[],
    userAddress?: string
  ): Promise<boolean> => {
    const caller = userAddress || address;
    if (!caller) {
      setTxState({ stage: 'failed', txHash: null, error: 'Please connect your Stellar wallet first' });
      return false;
    }

    try {
      // 1. Simulation Stage
      setTxState({ stage: 'simulating', txHash: null, error: null });

      const server = new rpc.Server(SOROBAN_CONFIG.rpcUrl);
      const contract = new Contract(SOROBAN_CONFIG.contractId);
      const operation = contract.call(method, ...args);

      let account: Account;
      try {
        account = await server.getAccount(caller);
      } catch {
        // Unfunded account on Stellar Testnet -> Auto-fund via Friendbot
        try {
          await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(caller)}`);
          await new Promise((r) => setTimeout(r, 1500));
          account = await server.getAccount(caller);
        } catch {
          account = new Account(caller, '0');
        }
      }

      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(30)
        .build();

      const simRes = await server.simulateTransaction(tx);

      if (rpc.Api.isSimulationError(simRes)) {
        throw new Error(`Simulation Failed: ${simRes.error}`);
      }

      const assembledTx = rpc.assembleTransaction(tx, simRes).build();

      // 2. Signing Stage
      setTxState({ stage: 'signing', txHash: null, error: null });
      const xdrToSign = assembledTx.toXDR();

      let signedXdr: string;
      try {
        signedXdr = await signTransactionXDR(xdrToSign, caller);
      } catch (signErr: any) {
        throw new Error(signErr?.message || 'User rejected signature request');
      }

      // 3. Submission Stage
      setTxState({ stage: 'submitting', txHash: null, error: null });
      const sendRes = await server.sendTransaction(TransactionBuilder.fromXDR(signedXdr, SOROBAN_CONFIG.networkPassphrase));

      if (sendRes.status === 'ERROR') {
        throw new Error(`Transaction Submission Failed: ${JSON.stringify(sendRes.errorResult)}`);
      }

      const txHash = sendRes.hash;

      // 4. Pending / Polling Stage
      setTxState({ stage: 'pending', txHash, error: null });

      let statusRes = await server.getTransaction(txHash);
      let attempts = 0;
      while (statusRes.status === rpc.Api.GetTransactionStatus.NOT_FOUND && attempts < 15) {
        await new Promise((r) => setTimeout(r, 1000));
        statusRes = await server.getTransaction(txHash);
        attempts++;
      }

      // Dispatch Webhook Backend Confirmation
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
      } catch (webhookErr) {
        console.warn('Backend Webhook notification warning:', webhookErr);
      }

      if (statusRes.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        setTxState({ stage: 'confirmed', txHash, error: null });
        queryClient.invalidateQueries({ queryKey: ['escrows'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        return true;
      } else {
        throw new Error(`Transaction execution failed on ledger with status: ${statusRes.status}`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Transaction submission failed';
      console.error('[Real Soroban Execution Error]:', errorMsg);
      setTxState({ stage: 'failed', txHash: null, error: errorMsg });
      return false;
    }
  };

  /**
   * Helper: encode a JS string as a Soroban String (ScVal)
   */
  const sorobanString = (str: string): xdr.ScVal => {
    return xdr.ScVal.scvString(str);
  };

  /**
   * Helper: encode a MilestoneInput struct matching the contract's #[contracttype]
   * MilestoneInput { title: String, amount: i128 }
   */
  const encodeMilestoneInput = (title: string, amount: bigint): xdr.ScVal => {
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
  };

  /**
   * High level API methods mapping to contract functions
   */
  const createEscrow = async (
    title: string,
    beneficiary: string,
    arbiter: string,
    milestones: { title: string; amount: string }[]
  ) => {
    if (!address) return false;

    // Encode milestones as Vec<MilestoneInput> — a Soroban vector of contract structs
    const milestoneScVals = milestones.map((m) =>
      encodeMilestoneInput(
        m.title,
        BigInt(Math.round(parseFloat(m.amount) * 1e7))
      )
    );
    const milestonesVec = xdr.ScVal.scvVec(milestoneScVals);

    return executeContractCall('create_escrow', [
      new Address(address).toScVal(),
      new Address(beneficiary).toScVal(),
      new Address(arbiter).toScVal(),
      new Address(SOROBAN_CONFIG.usdcTokenId).toScVal(),
      sorobanString(title),
      milestonesVec,
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
    const benBig = BigInt(Math.round(parseFloat(beneficiaryAmount) * 1e7));
    const depBig = BigInt(Math.round(parseFloat(depositorAmount) * 1e7));

    return executeContractCall('resolve_dispute', [
      nativeToScVal(escrowId, { type: 'u64' }),
      nativeToScVal(milestoneIndex, { type: 'u32' }),
      nativeToScVal(benBig, { type: 'i128' }),
      nativeToScVal(depBig, { type: 'i128' }),
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
