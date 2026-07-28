'use client';

import React from 'react';
import { EscrowDetails } from '@/lib/stellar/client';
import { formatStellarAmount } from '@/lib/utils';
import { LockKey, Cpu, CheckCircle, ShieldWarning } from '@phosphor-icons/react';

interface StatsCardsProps {
  escrows: EscrowDetails[];
}

export function StatsCards({ escrows }: StatsCardsProps) {
  const totalValueLocked = escrows.reduce((sum, e) => sum + e.totalAmount, 0n);
  const activeCount = escrows.filter((e) => e.status === 'Funded' || e.status === 'InDevelopment').length;
  const completedCount = escrows.filter((e) => e.status === 'Completed').length;
  const disputedCount = escrows.filter((e) => e.status === 'Disputed').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Value Locked */}
      <div className="card-flat-minimal group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">Total Value Locked</span>
          <div className="icon-box p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <LockKey size={18} weight="duotone" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
            ${formatStellarAmount(totalValueLocked)}
          </span>
          <span className="text-xs font-semibold text-zinc-400 ml-2 font-mono">USDC</span>
        </div>
      </div>

      {/* Active Engagements */}
      <div className="card-flat-minimal group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">Active Engagements</span>
          <div className="icon-box p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Cpu size={18} weight="duotone" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{activeCount}</span>
          <span className="text-xs font-bold text-purple-400 font-mono px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
            In Progress
          </span>
        </div>
      </div>

      {/* Completed Settled */}
      <div className="card-flat-minimal group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">Completed Settled</span>
          <div className="icon-box p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle size={18} weight="duotone" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{completedCount}</span>
          <span className="text-xs font-bold text-emerald-400 font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            Finalized
          </span>
        </div>
      </div>

      {/* Rent & Disputes */}
      <div className="card-flat-minimal group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">Disputes</span>
          <div className="icon-box p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <ShieldWarning size={18} weight="duotone" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white tracking-tight font-mono">{disputedCount}</span>
          <span className="text-xs font-bold text-amber-400 font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
            Zero Active
          </span>
        </div>
      </div>
    </div>
  );
}
