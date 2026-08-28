'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, Cpu, Lock, CheckCircle2, ArrowRight, Building2, AlertTriangle, FileCheck, Layers, Eye } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [certId, setCertId] = useState('');

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      router.push(`/verify/${certId.trim().toUpperCase()}`);
    }
  };

  const sampleDemoCerts = [
    { id: 'CERT-2026-000123', label: 'Rahul Kumar (VERIFIED)', badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    { id: 'CERT-2026-000124', label: 'Anita Sharma (ON_HOLD)', badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    { id: 'CERT-2026-000125', label: 'Vikram Singh (RELEASED)', badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
    { id: 'CERT-2026-000126', label: 'Rajesh Verma (REVOKED)', badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40' },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Smart India Hackathon Infrastructure Prototype
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Verify Certificates. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
            Trust Qualifications.
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          A cryptographically secured certificate verification & trust platform connecting educational institutions, recruitment teams, and employers in seconds.
        </p>

        <p className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">
          «Verify. Trust. Hire.»
        </p>

        {/* Quick Certificate Search Box */}
        <form onSubmit={handleVerifySubmit} className="max-w-xl mx-auto mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CERT-2026-000123)..."
              className="w-full pl-11 pr-4 py-3 bg-navy-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-500 shadow-inner font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
          >
            <span>Verify Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Judge Sample Demo Clickers */}
        <div className="pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Test Pre-Seeded Certificates (Click to Verify):</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sampleDemoCerts.map((sample) => (
              <button
                key={sample.id}
                onClick={() => router.push(`/verify/${sample.id}`)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all hover:scale-105 ${sample.badgeBg}`}
              >
                {sample.id} • {sample.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Process Diagram */}
      <section className="bg-navy-900/50 rounded-2xl border border-slate-800 p-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Cryptographic Pipeline</h2>
          <h3 className="text-2xl font-bold text-white">How Trust is Built & Verified</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            { step: '01', title: 'ISSUE', desc: 'Institution enters canonical certificate payload', icon: Building2, color: 'text-blue-400' },
            { step: '02', title: 'SEAL', desc: 'SHA-256 fingerprint generated & Ed25519 signed', icon: Lock, color: 'text-purple-400' },
            { step: '03', title: 'VERIFY', desc: 'Employer scans QR or enters Certificate ID', icon: Search, color: 'text-cyan-400' },
            { step: '04', title: 'TRUST', desc: 'Status-aware verification report generated', icon: CheckCircle2, color: 'text-emerald-400' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="bg-navy-950 p-6 rounded-xl border border-slate-800 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-slate-500 font-bold">STEP {item.step}</span>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6 Core Differentiator Cards */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Core Architecture Principles</h2>
          <h3 className="text-3xl font-extrabold text-white">Why CERTISEAL Outperforms Legacy Approaches</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">1. Status-Aware Lifecycle Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Does not simply answer "Genuine or Fake". Supports <span className="text-amber-300 font-semibold font-mono">ON_HOLD</span>, <span className="text-blue-300 font-semibold font-mono">RELEASED</span>, <span className="text-red-300 font-semibold font-mono">REVOKED</span>, and <span className="text-emerald-300 font-semibold font-mono">VERIFIED</span> states. An authentic certificate on hold is clearly identified without falsely labeling it as fake.
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">2. Cryptographic Proof Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic SHA-256 canonical hashing + institution Ed25519 digital signatures. Any modification to student attributes (e.g. CGPA 8.72 to 9.72) produces a completely different hash.
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">3. Tamper-Evident Hash Chain</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Append-only database ledger chaining <span className="font-mono text-purple-300">previous_hash</span> to <span className="font-mono text-purple-300">current_hash</span> from Genesis block. Features live administrative scanner that flags corrupted blocks in RED.
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">4. Institution-Owned Keys</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each educational institution possesses independent Ed25519 keypairs and retains strict administrative accountability. Supports key rotation with backwards verification compatibility.
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">5. Tiered Triple Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Support QR Camera Scanning, Certificate ID lookup, and PDF/Image document upload with OCR extraction & field-by-field mismatch diff highlighting.
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">6. Privacy-First Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sensitive student fields are encrypted with AES-256-GCM. Public verification displays only necessary trust evidence without leaking private student contact records.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-blue-950 via-navy-900 to-indigo-950 p-8 sm:p-12 rounded-2xl border border-blue-800/50 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Ready for Judge Evaluation Demonstration?</h3>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Switch roles using the top right Demo Switcher or test the complete verification engine right now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/verify"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/50"
          >
            Verify a Certificate
          </Link>
          <Link
            href="/how-it-works"
            className="px-6 py-3 bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all"
          >
            How Verification Works
          </Link>
        </div>
      </section>
    </div>
  );
}
