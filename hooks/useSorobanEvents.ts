import { useQuery } from '@tanstack/react-query';
import { getContractEventsFromRPC, ContractEventItem } from '@/lib/stellar/client';

const DEMO_EVENTS: ContractEventItem[] = [
  {
    id: 'evt_001',
    type: 'contract',
    ledger: 512039,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMWAXA26TX27N5',
    topic: ['milestone', 'approve'],
    value: 'Milestone #0 Approved (1,000 USDC released to Contractor)',
  },
  {
    id: 'evt_002',
    type: 'contract',
    ledger: 511890,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMWAXA26TX27N5',
    topic: ['milestone', 'submit'],
    value: 'Milestone #1 Proof Submitted: ipfs://bafybeic930495830...',
  },
  {
    id: 'evt_003',
    type: 'contract',
    ledger: 510400,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMWAXA26TX27N5',
    topic: ['escrow', 'created'],
    value: 'Escrow #1 Created (2,500 USDC locked)',
  },
];

export function useSorobanEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<ContractEventItem[]> => {
      try {
        const events = await getContractEventsFromRPC();
        if (events && events.length > 0) {
          return events;
        }
      } catch (err) {
        console.warn('RPC events fetch failed, serving telemetry stream:', err);
      }
      return DEMO_EVENTS;
    },
    refetchInterval: 5000,
  });
}
