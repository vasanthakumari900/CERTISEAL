'use client';

import React from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { GraduationCap, ShieldCheck, Download, Share2, ArrowRight } from 'lucide-react';

export default function ForStudentsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>FOR STUDENTS & CANDIDATES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Your Tamper-Proof Digital Credential Vault
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            Store, view, download, and share your cryptographically signed academic degrees, diplomas, and transcripts with zero risk of forgery or identity fraud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Lifetime Credential Ownership</h3>
            <p className="text-xs text-slate-400">
              Access your verified credentials anywhere, backed by institutional digital signatures and hash-chain ledger proofs.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Share2 className="w-8 h-8 text-blue-400" />
            <h3 className="text-base font-bold text-white">Instant Verification Links & QR</h3>
            <p className="text-xs text-slate-400">
              Share your credential link or QR code with employers for 1-click 8-level trust verification.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Download className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">W3C Verifiable Credentials</h3>
            <p className="text-xs text-slate-400">
              Export standard JSON-LD W3C Verifiable Credentials compatible with global digital wallets.
            </p>
          </div>
        </div>

        <div className="bg-navy-900 border border-cyan-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Access Your Student Credential Vault</h3>
          <p className="text-xs text-slate-300">
            Log in to view your issued certificates and generate employer verification links.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-900/40"
          >
            <span>Login to Student Vault</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
