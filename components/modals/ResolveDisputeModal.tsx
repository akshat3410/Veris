'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import { ShieldCheck, Scale, DollarSign } from 'lucide-react';

export function ResolveDisputeModal() {
  const { activeModal, selectedEscrowId, selectedMilestoneIndex, closeModal } = useUIStore();
  const { txState, resetTx, resolveDispute } = useEscrowContract();

  const [beneficiaryAmount, setBeneficiaryAmount] = useState('500');
  const [depositorAmount, setDepositorAmount] = useState('500');

  if (activeModal !== 'resolve_dispute' || selectedEscrowId === null || selectedMilestoneIndex === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await resolveDispute(
      selectedEscrowId,
      selectedMilestoneIndex,
      beneficiaryAmount,
      depositorAmount
    );
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
        <div className="w-full max-w-md p-6 rounded-2xl bg-stellar-surface border border-stellar-amber/40 shadow-glow-violet space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stellar-amber/20 text-stellar-amber">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Arbiter Dispute Resolution</h3>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">
                  Beneficiary Payout
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={beneficiaryAmount}
                    onChange={(e) => setBeneficiaryAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-stellar-obsidian border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-stellar-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">
                  Depositor Refund
                </label>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    value={depositorAmount}
                    onChange={(e) => setDepositorAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-stellar-obsidian border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-stellar-amber"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-yellow-600 hover:to-amber-600 text-white font-bold text-sm shadow-glow-violet transition-all"
            >
              Execute Final Dispute Settlement
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
