'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import { Upload, FileCheck } from 'lucide-react';

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
        <div className="w-full max-w-md p-6 rounded-2xl bg-stellar-surface border border-stellar-cyan/40 shadow-glow-cyan space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stellar-cyan/20 text-stellar-cyan">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Submit Deliverable Proof</h3>
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
                IPFS Hash / Deliverable Proof CID
              </label>
              <div className="relative">
                <FileCheck className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="ipfs://bafybei..."
                  value={proofCid}
                  onChange={(e) => setProofCid(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stellar-obsidian border border-white/10 text-white placeholder-gray-500 font-mono text-xs focus:outline-none focus:border-stellar-cyan"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Provide verifiable IPFS CID, GitHub PR URL, or audit document hash.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-stellar-cyan to-blue-600 hover:from-blue-600 hover:to-stellar-cyan text-stellar-obsidian font-bold text-sm shadow-glow-cyan transition-all"
            >
              Submit Deliverable On-Chain
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
