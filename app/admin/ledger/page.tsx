'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Play, Undo2, Lock } from 'lucide-react';

export default function AdminLedgerPage() {
  const [loading, setLoading] = useState(true);
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/ledger/integrity');
      const data = await res.json();
      setLedgerData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleSimulateTamper = async () => {
    setIsSimulating(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/tamper-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CORRUPT_BLOCK_3' })
      });
      const resData = await res.json();
      setActionMessage(resData.message || 'Demo ledger block tampered for judge evaluation!');
      await fetchLedger();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRestoreLedger = async () => {
    setIsSimulating(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/tamper-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE_LEDGER' })
      });
      const resData = await res.json();
      setActionMessage(resData.message || 'Ledger restored to pristine cryptographic state!');
      await fetchLedger();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <Layers className="w-4 h-4" />
            Append-Only Database Hash Chain Scanner
          </div>
          <h1 className="text-3xl font-extrabold text-white">Ledger Integrity Auditor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Independent Genesis-to-Tip block validation engine auditing cryptographic hash linkage across all operations.
          </p>
        </div>

        <button
          onClick={fetchLedger}
          disabled={loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>RUN LEDGER INTEGRITY SCAN</span>
        </button>
      </div>

      {/* Controlled Demo Mode Alert Box */}
      <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
            PROTOTYPE DEMO SIMULATOR
          </div>
          <h3 className="text-sm font-bold text-white">Safe SIH Controlled Ledger Tamper Simulator</h3>
          <p className="text-xs text-slate-400">
            Simulate an unauthorized database modification to demonstrate how the Ledger Auditor detects corrupted blocks live.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleSimulateTamper}
            disabled={isSimulating}
            className="flex-1 sm:flex-initial px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Ledger Tamper</span>
          </button>

          <button
            onClick={handleRestoreLedger}
            disabled={isSimulating}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Undo2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore Pristine Chain</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-blue-950/80 border border-blue-700 text-blue-200 font-mono text-xs">
          {actionMessage}
        </div>
      )}

      {/* Main Integrity Summary Status Banner */}
      {ledgerData && (
        <div
          className={`p-6 rounded-2xl border flex items-center justify-between gap-4 ${
            ledgerData.isIntegrityValid
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
              : 'bg-red-950/80 border-red-600 text-red-100'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${ledgerData.isIntegrityValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {ledgerData.isIntegrityValid ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold">
                {ledgerData.isIntegrityValid ? '✓ LEDGER INTEGRITY VALIDATED (GENESIS TO TIP)' : '✕ LEDGER INTEGRITY COMPROMISED'}
              </h2>
              <p className="text-xs opacity-90">
                Audited {ledgerData.totalEntries || 0} blocks. {ledgerData.corruptedCount > 0 ? `Detected ${ledgerData.corruptedCount} corrupted hash block!` : 'All previous_hash linkages match.'}
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <p className="text-slate-300">Audited Blocks: <span className="font-bold text-white">{ledgerData.totalEntries}</span></p>
            <p className="text-slate-300">Status: <span className={ledgerData.isIntegrityValid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{ledgerData.isIntegrityValid ? 'PRISTINE' : 'CORRUPTED'}</span></p>
          </div>
        </div>
      )}

      {/* Block-by-Block List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hash Chain Block Breakdown</h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
            <p className="text-xs font-mono">Auditing database hash blocks...</p>
          </div>
        ) : ledgerData && ledgerData.entries ? (
          <div className="space-y-3 font-mono text-xs">
            {ledgerData.entries.map((entry: any, idx: number) => {
              const isCorrupted = entry.isCorrupted;
              return (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCorrupted
                      ? 'bg-red-950/60 border-red-600 text-red-200'
                      : 'bg-navy-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-black/40 font-bold text-slate-300 text-[11px]">
                        BLOCK #{String(idx + 1).padStart(3, '0')}
                      </span>
                      <span className="font-bold text-white">{entry.operation}</span>
                      <span className="text-[10px] text-slate-400 font-sans">({new Date(entry.timestamp).toLocaleString()})</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCorrupted ? 'bg-red-500/30 text-red-300 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {isCorrupted ? '✕ CORRUPTED BLOCK' : '✓ HASH LINKED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500">Previous Hash: </span>
                      <span className={isCorrupted ? 'text-red-400 font-bold underline' : 'text-slate-400'}>{entry.previousHash}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Current Hash: </span>
                      <span className="text-purple-300">{entry.currentHash}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No ledger entries found.</p>
        )}
      </div>
    </div>
  );
}
