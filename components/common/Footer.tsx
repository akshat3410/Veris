'use client';

import React from 'react';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { shortenAddress } from '@/lib/utils';
import { Shield, ExternalLink, Github, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-stellar-obsidian/80 backdrop-blur-xl py-8 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stellar-violet/20 border border-stellar-violet/40 flex items-center justify-center">
            <Shield className="w-4 h-4 text-stellar-cyan" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Stellar EscrowVault</p>
            <p className="text-xs text-gray-400 font-mono">Powered by Soroban Smart Contracts on Stellar</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-400">
          <span>Contract ID:</span>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${SOROBAN_CONFIG.contractId}`}
            target="_blank"
            rel="noreferrer"
            className="text-stellar-cyan hover:underline flex items-center gap-1 font-bold"
          >
            {shortenAddress(SOROBAN_CONFIG.contractId, 8)} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <a
            href="https://developers.stellar.org"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stellar-cyan flex items-center gap-1 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" /> Stellar Docs
          </a>
          <a
            href="https://github.com/stellar"
            target="_blank"
            rel="noreferrer"
            className="hover:text-stellar-cyan flex items-center gap-1 transition-colors"
          >
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
