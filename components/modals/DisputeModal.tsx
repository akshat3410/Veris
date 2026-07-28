'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import { AlertTriangle } from 'lucide-react';

export function DisputeModal() {
  const { activeModal, selectedEscrowId, selectedMilestoneIndex, closeModal } = useUIStore();
  const { txState, resetTx, disputeMilestone } = useEscrowContract();
  const [reasonCid, setReasonCid] = useState('');

  if (activeModal !== 'dispute' || selectedEscrowId === null || selectedMilestoneIndex === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonCid) return;

    const ok = await disputeMilestone(selectedEscrowId, selectedMilestoneIndex, reasonCid);
    if (ok) {
      setTimeout(() => {
        closeModal();
        resetTx();
      }, 2000);
    }
  };

  return (
    <>
      <TxModal txState={txState} onClose={resetTx} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-md p-6 rounded-2xl bg-stellar-surface border border-rose-500/40 shadow-lg shadow-rose-950/50 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Open Milestone Dispute</h3>
                <p className="text-xs text-gray-400 font-mono">
                  Escrow #{selectedEscrowId} — Milestone #{selectedMilestoneIndex + 1}
                </p>
              </div>
            </div>
            <button onClick={closeModal} className="text-gray-400 hover:text-white font-bold">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1.5">
                Dispute Reason / Claim Proof (IPFS CID)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe the milestone specification mismatch or provide IPFS link to evidence..."
                value={reasonCid}
                onChange={(e) => setReasonCid(e.target.value)}
                className="w-full p-3 rounded-xl bg-stellar-obsidian border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              ⚠️ Opening a dispute will lock this milestone until resolved by the designated Arbiter on Soroban ledger.
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-red-700 hover:to-rose-600 text-white font-bold text-sm transition-all"
            >
              Trigger Dispute On-Chain
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
