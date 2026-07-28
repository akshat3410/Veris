'use client';

import React from 'react';
import { useEscrows } from '@/hooks/useEscrows';
import { useUIStore } from '@/stores/useUIStore';
import { useWallet } from '@/hooks/useWallet';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { EscrowList } from '@/components/dashboard/EscrowList';
import { EventsFeed } from '@/components/dashboard/EventsFeed';
import { Shield, Sparkles, ArrowRight, Layers, Lock, Cpu, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { data: escrows = [], isLoading } = useEscrows();
  const { openModal } = useUIStore();
  const { isConnected } = useWallet();

  return (
    <div className="space-y-12">
      {/* Hero Header (Inspired by Attached Inspiration Mockup) */}
      <section className="relative pt-6 pb-12 flex flex-col items-start justify-between gap-8 border-b border-white/10">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stellar-violet/10 border border-stellar-violet/30 text-stellar-violet text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-stellar-cyan animate-pulse" />
            Next-Gen Soroban Smart Contract Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Decentralized.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-stellar-violet via-purple-400 to-stellar-cyan">
              Scalable.
            </span>{' '}
            Liquid.
          </h1>

          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Stellar EscrowVault enables trustless, milestone-based USDC custody and automated payout execution backed by Soroban WASM smart contracts on Stellar.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => openModal(isConnected ? 'create_escrow' : 'connect_wallet')}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-stellar-violet to-purple-600 hover:from-purple-600 hover:to-stellar-violet text-white font-bold text-sm shadow-glow-violet hover:scale-105 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Deploy Escrow <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#escrows"
              className="px-6 py-3.5 rounded-xl bg-stellar-card border border-white/10 hover:border-stellar-cyan text-gray-200 hover:text-white font-semibold text-sm transition-all"
            >
              View Active Contracts
            </a>
          </div>
        </div>

        {/* Feature Pills (Image 1 aesthetic adaptation) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-5 rounded-2xl glass-container border border-white/10 hover:border-stellar-violet/40 transition-all space-y-2">
            <div className="w-8 h-8 rounded-lg bg-stellar-violet/20 text-stellar-violet flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Trustless Lock</h4>
            <p className="text-xs text-gray-400">
              USDC locked in immutable Soroban contract state with zero platform custody risk.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-container border border-white/10 hover:border-stellar-cyan/40 transition-all space-y-2">
            <div className="w-8 h-8 rounded-lg bg-stellar-cyan/20 text-stellar-cyan flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Milestone Automation</h4>
            <p className="text-xs text-gray-400">
              Deliverables verified on-chain with IPFS proof submission and single-click client payout.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-container border border-white/10 hover:border-emerald-500/40 transition-all space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Arbiter Disputes</h4>
            <p className="text-xs text-gray-400">
              Multi-party arbitration protocol with dynamic payout splitting on-chain.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Telemetry Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-stellar-violet" /> Network Telemetry & Reserves
          </h2>
          <span className="text-xs font-mono text-gray-400">Soroban Testnet RPC Sync</span>
        </div>
        <StatsCards escrows={escrows} />
      </section>

      {/* Main Escrows Section */}
      <section id="escrows" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Escrow Engagements</h2>
            <p className="text-xs text-gray-400 font-mono">Live smart contract state & milestone execution</p>
          </div>
          <button
            onClick={() => openModal(isConnected ? 'create_escrow' : 'connect_wallet')}
            className="px-4 py-2 rounded-xl bg-stellar-violet/20 border border-stellar-violet/40 hover:bg-stellar-violet/30 text-stellar-violet text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            + New Escrow
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center rounded-2xl glass-container text-gray-400 text-sm font-mono">
            Synchronizing Soroban contract state...
          </div>
        ) : (
          <EscrowList escrows={escrows} />
        )}
      </section>

      {/* Live Event Telemetry Stream */}
      <section id="telemetry" className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Real-Time Event Ingestion</h2>
        <EventsFeed />
      </section>
    </div>
  );
}
