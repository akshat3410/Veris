'use client';

import React, { useEffect, useState } from 'react';
import { useEscrows } from '@/hooks/useEscrows';
import { useUIStore } from '@/stores/useUIStore';
import { useWallet } from '@/hooks/useWallet';
import NeuralBackground from '@/components/ui/flow-field-background';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { EscrowList } from '@/components/dashboard/EscrowList';
import { EventsFeed } from '@/components/dashboard/EventsFeed';
import { LockKey, Lightning, Sparkle, ArrowUpRight, ShieldCheck, CheckCircle, Cpu } from '@phosphor-icons/react';

function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = document.querySelectorAll('.reveal, .reveal-text');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { data: escrows = [], isLoading } = useEscrows();
  const { openModal } = useUIStore();
  const { isConnected } = useWallet();
  
  useScrollReveal();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────
          1. HERO SECTION WITH NEURAL FLOW FIELD BACKGROUND
      ───────────────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex items-center justify-center pt-36 pb-24 text-center overflow-hidden"
      >
        {/* Flow Field Canvas Background */}
        <div className="absolute inset-0 z-0">
          <NeuralBackground
            color="#A855F7"
            trailOpacity={0.12}
            particleCount={650}
            speed={0.85}
          />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col items-center">
          <div className="reveal-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-8 backdrop-blur-md">
            <Sparkle size={15} weight="fill" className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Soroban Smart Contract Engine v2.0</span>
          </div>

          <h1 className="font-display reveal-text delay-100 text-5xl sm:text-7xl lg:text-8xl mb-6 text-white tracking-tight leading-[1.05]">
            Escrow, <br />
            <span className="text-purple-400">
              designed for trust.
            </span>
          </h1>

          <p className="reveal-text delay-200 text-lg sm:text-xl text-zinc-300 max-w-xl mb-10 leading-relaxed font-normal font-body">
            Non-custodial milestone settlement powered by smart contracts. Capital releases only when work is proven.
          </p>

          <div className="reveal-text delay-300 flex flex-wrap items-center justify-center gap-4">
            <button
              className="btn-gold-accent"
              onClick={() => openModal(isConnected ? 'create_escrow' : 'connect_wallet')}
            >
              Create Escrow
              <ArrowUpRight size={18} weight="bold" className="arrow" />
            </button>
            <a href="#how" className="btn-purple-ghost" style={{ textDecoration: 'none' }}>
              How it works ↓
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          2. HOW IT WORKS
      ───────────────────────────────────────────────────────────────────── */}
      <section id="how" className="relative z-10 py-28 border-t border-zinc-800/80 bg-[#09090B] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <span className="reveal-text text-xs font-bold font-mono tracking-widest uppercase text-purple-400 block mb-2">
              Protocol Workflow
            </span>
            <h2 className="font-display reveal-text delay-100 text-4xl sm:text-5xl text-white">
              How it works.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Lock Funds',
                desc: 'Depositor locks USDC or XLM into immutable Soroban smart contract custody. Capital is safe & untouchable.',
                icon: LockKey,
                delay: 'delay-100',
              },
              {
                step: '02',
                title: 'Prove Work',
                desc: 'Beneficiary submits cryptographic IPFS proof of completed milestone deliverables on Stellar ledger.',
                icon: Lightning,
                delay: 'delay-200',
              },
              {
                step: '03',
                title: 'Settle Instantly',
                desc: 'Atomic payout releases in ~3.2 seconds upon depositor approval. Sequential tranches prevent overpay.',
                icon: CheckCircle,
                delay: 'delay-300',
              },
            ].map((card) => {
              const IconComp = card.icon;
              return (
                <div key={card.step} className={`card-flat-minimal reveal-text ${card.delay}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="icon-box p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      <IconComp size={24} weight="duotone" />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      STEP {card.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-body">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          3. ARCHITECTURE & TRUST PILLARS
      ───────────────────────────────────────────────────────────────────── */}
      <section
        id="architecture"
        className="relative z-10 py-28 bg-[#121216] border-t border-b border-zinc-800/80 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <span className="reveal-text text-xs font-bold font-mono tracking-widest uppercase text-purple-400 block mb-3">
                Architectural Integrity
              </span>
              <h2 className="font-display reveal-text delay-100 text-4xl sm:text-5xl text-white mb-6">
                Capital locked in code.
              </h2>
              <p className="reveal-text delay-200 text-base text-zinc-300 leading-relaxed font-body">
                Deposits move directly into WASM smart contract state on Stellar. Neither platform operators nor third parties hold keys to your funds.
              </p>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-4">
              {[
                { title: 'Atomic Finality', desc: 'Settlement completes in ~3.2 seconds on Stellar SCP consensus.', icon: Cpu, delay: 'delay-100' },
                { title: 'Cryptographic Proof', desc: 'Deliverables verified via immutable IPFS content addressing hashes.', icon: ShieldCheck, delay: 'delay-200' },
                { title: 'SAC Native Support', desc: 'Seamless custody for canonical USDC and XLM token standards.', icon: Sparkle, delay: 'delay-300' },
              ].map((pillar, idx) => {
                const IconComp = pillar.icon;
                return (
                  <div key={idx} className={`card-flat-minimal py-5 px-6 flex items-start gap-4 reveal-text ${pillar.delay}`}>
                    <div className="icon-box p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
                      <IconComp size={20} weight="duotone" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">{pillar.title}</h4>
                      <p className="text-sm text-zinc-400 font-body">{pillar.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          4. ESCROW ENGINE DASHBOARD
      ───────────────────────────────────────────────────────────────────── */}
      <section
        id="dashboard"
        className="relative z-10 pt-44 pb-28 bg-[#09090B] scroll-mt-36"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-between items-end mb-10 gap-4">
            <div>
              <span className="reveal-text text-xs font-bold font-mono tracking-widest uppercase text-purple-400 block mb-2">
                Live Escrow Engine
              </span>
              <h2 className="font-display reveal-text delay-100 text-4xl sm:text-5xl text-white m-0">
                Active Contracts.
              </h2>
            </div>
            <button
              className="btn-gold-accent reveal-text delay-200"
              onClick={() => openModal(isConnected ? 'create_escrow' : 'connect_wallet')}
            >
              + New Escrow
            </button>
          </div>

          {/* Stats Overview */}
          <div className="reveal-text delay-100 mb-8">
            <StatsCards escrows={escrows} />
          </div>

          {/* Active Escrow List */}
          <div className="reveal-text delay-200">
            {isLoading ? (
              <div className="py-20 text-center text-xs font-mono text-zinc-400 uppercase tracking-widest">
                Synchronizing with Stellar Testnet…
              </div>
            ) : (
              <EscrowList escrows={escrows} />
            )}
          </div>

          {/* Live Event Stream */}
          <div className="reveal-text delay-300 mt-12">
            <EventsFeed />
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────
          5. FINAL CTA
      ───────────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 bg-[#121216] text-center border-t border-zinc-800">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display reveal-text text-4xl sm:text-6xl text-white mb-5">
            Trust earned. Capital released.
          </h2>
          <p className="reveal-text delay-100 text-lg text-zinc-300 mb-9 font-body">
            Deploy your first non-custodial milestone escrow on Stellar Soroban in seconds.
          </p>
          <button
            className="btn-gold-accent reveal-text delay-200 text-base py-4 px-10"
            onClick={() => openModal(isConnected ? 'create_escrow' : 'connect_wallet')}
          >
            Deploy Escrow
            <ArrowUpRight size={20} weight="bold" className="arrow" />
          </button>
        </div>
      </section>
    </>
  );
}
