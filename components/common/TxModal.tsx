'use client';

import React from 'react';
import { TxState } from '@/hooks/useEscrowContract';
import { Cpu, ShieldCheck, CheckCircle, XCircle, ArrowUpRight, Spinner } from '@phosphor-icons/react';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';

interface TxModalProps {
  txState: TxState;
  onClose: () => void;
}

export function TxModal({ txState, onClose }: TxModalProps) {
  if (txState.stage === 'idle') return null;

  const getStageStepNumber = () => {
    switch (txState.stage) {
      case 'simulating': return 1;
      case 'signing': return 2;
      case 'submitting': return 3;
      case 'pending': return 4;
      case 'confirmed': return 5;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const stepNumber = getStageStepNumber();

  const handleNavigateToDashboard = () => {
    onClose();
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg p-7 rounded-2xl bg-[#121216] border border-purple-500/30 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <Cpu size={20} weight="duotone" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-bitcoa">Soroban Execution Pipeline</h3>
              <p className="text-xs text-zinc-400 font-mono">Stellar Testnet Smart Contract Authorization</p>
            </div>
          </div>
          {txState.stage === 'confirmed' || txState.stage === 'failed' ? (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Close
            </button>
          ) : null}
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className={`p-2 rounded-lg border ${stepNumber >= 1 ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 font-bold' : 'border-zinc-800 text-zinc-600'}`}>
            1. Simulate
          </div>
          <div className={`p-2 rounded-lg border ${stepNumber >= 2 ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 font-bold' : 'border-zinc-800 text-zinc-600'}`}>
            2. Sign XDR
          </div>
          <div className={`p-2 rounded-lg border ${stepNumber >= 3 ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 font-bold' : 'border-zinc-800 text-zinc-600'}`}>
            3. Submit
          </div>
          <div className={`p-2 rounded-lg border ${stepNumber >= 4 ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold' : 'border-zinc-800 text-zinc-600'}`}>
            4. Confirm
          </div>
        </div>

        {/* Status Body */}
        <div className="p-6 rounded-xl bg-[#1A1A22] border border-zinc-800 flex flex-col items-center justify-center text-center space-y-4">
          {txState.stage === 'simulating' && (
            <>
              <Spinner size={36} className="text-purple-400 animate-spin" />
              <p className="text-sm font-medium text-zinc-200">Simulating Footprint & Min Fee on Soroban RPC...</p>
            </>
          )}

          {txState.stage === 'signing' && (
            <>
              <ShieldCheck size={40} weight="duotone" className="text-purple-400 animate-pulse" />
              <p className="text-sm font-medium text-zinc-200">Awaiting Wallet Signature (Freighter / WalletKit)...</p>
              <p className="text-xs text-zinc-400">Please approve the transaction XDR prompt in your wallet.</p>
            </>
          )}

          {(txState.stage === 'submitting' || txState.stage === 'pending') && (
            <>
              <Spinner size={36} className="text-purple-400 animate-spin" />
              <p className="text-sm font-medium text-zinc-200">Submitting Transaction to Stellar Testnet Ledger...</p>
              {txState.txHash && (
                <p className="text-xs font-mono text-purple-300 break-all bg-zinc-900 p-2 rounded-lg border border-zinc-800 w-full">
                  Hash: {txState.txHash}
                </p>
              )}
            </>
          )}

          {txState.stage === 'confirmed' && (
            <>
              <CheckCircle size={48} weight="duotone" className="text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />
              <div>
                <p className="text-lg font-bold text-emerald-400 font-bitcoa">Escrow Contract Deployed!</p>
                <p className="text-xs text-zinc-300 mt-1">Smart contract engagement successfully published to Stellar ledger.</p>
              </div>

              {txState.txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txState.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-amber-400 hover:underline font-mono"
                >
                  View on Stellar Expert Explorer <ArrowUpRight size={14} weight="bold" />
                </a>
              )}

              <button
                onClick={handleNavigateToDashboard}
                className="btn-gold-accent w-full mt-2 py-2.5 text-xs justify-center"
              >
                View Active Contracts ↓
              </button>
            </>
          )}

          {txState.stage === 'failed' && (
            <>
              <XCircle size={44} weight="duotone" className="text-rose-500" />
              <p className="text-base font-bold text-rose-400">Transaction Failed</p>
              <p className="text-xs text-rose-300 max-h-24 overflow-y-auto font-mono text-left w-full p-3 rounded-xl bg-rose-950/40 border border-rose-900/50">
                {txState.error || 'Unknown error during Soroban transaction submission'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
