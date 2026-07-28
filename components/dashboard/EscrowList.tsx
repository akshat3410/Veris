'use client';

import React from 'react';
import { EscrowDetails } from '@/lib/stellar/client';
import { formatStellarAmount, shortenAddress, getStatusBadgeStyle, formatDate } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ShieldCheck,
  Scale,
  XCircle,
  ExternalLink,
  ChevronRight,
  User,
  Shield,
  Layers,
} from 'lucide-react';

interface EscrowListProps {
  escrows: EscrowDetails[];
}

export function EscrowList({ escrows }: EscrowListProps) {
  const { address } = useWallet();
  const { openModal } = useUIStore();
  const { txState, resetTx, approveMilestone, cancelEscrow } = useEscrowContract();

  if (!escrows || escrows.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl glass-container border border-dashed border-white/20 space-y-4">
        <Layers className="w-12 h-12 text-stellar-violet mx-auto animate-pulse" />
        <h3 className="text-lg font-semibold text-white">No Active Escrows Found</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Deploy a new milestone-based escrow to lock funds securely in Soroban smart contract custody.
        </p>
        <button
          onClick={() => openModal('create_escrow')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-stellar-violet to-purple-600 text-white font-bold text-sm shadow-glow-violet hover:scale-105 transition-all"
        >
          Create First Escrow
        </button>
      </div>
    );
  }

  return (
    <>
      <TxModal txState={txState} onClose={resetTx} />

      <div className="space-y-6">
        {escrows.map((escrow) => {
          const badgeStyle = getStatusBadgeStyle(escrow.status);
          const percentApproved =
            escrow.totalAmount > 0n
              ? Math.round(Number((escrow.releasedAmount * 100n) / escrow.totalAmount))
              : 0;

          const isDepositor = address && address.toLowerCase() === escrow.depositor.toLowerCase();
          const isBeneficiary = address && address.toLowerCase() === escrow.beneficiary.toLowerCase();
          const isArbiter = address && address.toLowerCase() === escrow.arbiter.toLowerCase();

          return (
            <div
              key={escrow.id}
              className="p-6 rounded-2xl glass-container glass-card-glow hover:border-stellar-violet/40 transition-all space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stellar-violet/20 text-stellar-violet border border-stellar-violet/30">
                      Escrow #{escrow.id}
                    </span>
                    <h3 className="font-bold text-lg text-white tracking-tight">{escrow.title}</h3>
                    <span
                      className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      {escrow.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Created on {formatDate(escrow.createdAt)} • Token: USDC (SAC)
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-400 font-mono">Total Locked Amount</div>
                  <div className="text-2xl font-extrabold font-mono text-stellar-cyan">
                    ${formatStellarAmount(escrow.totalAmount)}{' '}
                    <span className="text-xs text-gray-300">USDC</span>
                  </div>
                </div>
              </div>

              {/* Address Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-stellar-obsidian/70 border border-white/10 flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stellar-violet" /> Client (Depositor):
                  </span>
                  <span className="text-gray-200 font-bold">{shortenAddress(escrow.depositor)}</span>
                </div>

                <div className="p-3 rounded-xl bg-stellar-obsidian/70 border border-white/10 flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stellar-cyan" /> Contractor (Beneficiary):
                  </span>
                  <span className="text-gray-200 font-bold">{shortenAddress(escrow.beneficiary)}</span>
                </div>

                <div className="p-3 rounded-xl bg-stellar-obsidian/70 border border-white/10 flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-stellar-amber" /> Arbiter:
                  </span>
                  <span className="text-gray-200 font-bold">{shortenAddress(escrow.arbiter)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Milestone Release Progress</span>
                  <span className="text-stellar-cyan font-bold">
                    ${formatStellarAmount(escrow.releasedAmount)} / ${formatStellarAmount(escrow.totalAmount)} USDC ({percentApproved}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-stellar-obsidian overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-stellar-violet via-purple-500 to-stellar-cyan transition-all duration-500"
                    style={{ width: `${percentApproved}%` }}
                  />
                </div>
              </div>

              {/* Milestone Timeline List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                  Milestone Deliverables breakdown
                </h4>

                {escrow.milestones.map((m, idx) => {
                  const mBadge = getStatusBadgeStyle(m.status);

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stellar-obsidian/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-stellar-violet/20 border border-stellar-violet/40 flex items-center justify-center font-mono text-xs font-bold text-stellar-violet">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{m.title}</p>
                          <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mt-0.5">
                            <span>Amount: ${formatStellarAmount(m.amount)} USDC</span>
                            {m.proofCid && (
                              <span className="text-stellar-cyan flex items-center gap-1">
                                Proof: {m.proofCid.slice(0, 16)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons per milestone */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono px-3 py-1 rounded-full border ${mBadge.bg} ${mBadge.text} ${mBadge.border}`}
                        >
                          {m.status}
                        </span>

                        {/* Submit Work button (Beneficiary) */}
                        {(m.status === 'Pending' || m.status === 'Submitted') && (
                          <button
                            onClick={() => openModal('submit_work', escrow.id, idx)}
                            className="px-3 py-1.5 rounded-lg bg-stellar-cyan/20 border border-stellar-cyan/40 hover:bg-stellar-cyan/30 text-stellar-cyan text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" /> Submit Proof
                          </button>
                        )}

                        {/* Approve Milestone button (Depositor or Arbiter) */}
                        {m.status !== 'Approved' && m.status !== 'Resolved' && (
                          <button
                            onClick={() => approveMilestone(escrow.id, idx)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" /> Approve Payout
                          </button>
                        )}

                        {/* Dispute button */}
                        {m.status !== 'Approved' && m.status !== 'Resolved' && m.status !== 'Disputed' && (
                          <button
                            onClick={() => openModal('dispute', escrow.id, idx)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Dispute
                          </button>
                        )}

                        {/* Arbiter Resolve button */}
                        {m.status === 'Disputed' && (
                          <button
                            onClick={() => openModal('resolve_dispute', escrow.id, idx)}
                            className="px-3 py-1.5 rounded-lg bg-stellar-amber/20 border border-stellar-amber/40 hover:bg-stellar-amber/30 text-stellar-amber text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Scale className="w-3.5 h-3.5" /> Resolve Dispute
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Escrow Footer Actions */}
              {escrow.releasedAmount === 0n && escrow.status !== 'Cancelled' && (
                <div className="flex justify-end pt-2 border-t border-white/10">
                  <button
                    onClick={() => cancelEscrow(escrow.id)}
                    className="px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-800/40 hover:border-rose-500 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Escrow & Refund Depositor
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
