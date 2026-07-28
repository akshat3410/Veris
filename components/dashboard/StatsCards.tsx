'use client';

import React from 'react';
import { EscrowDetails } from '@/lib/stellar/client';
import { formatStellarAmount } from '@/lib/utils';
import { Lock, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface StatsCardsProps {
  escrows: EscrowDetails[];
}

export function StatsCards({ escrows }: StatsCardsProps) {
  const totalValueLocked = escrows.reduce((sum, e) => sum + e.totalAmount, 0n);
  const activeCount = escrows.filter((e) => e.status === 'Funded' || e.status === 'InDevelopment').length;
  const completedCount = escrows.filter((e) => e.status === 'Completed').length;
  const disputedCount = escrows.filter((e) => e.status === 'Disputed').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value Locked Card */}
      <div className="p-5 rounded-2xl glass-container glass-card-glow hover:border-stellar-violet/60 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">Total Value Locked</span>
          <div className="p-2 rounded-xl bg-stellar-violet/20 text-stellar-violet group-hover:scale-110 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold font-mono text-white">
            ${formatStellarAmount(totalValueLocked)}
          </span>
          <span className="text-xs text-gray-400 font-mono ml-2">USDC SAC</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Smart Contract Lock Reserve</p>
      </div>

      {/* Active Escrows Card */}
      <div className="p-5 rounded-2xl glass-container glass-card-glow hover:border-stellar-cyan/60 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">Active Engagements</span>
          <div className="p-2 rounded-xl bg-stellar-cyan/20 text-stellar-cyan group-hover:scale-110 transition-transform">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold font-mono text-white">{activeCount}</span>
          <span className="text-xs text-stellar-cyan font-mono ml-2">In Progress</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">Automated Milestone Payouts</p>
      </div>

      {/* Completed Payouts Card */}
      <div className="p-5 rounded-2xl glass-container glass-card-glow hover:border-emerald-500/60 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">Completed Settled</span>
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold font-mono text-white">{completedCount}</span>
          <span className="text-xs text-emerald-400 font-mono ml-2">Finalized</span>
        </div>
        <p className="text-[11px] text-gray-500 mt-1">100% On-Chain Verifiable</p>
      </div>

      {/* Soroban Rent Health / Disputes Card */}
      <div className="p-5 rounded-2xl glass-container glass-card-glow hover:border-stellar-amber/60 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">Rent & Disputes</span>
          <div className="p-2 rounded-xl bg-stellar-amber/20 text-stellar-amber group-hover:scale-110 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold font-mono text-white">{disputedCount}</span>
          <span className="text-xs text-stellar-amber font-mono ml-2">Disputed</span>
        </div>
        <p className="text-[11px] text-emerald-400 font-mono mt-1">TTL Health: 518,400 Ledgers (~30 days)</p>
      </div>
    </div>
  );
}
