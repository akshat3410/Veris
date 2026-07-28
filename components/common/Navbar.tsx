'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useUIStore } from '@/stores/useUIStore';
import { shortenAddress } from '@/lib/utils';
import { Wallet, Sun, Moon, Shield, Sparkles, Activity } from 'lucide-react';

export function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const { theme, toggleTheme, openModal } = useUIStore();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-stellar-obsidian/70 border-b border-stellar-violet/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-stellar-violet to-stellar-cyan p-0.5 shadow-glow-violet">
            <div className="w-full h-full bg-stellar-obsidian rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-stellar-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-stellar-cyan">
                ESCROWVAULT
              </span>
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-stellar-violet/20 text-stellar-violet border border-stellar-violet/30">
                SOROBAN
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">Milestone Execution Engine</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#dashboard" className="hover:text-stellar-cyan transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-stellar-violet" />
            Dashboard
          </a>
          <a href="#escrows" className="hover:text-stellar-cyan transition-colors">
            Active Escrows
          </a>
          <a href="#telemetry" className="hover:text-stellar-cyan transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-stellar-cyan" />
            Contract Telemetry
          </a>
        </nav>

        {/* Right Actions & Wallet */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-stellar-card border border-white/10 hover:border-stellar-violet/50 text-gray-300 hover:text-white transition-all"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-stellar-amber" /> : <Moon className="w-4 h-4 text-stellar-violet" />}
          </button>

          {/* Network Indicator Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Stellar Testnet
          </div>

          {/* Wallet Action Button */}
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <button
                onClick={disconnect}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stellar-card border border-stellar-violet/40 hover:border-stellar-rose/50 text-sm font-mono text-gray-200 hover:text-stellar-rose transition-all shadow-glass-card"
              >
                <div className="w-2 h-2 rounded-full bg-stellar-cyan" />
                {shortenAddress(address)}
              </button>
            </div>
          ) : (
            <button
              onClick={() => openModal('connect_wallet')}
              disabled={isConnecting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-stellar-violet to-purple-600 hover:from-purple-600 hover:to-stellar-violet text-white font-semibold text-sm shadow-glow-violet transition-all transform active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
