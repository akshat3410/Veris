'use client';

import React from 'react';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { shortenAddress } from '@/lib/utils';
import { LockKey, ArrowUpRight } from '@phosphor-icons/react';

export function Footer() {
  return (
    <footer className="relative z-10 bg-[#09090B] py-10 border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center">
            <LockKey size={16} weight="bold" className="text-[#09090B]" />
          </div>
          <span className="font-display font-bold text-base text-white">
            Veris
          </span>
          <span className="text-xs text-zinc-400 font-body">
            © 2026 Veris Settlement Protocol. All rights reserved.
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${SOROBAN_CONFIG.contractId}`}
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 no-underline font-semibold"
          >
            Contract: {shortenAddress(SOROBAN_CONFIG.contractId, 6)}
            <ArrowUpRight size={12} weight="bold" />
          </a>
          <a
            href="https://developers.stellar.org"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition-colors no-underline"
          >
            Stellar Docs
          </a>
          <a
            href="https://github.com/akshat3410/Veris"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-white transition-colors no-underline"
          >
            GitHub Repo
          </a>
        </div>
      </div>
    </footer>
  );
}
