'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Building2, Database, AlertTriangle, CheckCircle2, RefreshCw, Layers, ShieldAlert, Cpu, ArrowUpRight, UserCheck, Check, X } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalInstitutions: 3,
    activeInstitutions: 3,
    totalCertificates: 24,
    totalVerifications: 142,
    successRate: '98.5%',
    onHoldCount: 2,
    revokedCount: 1,
    tamperedAttempts: 3
  });

  const [ledgerReport, setLedgerReport] = useState<any>(null);
  const [isScanningLedger, setIsScanningLedger] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Pending Onboarding Requests State
  const [onboardings, setOnboardings] = useState<any[]>([
    {
      id: 'ONB-2026-001',
      officerName: 'Dr. K. Ramanathan',
      officerDesignation: 'Dean of Academics',
      officialDomainEmail: 'dean@mitindia.edu',
      institutionName: 'Madras Institute of Technology Chromepet',
      documentationDetails: 'UGC & AISHE Accreditation Record Verified',
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    fetchAlerts();
    runLedgerCheck();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch (e) {}
  };

  const runLedgerCheck = async () => {
    setIsScanningLedger(true);
    try {
      const res = await fetch('/api/ledger/integrity');
      const data = await res.json();
      setLedgerReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanningLedger(false);
    }
  };

  const handleApproveOnboarding = (id: string) => {
    setOnboardings(prev => prev.map(o => o.id === id ? { ...o, status: 'APPROVED' } : o));
  };

  const handleRejectOnboarding = (id: string) => {
    setOnboardings(prev => prev.map(o => o.id === id ? { ...o, status: 'REJECTED' } : o));
  };

  return (
    <div className="space-y-8 py-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            Super Admin Governance Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Administration</h1>
          <p className="text-xs text-slate-400">Monitor system health, institution approvals, security alerts, and ledger integrity.</p>
        </div>

        <button
          onClick={runLedgerCheck}
          disabled={isScanningLedger}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${isScanningLedger ? 'animate-spin' : ''}`} />
          <span>RUN LEDGER INTEGRITY SCAN</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Institutions</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalInstitutions}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">100% Active & Accredited</p>
        </div>

        <div className="bg-navy-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Sealed Certificates</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalCertificates}</p>
          <p className="text-[11px] text-slate-400 font-mono">Ed25519 Signed</p>
        </div>

        <div className="bg-navy-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Verification Volume</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.totalVerifications}</p>
          <p className="text-[11px] text-emerald-400 font-semibold">{stats.successRate} Success Rate</p>
        </div>

        <div className="bg-navy-900/60 p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Fraud / Tamper Alerts</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{stats.tamperedAttempts}</p>
          <p className="text-[11px] text-red-400 font-semibold">Blocked & Audited</p>
        </div>
      </div>

      {/* Institution Onboarding Review Section */}
      <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Institution Onboarding Approvals</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{onboardings.length} Pending Application</span>
        </div>

        <div className="space-y-3">
          {onboardings.map(item => (
            <div key={item.id} className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{item.institutionName}</span>
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-300">Nodal Officer: <strong className="text-white">{item.officerName}</strong> ({item.officerDesignation}) — <span className="font-mono text-blue-300">{item.officialDomainEmail}</span></p>
                <p className="text-slate-400 text-[11px] font-mono">{item.documentationDetails}</p>
              </div>

              {item.status === 'SUBMITTED' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveOnboarding(item.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Issue Keys</span>
                  </button>
                  <button
                    onClick={() => handleRejectOnboarding(item.id)}
                    className="px-3.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live Ledger Integrity Scanner Panel */}
      <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${ledgerReport?.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Append-Only Hash Chain Ledger Scanner
                {ledgerReport?.isValid ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    ✓ GREEN: LEDGER INTEGRITY VERIFIED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-mono font-bold">
                    ✕ RED: LEDGER COMPROMISED
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Validates `previous_hash` to `current_hash` from Genesis block.</p>
            </div>
          </div>
          <Link href="/admin/ledger" className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1">
            <span>Open Auditor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {ledgerReport && (
          <div className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded bg-navy-950 border border-slate-800">
                <span className="text-slate-500">Genesis Block Hash:</span>
                <p className="text-slate-300 truncate mt-0.5">{ledgerReport.genesisHash}</p>
              </div>
              <div className="p-3 rounded bg-navy-950 border border-slate-800">
                <span className="text-slate-500">Tip Block Hash:</span>
                <p className="text-emerald-400 truncate mt-0.5">{ledgerReport.tipHash}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fraud Security Alerts */}
      <div className="bg-navy-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Platform Security & Anomaly Alerts
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Audit Logging</span>
        </div>

        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert: any) => (
              <div key={alert.id} className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-400 uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30">
                      {alert.severity} SEVERITY
                    </span>
                    <span className="font-bold text-white">{alert.event}</span>
                  </div>
                  <p className="text-slate-300">{alert.details}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0">
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No active security alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
}
