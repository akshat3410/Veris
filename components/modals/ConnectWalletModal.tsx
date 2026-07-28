'use client';

import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useWallet } from '@/hooks/useWallet';
import { ShieldCheck, Cpu, ArrowRight, X, Wallet } from '@phosphor-icons/react';

export function ConnectWalletModal() {
  const { activeModal, closeModal } = useUIStore();
  const { connect, isConnecting } = useWallet();

  if (activeModal !== 'connect_wallet') return null;

  const handleConnect = async () => {
    try {
      await connect();
      closeModal();
    } catch {
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md p-7 rounded-2xl bg-[#121216] border border-purple-500/30 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Wallet size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-bitcoa">Connect Stellar Wallet</h3>
              <p className="text-xs text-zinc-400 font-mono">Select supported wallet adapter</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Freighter Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full p-4 rounded-xl bg-[#1A1A22] border border-purple-500/30 hover:border-purple-500 flex items-center justify-between transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/30">
                <ShieldCheck size={22} weight="duotone" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">Freighter Wallet</p>
                <p className="text-xs text-zinc-400 font-mono">Official Browser Extension</p>
              </div>
            </div>
            {isConnecting ? (
              <span className="text-xs font-mono font-bold text-amber-400 animate-pulse">Connecting...</span>
            ) : (
              <ArrowRight size={18} weight="bold" className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            )}
          </button>

          {/* StellarWalletsKit Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full p-4 rounded-xl bg-[#1A1A22] border border-zinc-800 hover:border-purple-500/50 flex items-center justify-between transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform border border-purple-500/20">
                <Cpu size={22} weight="duotone" />
              </div>
              <div className="text-left">
                <p className="font-bold text-white text-sm">StellarWalletsKit</p>
                <p className="text-xs text-zinc-400 font-mono">LOBSTR, xBull, Hana, Rabet, Albedo</p>
              </div>
            </div>
            {isConnecting ? (
              <span className="text-xs font-mono font-bold text-amber-400 animate-pulse">Connecting...</span>
            ) : (
              <ArrowRight size={18} weight="bold" className="text-zinc-400 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
