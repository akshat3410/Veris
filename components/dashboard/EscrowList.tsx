'use client';

import React from 'react';
import { EscrowDetails } from '@/lib/stellar/client';
import { formatStellarAmount, shortenAddress } from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';
import { useEscrowContract } from '@/hooks/useEscrowContract';
import { TxModal } from '@/components/common/TxModal';
import {
  User,
  ShieldCheck,
  UploadSimple,
  WarningOctagon,
  Scales,
  Prohibit,
  Stack,
  CheckCircle,
} from '@phosphor-icons/react';

interface EscrowListProps {
  escrows: EscrowDetails[];
}

export function EscrowList({ escrows }: EscrowListProps) {
  const { openModal } = useUIStore();
  const { txState, resetTx, approveMilestone, cancelEscrow } = useEscrowContract();

  if (!escrows || escrows.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#121216] border border-purple-500/20 space-y-4">
        <Stack size={44} weight="duotone" className="text-purple-400 mx-auto animate-pulse" />
        <h3 className="text-lg font-bold text-white">No Active Escrows Found</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Deploy a new milestone-based escrow to lock funds securely in Soroban smart contract custody.
        </p>
        <button
          onClick={() => openModal('create_escrow')}
          className="btn-gold-accent mt-2"
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
        {escrows.map((escrow, idx) => {
          const percentApproved =
            escrow.totalAmount > 0n
              ? Math.round(Number((escrow.releasedAmount * 100n) / escrow.totalAmount))
              : 0;

          return (
            <div
              key={`escrow-${escrow.id}-${idx}`}
              className="p-4 sm:p-7 rounded-2xl bg-[#121216] border border-purple-500/25 hover:border-purple-500/45 transition-all space-y-5"
            >
              {/* Card Title & Capital Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-800/80 pb-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    Escrow #{escrow.id}
                  </span>
                  <h3 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                    {escrow.title || `Milestone Engagement #${escrow.id}`}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {escrow.status}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-xs font-semibold text-zinc-400 font-mono uppercase">Locked:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
                    ${formatStellarAmount(escrow.totalAmount)}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 font-mono">USDC</span>
                </div>
              </div>

              {/* Single Inline Participant Bar (Minimalist) */}
              <div className="p-3 rounded-xl bg-[#1A1A22] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <User size={15} weight="duotone" className="text-purple-400 shrink-0" />
                  <span className="text-zinc-400">Client:</span>
                  <span className="text-white font-bold break-all">{shortenAddress(escrow.depositor)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User size={15} weight="duotone" className="text-amber-400 shrink-0" />
                  <span className="text-zinc-400">Contractor:</span>
                  <span className="text-white font-bold break-all">{shortenAddress(escrow.beneficiary)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} weight="duotone" className="text-purple-400 shrink-0" />
                  <span className="text-zinc-400">Arbiter:</span>
                  <span className="text-white font-bold break-all">{shortenAddress(escrow.arbiter)}</span>
                </div>
              </div>

              {/* Minimal Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap justify-between text-xs font-mono gap-1">
                  <span className="text-zinc-400">Milestone Progress</span>
                  <span className="text-purple-400 font-bold">
                    ${formatStellarAmount(escrow.releasedAmount)} / ${formatStellarAmount(escrow.totalAmount)} USDC ({percentApproved}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-[#1A1A22] overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${percentApproved}%` }}
                  />
                </div>
              </div>

              {/* Streamlined Milestone Deliverables */}
              <div className="space-y-2.5 pt-1">
                {escrow.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-xl bg-[#1A1A22] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/35 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-mono text-xs font-bold text-purple-300 shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="font-bold text-sm text-white">{m.title}</span>
                        <span className="text-xs font-mono text-zinc-400">
                          ${formatStellarAmount(m.amount)} USDC
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
                      <span className="text-[11px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {m.status}
                      </span>

                      {(m.status === 'Pending' || m.status === 'Submitted') && (
                        <button
                          onClick={() => openModal('submit_work', escrow.id, idx)}
                          className="px-2.5 sm:px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <UploadSimple size={13} weight="bold" /> Submit Proof
                        </button>
                      )}

                      {m.status !== 'Approved' && m.status !== 'Resolved' && (
                        <button
                          onClick={() => approveMilestone(escrow.id, idx)}
                          className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                        >
                          <CheckCircle size={13} weight="bold" /> Approve Payout
                        </button>
                      )}

                      {m.status !== 'Approved' && m.status !== 'Resolved' && m.status !== 'Disputed' && (
                        <button
                          onClick={() => openModal('dispute', escrow.id, idx)}
                          className="px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <WarningOctagon size={14} weight="bold" /> Dispute
                        </button>
                      )}

                      {m.status === 'Disputed' && (
                        <button
                          onClick={() => openModal('resolve_dispute', escrow.id, idx)}
                          className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <Scales size={14} weight="bold" /> Resolve Dispute
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Escrow Footer Cancel option */}
              {escrow.releasedAmount === 0n && escrow.status !== 'Cancelled' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => cancelEscrow(escrow.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Prohibit size={15} weight="bold" /> Cancel Escrow
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
