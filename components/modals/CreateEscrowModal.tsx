'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import { Plus, Trash2, Shield, DollarSign, Layers } from 'lucide-react';

export function CreateEscrowModal() {
  const { activeModal, closeModal } = useUIStore();
  const { txState, resetTx, createEscrow } = useEscrowContract();

  const [title, setTitle] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [arbiter, setArbiter] = useState('GCA374JHS829374KSJH829374KSJH829374KSJH829374KSJH829374K');
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
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-stellar-surface border border-stellar-violet/40 shadow-glow-violet space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stellar-violet/20 text-stellar-violet border border-stellar-violet/30">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-white">Deploy Milestone Escrow</h3>
                <p className="text-xs text-gray-400 font-mono">Soroban Trustless Smart Contract Custody</p>
              </div>
            </div>
            <button onClick={closeModal} className="text-gray-400 hover:text-white font-bold">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-300 mb-1.5">Escrow Engagement Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Soroban Smart Contract Audit & Optimization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stellar-obsidian border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-violet font-sans text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">Contractor / Beneficiary Address</label>
                <input
                  type="text"
                  required
                  placeholder="G..."
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stellar-obsidian border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-cyan font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-300 mb-1.5">Dispute Arbiter Address</label>
                <input
                  type="text"
                  required
                  placeholder="G..."
                  value={arbiter}
                  onChange={(e) => setArbiter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stellar-obsidian border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-stellar-violet font-mono text-xs"
                />
              </div>
            </div>

            {/* Milestones Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stellar-cyan" />
                  Milestone Deliverables & Allocation
                </span>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stellar-cyan hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>
              </div>

              {milestones.map((m, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-stellar-obsidian/70 border border-white/10 flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-stellar-violet">#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="Deliverable Title"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-stellar-surface border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-stellar-violet"
                  />
                  <div className="relative w-32">
                    <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="USDC"
                      value={m.amount}
                      onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-stellar-surface border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-stellar-cyan"
                    />
                  </div>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="text-gray-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Summary Banner */}
            <div className="p-4 rounded-xl bg-stellar-violet/10 border border-stellar-violet/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-300">Total Escrow Lock Amount</p>
                <p className="text-xs text-gray-400 font-mono">SAC Token USDC Lock</p>
              </div>
              <p className="text-2xl font-extrabold font-mono text-stellar-cyan">
                ${totalAmount.toLocaleString()} <span className="text-sm font-normal text-gray-300">USDC</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-stellar-violet to-purple-600 hover:from-purple-600 hover:to-stellar-violet text-white font-bold text-sm shadow-glow-violet transition-all transform active:scale-98"
            >
              Lock USDC & Deploy Escrow
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
