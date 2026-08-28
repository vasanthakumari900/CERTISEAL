'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search, Cpu, Lock, CheckCircle2, ArrowRight, Building2, AlertTriangle, FileCheck, Layers, Eye, HelpCircle, ChevronRight } from 'lucide-react';

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
    <div className="space-y-16 py-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 pb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Smart India Hackathon 2026 Technical Submission
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Digital Trust & Verification Layer <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
            For Academic Credentials
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          CERTISEAL goes beyond answering "Does this certificate exist?". It establishes a complete <strong>8-Level Evidence Chain</strong> from institution identity to Ed25519 signatures, lifecycle holds, and document-vs-record field diffs in under 2 seconds.
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
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">SIH Pre-Seeded Scenario Certificates (Click to Test):</p>
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

      {/* WHY CERTISEAL Ecosystem Banner */}
      <section className="bg-gradient-to-r from-blue-950/80 via-navy-900 to-indigo-950/80 rounded-2xl border border-blue-800/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            ECOSYSTEM POSITIONING
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Why CERTISEAL if DigiLocker & NAD Exist?</h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            DigiLocker is a citizen document repository. CERTISEAL provides a complementary <strong>Trust & Verification Engine</strong> featuring explainable cryptographic proofs, lifecycle hold handling, and document tamper comparison tables.
          </p>
        </div>
        <Link
          href="/why-certiseal"
          className="shrink-0 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
        >
          <span>EXPLORE WHY CERTISEAL</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Visual Process Diagram */}
      <section className="bg-navy-900/50 rounded-2xl border border-slate-800 p-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Evidence Chain Pipeline</h2>
          <h3 className="text-2xl font-bold text-white">How Trust is Established & Verified</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {[
            { step: '01', title: 'INSTITUTION IDENTITY', desc: 'Verified against UGC/AISHE master snapshot & Ed25519 keys', icon: Building2, color: 'text-blue-400' },
            { step: '02', title: 'CANONICAL SEAL', desc: 'SHA-256 fingerprint generated & signed by institution key', icon: Lock, color: 'text-purple-400' },
            { step: '03', title: 'LEDGER RECORDING', desc: 'Appended to tamper-evident Genesis-to-Tip database hash chain', icon: Layers, color: 'text-cyan-400' },
            { step: '04', title: 'STATUS VERIFICATION', desc: 'Returns state-aware result (VERIFIED, ON_HOLD, RELEASED, REVOKED)', icon: CheckCircle2, color: 'text-emerald-400' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="bg-navy-950 p-6 rounded-xl border border-slate-800 relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-slate-500 font-bold">STEP {item.step}</span>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6 Core Differentiator Cards */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Core Technical Architecture</h2>
          <h3 className="text-3xl font-extrabold text-white">Why CERTISEAL Outperforms Legacy Approaches</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">1. Status-Aware Lifecycle Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Does not simply answer "Genuine or Fake". Supports <span className="text-amber-300 font-semibold font-mono">ON_HOLD</span>, <span className="text-blue-300 font-semibold font-mono">RELEASED</span>, <span className="text-red-300 font-semibold font-mono">REVOKED</span>, and <span className="text-emerald-300 font-semibold font-mono">VERIFIED</span> states. An authentic certificate on hold is explicitly identified without calling it fake.
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
            <h4 className="text-base font-bold text-white">4. Institution Key Hierarchy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each educational institution possesses independent Ed25519 keypairs and retains administrative accountability. Supports key rotation with backwards verification compatibility.
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">5. Document Comparison Table</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports PDF/Image document upload with OCR extraction and side-by-side field-by-field diff highlighting (e.g. comparing submitted CGPA against trusted database record).
            </p>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="p-2.5 w-fit rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">6. Privacy-Aware Disclosure</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sensitive student fields are encrypted at rest with AES-256-GCM. Students can generate public verified profiles with customizable privacy controls.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-blue-950 via-navy-900 to-indigo-950 p-8 sm:p-12 rounded-2xl border border-blue-800/50 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Ready for SIH Judge Evaluation Demonstration?</h3>
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
            href="/why-certiseal"
            className="px-6 py-3 bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all"
          >
            Why CERTISEAL?
          </Link>
        </div>
      </section>
    </div>
  );
}
