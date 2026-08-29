'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import NavbarPlatform from '@/components/NavbarPlatform';
import Footer from '@/components/Footer';
import { UserCheck, ShieldCheck, QrCode, Share2, Download, Copy, CheckCircle2, ExternalLink, EyeOff, Lock } from 'lucide-react';

export default function StudentDashboardPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hideCgpa, setHideCgpa] = useState(false);
  const [hideRoll, setHideRoll] = useState(false);

  const studentCerts = [
    {
      id: 'CERT-2026-000123',
      type: 'Degree Certificate',
      course: 'B.Sc Computer Science',
      inst: 'National Institute of Technology Tiruchirappalli (NIT Trichy)',
      issueDate: '2026-08-15',
      cgpa: '8.72',
      status: 'VERIFIED'
    }
  ];

  const handleCopyLink = (id: string) => {
    const link = `${window.location.origin}/profile/verified/PROV-2026-STUDENT?hideCgpa=${hideCgpa}&hideRoll=${hideRoll}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarPlatform />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <UserCheck className="w-4 h-4" />
            Student Credential Vault & Privacy Wallet — CERTX Platform
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Issued Credentials</h1>
          <p className="text-xs text-slate-400">View your cryptographically sealed credentials, configure privacy-preserving disclosure controls, and share public links with recruiters.</p>
        </div>

        {/* Selective Disclosure Controls Box */}
        <div className="bg-navy-900/80 rounded-2xl border border-indigo-500/30 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <EyeOff className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Privacy-Preserving Selective Disclosure Controls</h3>
              <p className="text-xs text-slate-400">Control which sensitive fields are exposed on public verification share links.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideCgpa}
                onChange={(e) => setHideCgpa(e.target.checked)}
                className="rounded bg-navy-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Hide CGPA Grade from Public Share Link</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideRoll}
                onChange={(e) => setHideRoll(e.target.checked)}
                className="rounded bg-navy-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Hide Roll / Registration Number</span>
            </label>
          </div>
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
                  <p className={`font-bold mt-0.5 ${hideCgpa ? 'text-indigo-400 font-sans italic text-[11px]' : 'text-emerald-400'}`}>
                    {hideCgpa ? '[Hidden]' : cert.cgpa}
                  </p>
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
                  <span>View Public Verification Evidence</span>
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLink(cert.id)}
                    className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                  >
                    {copiedId === cert.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === cert.id ? 'Privacy Profile Copied!' : 'Copy Selective Disclosure Profile Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
