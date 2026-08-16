import { describe, it, expect, beforeEach } from 'vitest';
import {
  shortenAddress,
  formatStellarAmount,
  parseStellarAmount,
  formatDate,
  getStatusBadgeStyle,
} from '@/lib/utils';
import { useUIStore } from '@/stores/useUIStore';

describe('Escrow Utilities & Calculations Suite', () => {
  it('shortens Stellar addresses accurately', () => {
    const pubKey = 'GDUPMODD6GJ60300H2HFF3CYEEGH2YFVZEHIVD0JSNXU07DYYGS6SCV6';
    expect(shortenAddress(pubKey)).toBe('GDUP...SCV6');
    expect(shortenAddress(null)).toBe('');
    expect(shortenAddress(undefined)).toBe('');
  });

  it('formats Stellar SAC amounts with 7 decimals precision', () => {
    // 25,000,000,000 stroops = 2,500.00 USDC
    expect(formatStellarAmount(25000000000n)).toBe('2,500.00');
    // 100,000,000 stroops = 10.00 USDC
    expect(formatStellarAmount('100000000')).toBe('10.00');
    expect(formatStellarAmount(0)).toBe('0.00');
  });

  it('parses user string inputs to BigInt stroops correctly', () => {
    expect(parseStellarAmount('10')).toBe(100000000n);
    expect(parseStellarAmount('2500.50')).toBe(25005000000n);
    expect(parseStellarAmount('invalid')).toBe(0n);
    expect(parseStellarAmount('-5')).toBe(0n);
  });

  it('formats timestamps into human-readable date strings', () => {
    const ts = 1700000000;
    const formatted = formatDate(ts);
    expect(formatted).not.toBe('N/A');
    expect(formatDate(0)).toBe('N/A');
  });

  it('returns distinct badge styles for each escrow lifecycle status', () => {
    expect(getStatusBadgeStyle('Funded').text).toBe('text-indigo-400');
    expect(getStatusBadgeStyle('Completed').text).toBe('text-emerald-400');
    expect(getStatusBadgeStyle('Disputed').text).toBe('text-rose-400');
    expect(getStatusBadgeStyle('InDevelopment').text).toBe('text-cyan-400');
    expect(getStatusBadgeStyle('Unknown').text).toBe('text-gray-400');
  });
});

describe('UI Store & Modal Management Suite', () => {
  beforeEach(() => {
    useUIStore.getState().closeModal();
  });

  it('initializes with no active modal', () => {
    const state = useUIStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.selectedEscrowId).toBeNull();
  });

  it('opens and closes modals with selected escrow context', () => {
    useUIStore.getState().openModal('submit_work', 3, 1);

    let state = useUIStore.getState();
    expect(state.activeModal).toBe('submit_work');
    expect(state.selectedEscrowId).toBe(3);
    expect(state.selectedMilestoneIndex).toBe(1);

    useUIStore.getState().closeModal();
    state = useUIStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.selectedEscrowId).toBeNull();
  });
});
