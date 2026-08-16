'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useUIStore } from '@/stores/useUIStore';
import { shortenAddress } from '@/lib/utils';
import { LockKey, PlugsConnected, Lightning, List, X } from '@phosphor-icons/react';

export function Navbar() {
  const { address, isConnected, isConnecting, disconnect } = useWallet();
  const { openModal } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#hero', label: 'Overview' },
    { href: '#how', label: 'How it works' },
    { href: '#architecture', label: 'Architecture' },
    { href: '#dashboard', label: 'Escrow Engine' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090B]/90 backdrop-blur-md border-b border-purple-500/20 py-3.5'
          : 'bg-[#09090B]/40 backdrop-blur-sm border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline shrink-0">
          <div className="w-8 h-8 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <LockKey size={18} weight="bold" className="text-[#09090B]" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-white">
            Veris
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-zinc-300 hover:text-amber-400 transition-colors no-underline font-body"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Network Status + Wallet Button + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Testnet Badge (desktop only) */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Testnet
          </div>

          {/* Connect / Connected Button */}
          {isConnected && address ? (
            <button
              onClick={disconnect}
              className="text-xs sm:text-sm font-semibold font-mono text-zinc-200 border border-purple-500/40 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-all flex items-center gap-1.5"
            >
              <PlugsConnected size={15} weight="bold" className="text-purple-400" />
              {shortenAddress(address)}
            </button>
          ) : (
            <button
              onClick={() => openModal('connect_wallet')}
              disabled={isConnecting}
              className="btn-gold-accent text-xs sm:text-sm py-2 px-3.5 sm:px-5 shrink-0"
            >
              <Lightning size={15} weight="bold" />
              <span>{isConnecting ? 'Connecting…' : 'Connect'}</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-[#09090B]/98 backdrop-blur-xl border-b border-purple-500/30 px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <span className="text-xs font-mono text-zinc-400">Navigation</span>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Stellar Testnet
            </div>
          </div>

          <nav className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-zinc-200 hover:text-amber-400 py-1 transition-colors no-underline block"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
