'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Search, Download, CheckCircle2, AlertTriangle, XCircle, FileText, ArrowRight } from 'lucide-react';

export default function CompanyDashboardPage() {
  const [quickId, setQuickId] = useState('');

  const recentVerifications = [
    { id: 'VER-2026-9A8B7C', certId: 'CERT-2026-000123', student: 'Rahul Kumar', course: 'B.Sc Computer Science', inst: 'NIT Demo', result: 'VERIFIED', date: '2026-08-28 07:15' },
    { id: 'VER-2026-1F2E3D', certId: 'CERT-2026-000124', student: 'Anita Sharma', course: 'B.Tech Electrical Eng', inst: 'NIT Demo', result: 'ON_HOLD', date: '2026-08-28 06:40' },
    { id: 'VER-2026-4K5L6M', certId: 'CERT-2026-000125', student: 'Vikram Singh', course: 'BCA', inst: 'ABC University', result: 'RELEASED', date: '2026-08-27 18:20' },
    { id: 'VER-2026-7P8Q9R', certId: 'CERT-2026-000126', student: 'Rajesh Verma', course: 'Diploma Cybersecurity', inst: 'ABC University', result: 'REVOKED', date: '2026-08-26 14:10' },
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Briefcase className="w-4 h-4" />
            Employer & HR Verification Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Employer Dashboard</h1>
          <p className="text-xs text-slate-400">Verify candidate credentials, review verification receipts, and attach official reports to hiring records.</p>
        </div>

        <Link
          href="/verify"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40 w-fit"
        >
          <Search className="w-4 h-4" />
          <span>+ VERIFY NEW CERTIFICATE</span>
        </Link>
      </div>

      {/* Quick Lookup Box */}
      <div className="bg-navy-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Quick Candidate Certificate Verification</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={quickId}
            onChange={(e) => setQuickId(e.target.value)}
            placeholder="Enter Certificate ID (e.g. CERT-2026-000123)..."
            className="flex-1 px-4 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
          />
          <Link
            href={quickId.trim() ? `/verify/${quickId.trim().toUpperCase()}` : '/verify'}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
          >
            <span>Run Cryptographic Verification</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Verification History Table */}
      <div className="bg-navy-900/60 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company HR Verification Audit History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-navy-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Receipt Reference</th>
                <th className="p-3">Certificate ID</th>
                <th className="p-3">Candidate Name</th>
                <th className="p-3">Issued By</th>
                <th className="p-3">Result Status</th>
                <th className="p-3">Verified On</th>
                <th className="p-3 text-right">HR Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentVerifications.map((row) => {
                let badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                if (row.result === 'ON_HOLD') badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                if (row.result === 'RELEASED') badgeStyle = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
                if (row.result === 'REVOKED') badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40';

                return (
                  <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-mono text-slate-300 font-semibold">{row.id}</td>
                    <td className="p-3 font-mono font-bold text-blue-400">{row.certId}</td>
                    <td className="p-3 font-semibold text-white">{row.student}</td>
                    <td className="p-3 text-slate-300">{row.inst}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeStyle}`}>
                        {row.result}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{row.date}</td>
                    <td className="p-3 text-right">
                      <a
                        href={`/api/reports/download?certificateId=${row.certId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold"
                      >
                        <Download className="w-3 h-3 text-blue-400" />
                        <span>PDF Receipt</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
