'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { addNewEscrowContract } from '@/hooks/useEscrows';
import { TxModal } from '@/components/common/TxModal';
import { Plus, Trash, ShieldCheck, CurrencyDollar, Stack, X } from '@phosphor-icons/react';

export function CreateEscrowModal() {
  const { activeModal, closeModal } = useUIStore();
  const { txState, resetTx, createEscrow } = useEscrowContract();

  const [title, setTitle] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [arbiter, setArbiter] = useState('');
  const [milestones, setMilestones] = useState([
    { title: 'Milestone 1: Design & Architecture Spec', amount: '1000' },
    { title: 'Milestone 2: Soroban Smart Contract & Testing', amount: '1500' },
  ]);

  if (activeModal !== 'create_escrow') return null;

  const totalAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: `Milestone ${milestones.length + 1}`, amount: '500' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: 'title' | 'amount', value: string) => {
    const next = [...milestones];
    next[index][field] = value;
    setMilestones(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !beneficiary || milestones.length === 0) return;

    const ok = await createEscrow(title, beneficiary, arbiter, milestones);
    if (ok) {
      addNewEscrowContract({ title, beneficiary, arbiter, milestones });
      setTimeout(() => {
        closeModal();
        resetTx();
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
          dashboard.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1500);
    }
  };

  return (
    <>
      <TxModal txState={txState} onClose={resetTx} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7 rounded-2xl bg-[#121216] border border-purple-500/30 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Stack size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white font-bitcoa">Deploy Soroban Escrow</h3>
                <p className="text-xs text-zinc-400 font-mono">Create milestone-based smart contract engagement</p>
              </div>
            </div>
            <button onClick={closeModal} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
              <X size={18} weight="bold" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase">
                Engagement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smart Contract Audit & Gas Optimization"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1A1A22] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-medium text-sm transition-colors"
              />
            </div>

            {/* Beneficiary Address */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase">
                Contractor (Beneficiary Stellar Public Key)
              </label>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                placeholder="G..."
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1A1A22] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono text-sm transition-colors"
              />
            </div>

            {/* Arbiter Address */}
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-400 mb-1.5 uppercase">
                Arbiter Address (Dispute Mediator)
              </label>
              <input
                type="text"
                value={arbiter}
                onChange={(e) => setArbiter(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1A1A22] border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono text-xs transition-colors"
              />
            </div>

            {/* Milestones Header */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  Milestone Deliverables Tranches
                </span>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} weight="bold" /> Add Milestone
                </button>
              </div>

              {milestones.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#1A1A22] border border-zinc-800 flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-purple-400">#{idx + 1}</span>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    placeholder="Milestone description"
                    required
                    className="flex-1 px-3 py-2 rounded-lg bg-[#121216] border border-zinc-700 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                  />
                  <div className="relative w-32">
                    <span className="absolute left-3 top-2.5 font-mono text-xs text-zinc-400">$</span>
                    <input
                      type="number"
                      value={m.amount}
                      onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                      placeholder="Amount"
                      required
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#121216] border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Capital Reserve */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-zinc-300">Total Capital Reserve:</span>
              <span className="text-xl font-extrabold text-amber-400">${totalAmount.toLocaleString()} USDC</span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="btn-purple-ghost px-5 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold-accent px-6 py-2.5 text-xs"
              >
                Deploy Escrow Contract ↗
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
