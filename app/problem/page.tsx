'use client';

import React from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { AlertTriangle, ShieldCheck, XCircle, CheckCircle2, ArrowRight, FileX, Cpu, Lock } from 'lucide-react';

export default function ProblemPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>CRITICAL ACADEMIC INTEGRITY CHALLENGE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            The Multi-Billion Dollar Threat of Academic Certificate Fraud
          </h1>
          <p className="mt-4 text-slate-300 text-base">
            Fake degree mills, Photoshop document editing, fraudulent transcripts, and slow postal background checks severely undermine institutional reputation and employer trust.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Verification Vulnerabilities */}
          <div className="bg-navy-900 border border-rose-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <FileX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Traditional Verification Flaws</h3>
                <p className="text-xs text-rose-300">Manual, Paper-Based, Vulnerable</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 pt-2">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Photoshop & Document Forgery:</strong> Simple graphics editing can alter CGPA, student names, or graduation years without leaving visual artifacts.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Fake QR Codes & URL Redirection:</strong> Fraudulent credentials embed QR codes pointing to attacker-controlled fake verification websites.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Slow Verification Latency:</strong> Traditional postal and manual email background verification takes weeks or months for HR teams.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Single Point of Failure:</strong> Centralized un-hashed databases can be quietly manipulated or corrupted internally.</span>
              </li>
            </ul>
          </div>

          {/* CERTX Solution */}
          <div className="bg-navy-900 border border-blue-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">CERTX Digital Trust Architecture</h3>
                <p className="text-xs text-blue-300">Instant, Immutable, Cryptographically Sealed</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ed25519 Digital Signatures:</strong> Every certificate is signed using asymmetric keypairs bound to verified institutions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Envelope Encryption & Per-Cert DEK:</strong> Student payloads are encrypted with unique AES-256-GCM DEKs wrapped via KMS.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Hash-Chain Ledger Audit:</strong> Genesis-to-tip immutable ledger detects any retroactive database tampering.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>8-Level Instant Proof Engine:</strong> Verifies institution identity, signature, ledger, OCR, and lifecycle in milliseconds.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-blue-900/40 to-navy-900 border border-blue-500/30 rounded-2xl p-8 text-center max-w-2xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Secure Your Institution's Academic Credentials</h3>
          <p className="text-xs text-slate-300">
            Join national universities and enterprises using CERTX for zero-trust certificate issuance and instant verification.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              href="/apply"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-blue-900/40"
            >
              <span>Apply for CERTX Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
