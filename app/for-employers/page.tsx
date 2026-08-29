'use client';

import React from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Briefcase, ShieldCheck, FileCheck, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForEmployersPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>FOR EMPLOYERS & HR VERIFIERS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Instant Zero-Trust Candidate Background Verification
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            Eliminate background check delays. Verify academic credentials in milliseconds using QR code, Certificate ID, or uploaded document OCR comparison.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Search className="w-8 h-8 text-amber-400" />
            <h3 className="text-base font-bold text-white">Triple-Mode Verification</h3>
            <p className="text-xs text-slate-400">
              Verify candidates by scanning QR codes, entering Certificate IDs, or uploading physical PDF/image documents for automated OCR text comparison.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <FileCheck className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">8-Level Explainable Proof</h3>
            <p className="text-xs text-slate-400">
              Receive a detailed breakdown showing SHA-256 hash match, Ed25519 signature validity, ledger integrity, and institutional status.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <h3 className="text-base font-bold text-white">Downloadable HR Reports</h3>
            <p className="text-xs text-slate-400">
              Generate official audit-ready HR Verification Reports for compliance, audit trails, and risk management.
            </p>
          </div>
        </div>

        <div className="bg-navy-900 border border-amber-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Verify a Candidate Certificate Now</h3>
          <p className="text-xs text-slate-300">
            Use the live CERTX Verification Engine to inspect sample certificates or upload candidate documents.
          </p>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-lg shadow-amber-900/40"
          >
            <span>Open Verification Engine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
