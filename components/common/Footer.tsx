'use client';

import React from 'react';
import { SOROBAN_CONFIG } from '@/lib/contracts/config';
import { shortenAddress } from '@/lib/utils';

export function Footer() {
  return (
    <footer
      style={{
        background: '#FEFEFC',
        padding: '48px 0',
        borderTop: '1px solid rgba(17, 17, 20, 0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '15px',
              color: '#111114',
            }}
          >
            EscrowVault
          </span>
          <span style={{ fontSize: '13px', color: '#6E6E73' }}>
            © 2026 EscrowVault Protocol. All rights reserved.
          </span>
        </div>

        <div className="font-mono" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '12px', color: '#6E6E73' }}>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${SOROBAN_CONFIG.contractId}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#5B5CE0', fontWeight: 600, textDecoration: 'none' }}
          >
            Contract: {shortenAddress(SOROBAN_CONFIG.contractId, 8)} ↗
          </a>
          <a
            href="https://developers.stellar.org"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#6E6E73', textDecoration: 'none' }}
          >
            Stellar Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
