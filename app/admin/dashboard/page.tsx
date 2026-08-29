'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarAdmin from '@/components/NavbarAdmin';
import Footer from '@/components/Footer';
import { ShieldCheck, Building2, Database, AlertTriangle, CheckCircle2, RefreshCw, Layers, ShieldAlert, Cpu, ArrowUpRight, UserCheck, Check, X, FileText, Lock, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeOrganizations: 0,
    suspendedOrganizations: 0,
    totalInstitutions: 0,
    totalCertificates: 0,
    securityAlertsCount: 0
  });

  const [ledgerReport, setLedgerReport] = useState<any>(null);
  const [isScanningLedger, setIsScanningLedger] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    runLedgerCheck();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch access applications
      const appRes = await fetch('/api/admin/applications');
      const appData = await appRes.json();
      if (appData.applications) {
        setApplications(appData.applications);
        const pending = appData.applications.filter((a: any) => a.status === 'PENDING').length;
        const approved = appData.applications.filter((a: any) => a.status === 'APPROVED').length;
        const rejected = appData.applications.filter((a: any) => a.status === 'REJECTED').length;

        setStats((prev: any) => ({
          ...prev,
          totalApplications: appData.applications.length,
          pendingApplications: pending,
          approvedApplications: approved,
          rejectedApplications: rejected
        }));
      }

      // Fetch organizations
      const orgRes = await fetch('/api/admin/organizations');
      const orgData = await orgRes.json();
      if (orgData.institutions) {
        const active = orgData.institutions.filter((i: any) => i.status === 'PARTICIPATING' || i.status === 'VERIFIED').length;
        const suspended = orgData.institutions.filter((i: any) => i.status === 'SUSPENDED').length;
        const totalCertificatesCount = orgData.institutions.reduce((sum: number, i: any) => sum + (i._count?.certificates || 0), 0);

        setStats((prev: any) => ({
          ...prev,
          totalInstitutions: orgData.institutions.length,
          activeOrganizations: active,
          suspendedOrganizations: suspended,
          totalCertificates: totalCertificatesCount
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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

  const handleApplicationAction = async (id: string, action: string) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarAdmin />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              Super Admin Ecosystem Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">CERTX Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Review access applications, manage organization lifecycle, monitor ledger integrity, and inspect security events.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={runLedgerCheck}
              disabled={isScanningLedger}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-900/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningLedger ? 'animate-spin' : ''}`} />
              <span>RUN LEDGER SCAN</span>
            </button>
          </div>
        </div>

        {/* 11 Target Dashboard Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <Link href="/admin/applications" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Total Applications</span>
            <p className="text-2xl font-extrabold text-white">{stats.totalApplications}</p>
            <span className="text-[10px] text-blue-400 font-mono">View All Applications →</span>
          </Link>

          <Link href="/admin/applications?status=PENDING" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Pending Review</span>
            <p className="text-2xl font-extrabold text-amber-400">{stats.pendingApplications}</p>
            <span className="text-[10px] text-amber-300 font-mono">Requires Action</span>
          </Link>

          <Link href="/admin/applications?status=APPROVED" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Approved Orgs</span>
            <p className="text-2xl font-extrabold text-emerald-400">{stats.approvedApplications}</p>
            <span className="text-[10px] text-emerald-300 font-mono">Provisioned</span>
          </Link>

          <Link href="/admin/applications?status=REJECTED" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-rose-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Rejected Apps</span>
            <p className="text-2xl font-extrabold text-rose-400">{stats.rejectedApplications}</p>
            <span className="text-[10px] text-rose-300 font-mono font-mono">Denied Access</span>
          </Link>

          <Link href="/admin/organizations" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Active Orgs</span>
            <p className="text-2xl font-extrabold text-blue-400">{stats.activeOrganizations}</p>
            <span className="text-[10px] text-blue-300 font-mono">Issuing Authorized</span>
          </Link>

          <Link href="/admin/organizations?status=SUSPENDED" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-rose-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Suspended Orgs</span>
            <p className="text-2xl font-extrabold text-rose-400">{stats.suspendedOrganizations}</p>
            <span className="text-[10px] text-rose-300 font-mono">Issuance Suspended</span>
          </Link>

          <Link href="/admin/institutions" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Total Institutions</span>
            <p className="text-2xl font-extrabold text-purple-300">{stats.totalInstitutions}</p>
            <span className="text-[10px] text-purple-400 font-mono">National Directory</span>
          </Link>

          <div className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Total Certificates</span>
            <p className="text-2xl font-extrabold text-white">{stats.totalCertificates}</p>
            <span className="text-[10px] text-emerald-400 font-mono">Sealed & Encrypted</span>
          </div>

          <Link href="/admin/ledger" className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Ledger Status</span>
            <p className="text-sm font-extrabold text-emerald-400 mt-1">
              {ledgerReport?.isValid ? '✓ PRISTINE (GREEN)' : '✕ ALERT (RED)'}
            </p>
            <span className="text-[10px] text-cyan-300 font-mono">Genesis Tip Scan</span>
          </Link>

          <Link href="/admin/tamper-simulator" className="bg-navy-900/80 p-4 rounded-xl border border-rose-500/40 hover:border-rose-500 transition-all space-y-1">
            <span className="text-[11px] font-medium text-amber-300">Tamper Simulator</span>
            <p className="text-xs font-bold text-white mt-1">SIH Demo Tool</p>
            <span className="text-[10px] text-rose-400 font-mono">Test Breach & Restore →</span>
          </Link>
        </div>

        {/* Access Applications Pending Review */}
        <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Access Applications Pending Review</h3>
            </div>
            <Link href="/admin/applications" className="text-xs font-mono text-blue-400 hover:underline">
              View All ({applications.length})
            </Link>
          </div>

          <div className="space-y-3">
            {applications.length > 0 ? (
              applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="p-4 rounded-xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-blue-400">{app.applicationId}</span>
                      <span className="font-bold text-white text-sm">{app.organizationName}</span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        app.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-slate-300">
                      Contact: <strong className="text-white">{app.contactPerson}</strong> ({app.designation}) — <span className="font-mono text-blue-300">{app.officialEmail}</span> — {app.city}, {app.state}
                    </p>
                    <p className="text-slate-400 text-[11px] line-clamp-1">Reason: {app.reason}</p>
                  </div>

                  {app.status === 'PENDING' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApplicationAction(app.id, 'APPROVE')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Provision</span>
                      </button>
                      <button
                        onClick={() => handleApplicationAction(app.id, 'REJECT')}
                        className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No applications currently logged in database.</p>
            )}
          </div>
        </div>

        {/* Ledger & Security Monitor */}
        <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hash-Chain Ledger Integrity & Security Status</h3>
            </div>
            <Link href="/admin/ledger" className="text-xs text-purple-400 font-mono hover:underline">
              Inspect Ledger →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Ledger Chain Verification</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ledgerReport?.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {ledgerReport?.isValid ? '✓ INTEGRITY VERIFIED' : '✕ CORRUPTED'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">Genesis Hash: {ledgerReport?.genesisHash?.substring(0, 32)}...</p>
              <p className="text-emerald-400 text-[11px]">Tip Hash: {ledgerReport?.tipHash?.substring(0, 32)}...</p>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Envelope Encryption KMS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">
                  PROTOTYPE LOCAL KEK
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">DEK Algorithm: AES-256-GCM (Per-Certificate Unique DEK)</p>
              <p className="text-purple-300 text-[11px]">KMS Provider: LocalKMSProvider (Fail-Closed)</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
