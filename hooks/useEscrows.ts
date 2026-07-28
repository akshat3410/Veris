import { useQuery } from '@tanstack/react-query';
import { getEscrowFromRPC, getEscrowCountFromRPC, EscrowDetails } from '@/lib/stellar/client';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';

let CREATED_ESCROWS: EscrowDetails[] = [];

export function addNewEscrowContract(escrow: {
  title: string;
  depositor?: string;
  beneficiary: string;
  arbiter: string;
  milestones: { title: string; amount: string }[];
}) {
  const totalAmountNum = escrow.milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);
  const nextId = DEMO_ESCROWS.length + CREATED_ESCROWS.length + 1;

  const newEscrow: EscrowDetails = {
    id: nextId,
    title: escrow.title,
    depositor: escrow.depositor || 'GDUPMODD6GJ60300H2HFF3CYEEGH2YFVZEHIVD0JSNXU07DYYGS6SCV6',
    beneficiary: escrow.beneficiary,
    arbiter: escrow.arbiter,
    token: SOROBAN_CONFIG.usdcTokenId,
    totalAmount: BigInt(Math.round(totalAmountNum * 1e7)),
    releasedAmount: 0n,
    status: 'InDevelopment',
    createdAt: Math.floor(Date.now() / 1000),
    milestones: escrow.milestones.map((m, idx) => ({
      index: idx,
      title: m.title,
      amount: BigInt(Math.round((parseFloat(m.amount) || 0) * 1e7)),
      status: 'Pending',
      proofCid: '',
      disputeReasonCid: '',
    })),
  };

  CREATED_ESCROWS = [newEscrow, ...CREATED_ESCROWS];
  return newEscrow;
}

// Mock/Demo escrows for seamless portfolio demonstration when offline/cold network
const DEMO_ESCROWS: EscrowDetails[] = [
  {
    id: 1,
    title: 'Soroban Smart Contract Audit & Optimization',
    depositor: 'GD5J34HGL65JOSJ3KKS7KSHW65HSJ2938475KSJ2938475KSJ2938475',
    beneficiary: 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQW6F6JLH2B35VJ6R4ZPA6Q4U',
    arbiter: 'GCA374JHS829374KSJH829374KSJH829374KSJH829374KSJH829374K',
    token: SOROBAN_CONFIG.usdcTokenId,
    totalAmount: 25000000000n, // 2,500 USDC
    releasedAmount: 10000000000n, // 1,000 USDC
    status: 'InDevelopment',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 4,
    milestones: [
      {
        index: 0,
        title: 'Initial Architecture Review & Ingestion',
        amount: 10000000000n,
        status: 'Approved',
        proofCid: 'bafybeigdyr3xy2584958302948573029485730294857',
        disputeReasonCid: '',
      },
      {
        index: 1,
        title: 'Formal WASM Verification & Gas Benchmarking',
        amount: 15000000000n,
        status: 'Submitted',
        proofCid: 'bafybeic930495830294857302948573029485730294857',
        disputeReasonCid: '',
      },
    ],
  },
  {
    id: 2,
    title: 'Cross-Border Supply Chain Liquidity Settlement',
    depositor: 'GBXGQJWVLWOYHFLVTKWV5FGHA3LNYY2JQW6F6JLH2B35VJ6R4ZPA6Q4U',
    beneficiary: 'GD5J34HGL65JOSJ3KKS7KSHW65HSJ2938475KSJ2938475KSJ2938475',
    arbiter: 'GCA374JHS829374KSJH829374KSJH829374KSJH829374KSJH829374K',
    token: SOROBAN_CONFIG.usdcTokenId,
    totalAmount: 50000000000n, // 5,000 USDC
    releasedAmount: 50000000000n, // 5,000 USDC
    status: 'Completed',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 12,
    milestones: [
      {
        index: 0,
        title: 'Document Processing & Freight Lock',
        amount: 25000000000n,
        status: 'Approved',
        proofCid: 'bafybeih930495830294857302948573029485730294857',
        disputeReasonCid: '',
      },
      {
        index: 1,
        title: 'Customs Clearance & Final Payout',
        amount: 25000000000n,
        status: 'Approved',
        proofCid: 'bafybeif930495830294857302948573029485730294857',
        disputeReasonCid: '',
      },
    ],
  },
];

export function useEscrows() {
  return useQuery({
    queryKey: ['escrows'],
    queryFn: async (): Promise<EscrowDetails[]> => {
      try {
        const count = await getEscrowCountFromRPC();
        if (count > 0) {
          const fetchPromises = Array.from({ length: count }, (_, i) => getEscrowFromRPC(i + 1));
          const results = await Promise.all(fetchPromises);
          const validEscrows = results.filter((e): e is EscrowDetails => e !== null);
          if (validEscrows.length > 0) {
            // Deduplicate: On-chain escrows take precedence over local CREATED_ESCROWS and DEMO_ESCROWS
            const onChainIds = new Set(validEscrows.map((e) => e.id));
            const remainingLocal = CREATED_ESCROWS.filter((e) => !onChainIds.has(e.id));
            const combined = [...validEscrows, ...remainingLocal];

            const seen = new Set<number>();
            return combined.filter((e) => {
              if (seen.has(e.id)) return false;
              seen.add(e.id);
              return true;
            });
          }
        }
      } catch (err) {
        console.warn('RPC fetch failed, serving showcase state:', err);
      }
      const createdIds = new Set(CREATED_ESCROWS.map((e) => e.id));
      const remainingDemo = DEMO_ESCROWS.filter((e) => !createdIds.has(e.id));
      const fallback = [...CREATED_ESCROWS, ...remainingDemo];
      const seenFallback = new Set<number>();
      return fallback.filter((e) => {
        if (seenFallback.has(e.id)) return false;
        seenFallback.add(e.id);
        return true;
      });
    },
    refetchInterval: 5000,
    staleTime: 1000,
  });
}

export function useEscrow(id: number) {
  return useQuery({
    queryKey: ['escrow', id],
    queryFn: async (): Promise<EscrowDetails | null> => {
      if (!id) return null;
      const localMatch = CREATED_ESCROWS.find((e) => e.id === id);
      if (localMatch) return localMatch;

      try {
        const data = await getEscrowFromRPC(id);
        if (data) return data;
      } catch (err) {
        console.warn(`RPC fetch for escrow ${id} failed:`, err);
      }
      return DEMO_ESCROWS.find((e) => e.id === id) || null;
    },
    refetchInterval: 5000,
    enabled: !!id,
  });
}
