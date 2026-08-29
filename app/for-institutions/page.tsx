'use client';

import React from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Building2, ShieldCheck, Key, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForInstitutionsPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>FOR UNIVERSITIES & COLLEGES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Empower Your Institution with Unforgeable Credentials
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            CERTX equips universities and autonomous colleges with automated key management, Ed25519 digital signatures, Envelope Encryption, and real-time lifecycle controls.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Key className="w-8 h-8 text-blue-400" />
            <h3 className="text-base font-bold text-white">Automated Key Management</h3>
            <p className="text-xs text-slate-400">
              Generate and rotate institution Ed25519 keypairs with automatic version tracking and encrypted server-side storage.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Lock className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Envelope Encryption & KMS</h3>
            <p className="text-xs text-slate-400">
              Protect student privacy using per-certificate DEKs wrapped via Local/Cloud KMS abstraction.
            </p>
          </div>

          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
            <h3 className="text-base font-bold text-white">Administrative Lifecycle Controls</h3>
            <p className="text-xs text-slate-400">
              Manage status transitions transparently (VERIFIED, ON_HOLD, RELEASED, REVOKED) with immutable audit events.
            </p>
          </div>
        </div>

        <div className="bg-navy-900 border border-blue-500/30 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white">Ready to Onboard Your Institution?</h3>
          <p className="text-xs text-slate-300">
            Submit an access application to receive Super Admin review and platform provisioning.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-900/40"
          >
            <span>Apply for Institution Access</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
