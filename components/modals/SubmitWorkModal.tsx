'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import { UploadSimple, X } from '@phosphor-icons/react';

export function SubmitWorkModal() {
  const { activeModal, selectedEscrowId, selectedMilestoneIndex, closeModal } = useUIStore();
  const { txState, resetTx, submitMilestoneWork } = useEscrowContract();
  const [proofCid, setProofCid] = useState('');

  if (activeModal !== 'submit_work' || selectedEscrowId === null || selectedMilestoneIndex === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofCid) return;

    const ok = await submitMilestoneWork(selectedEscrowId, selectedMilestoneIndex, proofCid);
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
        <div className="w-full max-w-md p-7 rounded-2xl bg-[#121216] border border-purple-500/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <UploadSimple size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white font-bitcoa">Submit Deliverable Proof</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Escrow #{selectedEscrowId} — Milestone #{selectedMilestoneIndex + 1}
                </p>
              </div>
            </div>
            <button onClick={closeModal} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              <X size={18} weight="bold" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase">
                IPFS Content Identifier (Proof CID)
              </label>
              <input
                type="text"
                value={proofCid}
                onChange={(e) => setProofCid(e.target.value)}
                placeholder="bafybeig..."
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1A1A22] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono text-sm transition-colors"
              />
              <p className="text-xs text-zinc-500 mt-1 font-mono">
                Cryptographic hash of work deliverables stored on IPFS/Arweave.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-purple-ghost px-5 py-2 text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-gold-accent px-6 py-2 text-xs">
                Submit Work Proof ↗
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
