'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserCheck, ShieldCheck, QrCode, Share2, Download, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

export default function StudentDashboardPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const studentCerts = [
    {
      id: 'CERT-2026-000123',
      type: 'Degree Certificate',
      course: 'B.Sc Computer Science',
      inst: 'National Institute of Technology (NIT Demo)',
      issueDate: '2026-08-15',
      cgpa: '8.72',
      status: 'VERIFIED'
    }
  ];

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/verify/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
          <UserCheck className="w-4 h-4" />
          Student Credential Vault
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Issued Certificates</h1>
        <p className="text-xs text-slate-400">View your cryptographically sealed credentials, track verification status, and share verification links with employers.</p>
      </div>

      <div className="space-y-4">
        {studentCerts.map((cert) => (
          <div key={cert.id} className="bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
                  {cert.type}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{cert.course}</h3>
                <p className="text-xs text-slate-400">{cert.inst}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ✓ STATUS: {cert.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[11px] font-sans">Certificate ID</span>
                <p className="font-bold text-blue-300 mt-0.5">{cert.id}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-sans">CGPA Grade</span>
                <p className="font-bold text-emerald-400 mt-0.5">{cert.cgpa}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-sans">Issued Date</span>
                <p className="text-slate-200 mt-0.5">{cert.issueDate}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-sans">Trust Seal</span>
                <p className="text-purple-400 font-bold mt-0.5">Ed25519 Signed</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
              <Link
                href={`/verify/${cert.id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Verification Page</span>
              </Link>

              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(cert.id)}
                  className="px-3.5 py-2 bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  {copiedId === cert.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === cert.id ? 'Copied!' : 'Copy Share Link'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
