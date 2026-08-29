'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import { ShieldCheck, Search, Cpu, Lock, CheckCircle2, ArrowRight, Building2, AlertTriangle, FileCheck, Layers, Eye, HelpCircle, ChevronRight, Key, Sparkles, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 pb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            National Certificate Trust & Verification Infrastructure
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            CERTX Digital Trust Engine <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
              For Academic Credentials
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            CERTX protects academic integrity across institutions, students, and employers. Featuring <strong>Envelope Encryption with per-certificate DEKs</strong>, <strong>KMS abstraction</strong>, <strong>Ed25519 signatures</strong>, and an <strong>8-Level Evidence Chain</strong>.
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2"
            >
              <span>Apply for CERTX Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verify"
              className="px-6 py-3 bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Verify a Certificate</span>
            </Link>
          </div>

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

          {/* SIH Pre-Seeded Sample Clickers */}
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

        {/* Three Surface Architecture Banner */}
        <section className="bg-gradient-to-r from-blue-950/80 via-navy-900 to-purple-950/80 rounded-2xl border border-blue-800/50 p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-mono font-bold uppercase tracking-wider">
              THREE SEPARATE WEB SURFACES
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">CERTX Architectural Surface Responsibilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-navy-950/80 border border-blue-500/30 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">1. Landing Website</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Public informational surface detailing academic fraud, security specs, 8-level verification, and institutional access application.
              </p>
              <Link href="/apply" className="text-[11px] font-bold text-blue-400 hover:underline inline-block pt-1">
                Apply for Access →
              </Link>
            </div>

            <div className="bg-navy-950/80 border border-purple-500/30 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">2. Admin Portal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Super Admin governance surface for application review, organization status, suspensions, audit logs, and tamper simulation.
              </p>
              <Link href="/admin/dashboard" className="text-[11px] font-bold text-purple-400 hover:underline inline-block pt-1">
                Super Admin Governance →
              </Link>
            </div>

            <div className="bg-navy-950/80 border border-emerald-500/30 rounded-xl p-5 space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">3. CERTX Product Platform</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Authenticated operational surface for Institution Admins, Faculty Issuers, Employers/HR, and Student Credential Vaults.
              </p>
              <Link href="/login" className="text-[11px] font-bold text-emerald-400 hover:underline inline-block pt-1">
                Platform Login →
              </Link>
            </div>
          </div>
        </section>

        {/* 8-Level Verification Chain Overview */}
        <section className="bg-navy-900/50 rounded-2xl border border-slate-800 p-8">
          <div className="text-center mb-8">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Evidence Chain Pipeline</h2>
            <h3 className="text-2xl font-bold text-white">8-Level Cryptographic Trust Verification</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'INSTITUTION IDENTITY', desc: 'Verified against UGC/AISHE master snapshot & active status', icon: Building2, color: 'text-blue-400' },
              { step: '02', title: 'ENVELOPE ENCRYPTION', desc: 'AES-256-GCM encrypted payload with per-certificate DEKs wrapped via KMS', icon: Lock, color: 'text-purple-400' },
              { step: '03', title: 'ED25519 SIGNATURE', desc: 'Digital signature verified against institution public key', icon: Key, color: 'text-cyan-400' },
              { step: '04', title: 'STATUS VERIFICATION', desc: 'Evaluates real-time state: VERIFIED, ON_HOLD, RELEASED, REVOKED', icon: CheckCircle2, color: 'text-emerald-400' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-navy-950 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-slate-500 font-bold">STEP {item.step}</span>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/verification-chain"
              className="text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore full 8-Level Verification Chain documentation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* CTA Box */}
        <section className="bg-gradient-to-r from-blue-950 via-navy-900 to-indigo-950 p-8 sm:p-12 rounded-2xl border border-blue-800/50 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Secure Academic Credentials?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Apply for access or test the live verification engine with pre-seeded demo certificates.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/50"
            >
              Apply for CERTX Access
            </Link>
            <Link
              href="/verify"
              className="px-6 py-3 bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all"
            >
              Verify a Certificate
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
