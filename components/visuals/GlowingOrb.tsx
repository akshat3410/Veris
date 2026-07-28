'use client';

import React from 'react';

export function GlowingOrb() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary Top Violet Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-purple-600/20 via-stellar-violet/10 to-transparent blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
      
      {/* Cyan Right Accent Glow */}
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-l from-stellar-cyan/15 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* Deep Space Background Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} 
      />
    </div>
  );
}
