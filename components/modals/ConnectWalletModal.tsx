'use client';

import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export function ConnectWalletModal() {
  const { activeModal, closeModal } = useUIStore();
  const { connect, isConnecting } = useWallet();

  if (activeModal !== 'connect_wallet') return null;

  const handleConnect = async () => {
    await connect();
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-stellar-surface border border-stellar-violet/40 shadow-glow-violet space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stellar-violet/20 text-stellar-cyan">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Connect Stellar Wallet</h3>
              <p className="text-xs text-gray-400 font-mono">Select supported wallet adapter</p>
            </div>
          </div>
          <button onClick={closeModal} className="text-gray-400 hover:text-white font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full p-4 rounded-xl bg-stellar-card border border-stellar-violet/30 hover:border-stellar-cyan flex items-center justify-between transition-all group hover:shadow-glow-cyan"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">Freighter Wallet</p>
                <p className="text-xs text-gray-400">Official Browser Extension</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-stellar-cyan group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full p-4 rounded-xl bg-stellar-card border border-white/10 hover:border-stellar-violet flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">StellarWalletsKit</p>
                <p className="text-xs text-gray-400">LOBSTR, xBull, Hana, Rabet, Albedo</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
