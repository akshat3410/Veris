'use client';

import React from 'react';
import { useSorobanEvents } from '@/hooks/useSorobanEvents';
import { Activity, Radio, Cpu, CheckCircle2 } from 'lucide-react';

export function EventsFeed() {
  const { data: events, isLoading } = useSorobanEvents();

  return (
    <div className="p-6 rounded-2xl glass-container glass-card-glow space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-stellar-cyan/20 text-stellar-cyan">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Live Soroban Event Telemetry</h3>
            <p className="text-xs text-gray-400 font-mono">On-Chain Ledger Topic Subscriptions</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Streaming
        </div>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {isLoading && (
          <div className="p-4 text-center text-xs font-mono text-gray-400">Loading ledger telemetry...</div>
        )}

        {events && events.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl bg-stellar-obsidian/80 border border-white/10 flex items-start justify-between gap-4 font-mono text-xs hover:border-stellar-violet/40 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-stellar-cyan shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-stellar-violet/20 text-stellar-violet font-bold text-[10px]">
                    {evt.topic.join(' :: ')}
                  </span>
                  <span className="text-gray-400 text-[11px]">Ledger #{evt.ledger}</span>
                </div>
                <p className="text-gray-200 mt-1 font-sans text-xs">
                  {typeof evt.value === 'string' ? evt.value : JSON.stringify(evt.value)}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 shrink-0">
              {new Date(evt.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
