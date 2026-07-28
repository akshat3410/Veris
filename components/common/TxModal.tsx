'use client';

import React from 'react';
import { TxState } from '@/hooks/useEscrowContract';
import { Loader2, CheckCircle2, XCircle, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-stellar-surface border border-stellar-violet/40 shadow-glow-violet space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-stellar-violet/20 border border-stellar-violet/40">
              <Cpu className="w-5 h-5 text-stellar-cyan" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Soroban RPC Transaction Pipeline</h3>
              <p className="text-xs text-gray-400 font-mono">Ledger Simulation & Authorization</p>
            </div>
          </div>
          {txState.stage === 'confirmed' || txState.stage === 'failed' ? (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm font-semibold px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              Close
            </button>
          ) : null}
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className={`p-2 rounded-lg border ${stepNumber >= 1 ? 'border-stellar-violet bg-stellar-violet/20 text-white' : 'border-white/10 text-gray-500'}`}>
            1. Simulate
          </div>
          <div className={`p-2 rounded-lg border ${stepNumber >= 2 ? 'border-stellar-violet bg-stellar-violet/20 text-white' : 'border-white/10 text-gray-500'}`}>
            2. Sign XDR
          </div>
          <div className={`p-2 rounded-lg border ${stepNumber >= 3 ? 'border-stellar-violet bg-stellar-violet/20 text-white' : 'border-white/10 text-gray-500'}`}>
            3. Submit
          </div>
          <div className={`p-2 rounded-lg border ${stepNumber >= 4 ? 'border-stellar-cyan bg-stellar-cyan/20 text-white' : 'border-white/10 text-gray-500'}`}>
            4. Confirm
          </div>
        </div>

        {/* Status Body */}
        <div className="p-6 rounded-xl bg-stellar-obsidian/80 border border-white/10 flex flex-col items-center justify-center text-center space-y-4">
          {txState.stage === 'simulating' && (
            <>
              <Loader2 className="w-10 h-10 text-stellar-violet animate-spin" />
              <p className="text-sm font-medium text-gray-200">Simulating Footprint & Min Fee on Soroban RPC...</p>
            </>
          )}

          {txState.stage === 'signing' && (
            <>
              <ShieldCheck className="w-10 h-10 text-stellar-cyan animate-pulse" />
              <p className="text-sm font-medium text-gray-200">Awaiting Wallet Signature (Freighter / WalletKit)...</p>
              <p className="text-xs text-gray-400">Please approve the transaction XDR prompt in your wallet.</p>
            </>
          )}

          {txState.stage === 'submitting' || txState.stage === 'pending' ? (
            <>
              <Loader2 className="w-10 h-10 text-stellar-cyan animate-spin" />
              <p className="text-sm font-medium text-gray-200">Submitting Transaction to Stellar Testnet Ledger...</p>
              {txState.txHash && (
                <p className="text-xs font-mono text-stellar-cyan break-all">Hash: {txState.txHash}</p>
              )}
            </>
          ) : null}

          {txState.stage === 'confirmed' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <p className="text-base font-semibold text-emerald-400">Transaction Executed Successfully!</p>
              {txState.txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txState.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stellar-cyan hover:underline font-mono"
                >
                  View on Stellar Expert Explorer <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </>
          )}

          {txState.stage === 'failed' && (
            <>
              <XCircle className="w-12 h-12 text-rose-500" />
              <p className="text-base font-semibold text-rose-400">Transaction Failed</p>
              <p className="text-xs text-rose-300/80 max-h-24 overflow-y-auto font-mono text-left w-full p-3 rounded bg-rose-950/30 border border-rose-900/50">
                {txState.error || 'Unknown error during Soroban transaction submission'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
