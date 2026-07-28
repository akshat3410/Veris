import {
  rpc,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
  TransactionBuilder,
  Networks,
  Keypair,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';

export const sorobanRpc = new rpc.Server(SOROBAN_CONFIG.rpcUrl);

export interface MilestoneData {
  index: number;
  title: string;
  amount: bigint;
  status: 'Pending' | 'Submitted' | 'Approved' | 'Disputed' | 'Resolved';
  proofCid: string;
  disputeReasonCid: string;
}

export interface EscrowDetails {
  id: number;
  depositor: string;
  beneficiary: string;
  arbiter: string;
  token: string;
  totalAmount: bigint;
  releasedAmount: bigint;
  status: 'Funded' | 'InDevelopment' | 'Completed' | 'Disputed' | 'Cancelled';
  milestones: MilestoneData[];
  createdAt: number;
  title: string;
}

export interface ContractEventItem {
  id: string;
  type: string;
  ledger: number;
  createdAt: string;
  contractId: string;
  topic: string[];
  value: any;
}

/**
 * Read single escrow record from Soroban RPC
 */
export async function getEscrowFromRPC(escrowId: number): Promise<EscrowDetails | null> {
  try {
    const contract = new Contract(SOROBAN_CONFIG.contractId);
    const operation = contract.call('get_escrow', nativeToScVal(escrowId, { type: 'u64' }));

    // Prepare read-only account keypair for simulation
    const dummyKey = Keypair.random();
    const account = new rpc.Account(dummyKey.publicKey(), '0');

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simRes = await sorobanRpc.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(simRes) && simRes.result) {
      const val = simRes.result.retval;
      const rawObj: any = scValToNative(val);

      return parseEscrowObject(rawObj, escrowId);
    }
    return null;
  } catch (err) {
    console.error(`Error reading escrow #${escrowId} from Soroban RPC:`, err);
    return null;
  }
}

/**
 * Read total escrow count from contract
 */
export async function getEscrowCountFromRPC(): Promise<number> {
  try {
    const contract = new Contract(SOROBAN_CONFIG.contractId);
    const operation = contract.call('get_escrow_count');
    const dummyKey = Keypair.random();
    const account = new rpc.Account(dummyKey.publicKey(), '0');

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: SOROBAN_CONFIG.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    const simRes = await sorobanRpc.simulateTransaction(tx);

    if (rpc.Api.isSimulationSuccess(simRes) && simRes.result) {
      const count = scValToNative(simRes.result.retval);
      return Number(count);
    }
    return 0;
  } catch (err) {
    console.error('Error reading escrow count from Soroban RPC:', err);
    return 0;
  }
}

/**
 * Fetch contract events from Soroban RPC
 */
export async function getContractEventsFromRPC(): Promise<ContractEventItem[]> {
  try {
    const latestLedger = await sorobanRpc.getLatestLedger();
    const startLedger = Math.max(1, latestLedger.sequence - 1000);

    const eventsRes = await sorobanRpc.getEvents({
      startLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [SOROBAN_CONFIG.contractId],
        },
      ],
      limit: 50,
    });

    return (eventsRes.events || []).map((e) => ({
      id: e.id,
      type: e.type,
      ledger: e.ledger,
      createdAt: e.ledgerClosedAt || new Date().toISOString(),
      contractId: e.contractId,
      topic: e.topic.map((t) => xdr.ScVal.fromXDR(t, 'base64').toString()),
      value: scValToNative(xdr.ScVal.fromXDR(e.value, 'base64')),
    }));
  } catch (err) {
    console.error('Error fetching contract events from RPC:', err);
    return [];
  }
}

/**
 * Parse raw Native object from ScVal into typed EscrowDetails
 */
function parseEscrowObject(obj: any, fallbackId: number): EscrowDetails {
  const milestones: MilestoneData[] = (obj.milestones || []).map((m: any, idx: number) => ({
    index: typeof m.index === 'number' ? m.index : idx,
    title: m.title || `Milestone #${idx + 1}`,
    amount: BigInt(m.amount || 0),
    status: parseStatusEnum(m.status, 'Pending'),
    proofCid: m.proof_cid || m.proofCid || '',
    disputeReasonCid: m.dispute_reason_cid || m.disputeReasonCid || '',
  }));

  return {
    id: typeof obj.id === 'number' ? obj.id : fallbackId,
    depositor: obj.depositor || '',
    beneficiary: obj.beneficiary || '',
    arbiter: obj.arbiter || '',
    token: obj.token || SOROBAN_CONFIG.usdcTokenId,
    totalAmount: BigInt(obj.total_amount || obj.totalAmount || 0),
    releasedAmount: BigInt(obj.released_amount || obj.releasedAmount || 0),
    status: parseStatusEnum(obj.status, 'Funded'),
    milestones,
    createdAt: Number(obj.created_at || obj.createdAt || Math.floor(Date.now() / 1000)),
    title: obj.title || 'Untitled Escrow Engagement',
  };
}

function parseStatusEnum(val: any, fallback: string): any {
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) {
    const keys = Object.keys(val);
    if (keys.length > 0) return keys[0];
  }
  return fallback;
}
