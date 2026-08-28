'use client';

import React, { useState } from 'react';
import { Database, AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, XCircle, ArrowRight, Layers } from 'lucide-react';

export default function TamperSimulatorPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const runLedgerCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ledger/integrity');
      const data = await res.json();
      setReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTamper = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tamper-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE' })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('DEMO TAMPERING SIMULATED: Block #2 currentHash altered! Run Ledger Check below.');
        await runLedgerCheck();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tamper-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE' })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('LEDGER RESTORED: Pristine Genesis-to-Tip chain integrity restored!');
        await runLedgerCheck();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          SIH Judge Demonstration Tool
        </div>
        <h1 className="text-3xl font-extrabold text-white">Controlled Demo Tamper Simulator</h1>
        <p className="text-xs text-slate-400">
          Demonstrate CERTISEAL's append-only tamper-evident ledger to judges. Deliberately tamper with a demo ledger block to trigger the RED alert, then restore the pristine chain.
        </p>
      </div>

      {/* Action Controls */}
      <div className="bg-navy-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Demonstration Controls</h3>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSimulateTamper}
            disabled={loading}
            className="px-5 py-3 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>1. SIMULATE LEDGER BLOCK TAMPERING</span>
          </button>

          <button
            onClick={runLedgerCheck}
            disabled={loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-950"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>2. RUN LEDGER INTEGRITY CHECK</span>
          </button>

          <button
            onClick={handleRestoreLedger}
            disabled={loading}
            className="px-5 py-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-bold rounded-xl text-xs transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3. RESTORE PRISTINE DEMO LEDGER</span>
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 text-xs font-mono text-cyan-300">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Ledger Report Display */}
      {report && (
        <div className={`p-6 rounded-2xl border ${report.isValid ? 'bg-emerald-950/60 border-emerald-500/50' : 'bg-red-950/80 border-red-600'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              {report.isValid ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
              <h3 className="text-lg font-extrabold text-white">
                {report.isValid ? '✓ LEDGER INTEGRITY VERIFIED (GREEN)' : '✕ LEDGER INTEGRITY COMPROMISED (RED)'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-300">Total Blocks: {report.totalBlocks}</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {report.firstCompromisedIndex && (
              <div className="p-4 rounded-xl bg-red-900/60 border border-red-700 text-red-200 space-y-1">
                <p className="font-bold">Breach Detected at Block #{report.firstCompromisedIndex}!</p>
                <p className="text-[11px]">Record ID: {report.compromisedBlock?.id}</p>
                <p className="text-[11px] break-all">Tampered Hash: {report.compromisedBlock?.currentHash}</p>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {report.blocks?.map((b: any) => (
                <div key={b.id} className={`p-3 rounded-lg border flex items-center justify-between text-[11px] ${b.isValid ? 'bg-navy-950 border-slate-800' : 'bg-red-900/40 border-red-600 text-red-200'}`}>
                  <div>
                    <span className="font-bold text-blue-400">#Block 0{b.index}</span> • <span className="text-slate-300">{b.operation}</span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.id}</p>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${b.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                      {b.isValid ? '✓ VALID' : '✕ CORRUPTED'}
                    </span>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{b.currentHash.substring(0, 16)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
