'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useUIStore } from '@/stores/useUIStore';
import { shortenAddress } from '@/lib/utils';
import { LockKey, PlugsConnected, Lightning } from '@phosphor-icons/react';

export function Navbar() {
  const { address, isConnected, isConnecting, disconnect } = useWallet();
  const { openModal } = useUIStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        background: scrolled ? 'rgba(9, 9, 11, 0.92)' : 'rgba(9, 9, 11, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 32px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#A855F7',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)',
            }}
          >
            <LockKey size={18} weight="bold" color="#09090B" />
          </div>
          <span
            style={{
              fontFamily: "'Chakra Petch', 'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: '20px',
              letterSpacing: '-0.02em',
              color: '#FAFAFA',
            }}
          >
            EscrowVault
          </span>
        </a>

        {/* Minimal Navigation */}
        <nav style={{ display: 'flex', gap: '32px' }}>
          {[
            { href: '#hero', label: 'Overview' },
            { href: '#how', label: 'How it works' },
            { href: '#architecture', label: 'Architecture' },
            { href: '#dashboard', label: 'Escrow Engine' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#D4D4D8',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#FACC15')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#D4D4D8')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Connect Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#A1A1AA' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
            Testnet
          </div>

          {isConnected && address ? (
            <button
              onClick={disconnect}
              style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FAFAFA',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                padding: '8px 20px',
                borderRadius: '100px',
                background: 'rgba(168, 85, 247, 0.1)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <PlugsConnected size={16} weight="bold" className="text-purple-400" />
              {shortenAddress(address)}
            </button>
          ) : (
            <button
              onClick={() => openModal('connect_wallet')}
              disabled={isConnecting}
              className="btn-gold-accent"
              style={{ padding: '9px 22px', fontSize: '13px' }}
            >
              <Lightning size={16} weight="bold" />
              {isConnecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
