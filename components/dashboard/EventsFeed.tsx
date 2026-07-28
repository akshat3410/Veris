'use client';

import React from 'react';
import { useSorobanEvents } from '@/hooks/useSorobanEvents';
import { shortenAddress, formatDate } from '@/lib/utils';
import { Radioactive, Pulse, Broadcast, FileCode } from '@phosphor-icons/react';

export function EventsFeed() {
  const { data: events = [], isLoading } = useSorobanEvents();

  return (
    <div className="card-flat-minimal">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Radioactive size={20} weight="duotone" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Soroban RPC Telemetry Log</h3>
            <p className="text-xs text-zinc-400 font-mono">Live contract events on Stellar Testnet</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <Pulse size={16} weight="bold" className="animate-pulse" />
          Streaming
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs font-mono text-zinc-400">Loading events telemetry…</div>
      ) : events.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-zinc-400">No contract events recorded yet.</div>
      ) : (
        <div className="space-y-3 font-mono text-xs max-h-64 overflow-y-auto pr-2">
          {events.map((evt, idx) => (
            <div
              key={`evt-${evt.id}-${idx}`}
              className="p-3 rounded-xl bg-[#1A1A22] border border-zinc-800 flex items-center justify-between hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCode size={16} weight="duotone" className="text-purple-400" />
                <div>
                  <span className="text-white font-bold">{evt.topic.join(' :: ') || 'EscrowEvent'}</span>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    Ledger #{evt.ledger} • {typeof evt.createdAt === 'number' ? formatDate(evt.createdAt) : formatDate(Math.floor(new Date(evt.createdAt).getTime() / 1000))}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-amber-400 font-semibold">{shortenAddress(evt.id)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
