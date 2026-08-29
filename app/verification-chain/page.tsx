'use client';

import React from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Lock, Cpu, Search, Key, Database, FileText, Activity } from 'lucide-react';

const LEVELS = [
  {
    level: 'LEVEL 1',
    title: 'Institution Identity',
    icon: Building2Icon,
    desc: 'Verifies institution registration against authoritative sources (AISHE, UGC, AICTE) and checks that organization status is APPROVED and not SUSPENDED.'
  },
  {
    level: 'LEVEL 2',
    title: 'Issuer Authentication',
    icon: Key,
    desc: 'Validates that the issuing faculty or admin user has authorized rights and matches an active Ed25519 key version bound to the institution.'
  },
  {
    level: 'LEVEL 3',
    title: 'Certificate Registry',
    icon: Database,
    desc: 'Confirms existence of the canonical certificate record within the central CERTX registry database.'
  },
  {
    level: 'LEVEL 4',
    title: 'SHA-256 Fingerprint Integrity',
    icon: Cpu,
    desc: 'Reconstructs the 14-field canonical JSON representation and recomputes the SHA-256 fingerprint, guaranteeing zero payload modification.'
  },
  {
    level: 'LEVEL 5',
    title: 'Ed25519 Asymmetric Signature',
    icon: Lock,
    desc: 'Cryptographically verifies the digital signature using the institution’s public key. Fails closed if keys are missing or invalid.'
  },
  {
    level: 'LEVEL 6',
    title: 'Hash-Chain Ledger Audit',
    icon: Activity,
    desc: 'Scans the genesis-to-tip immutable hash chain to verify that the issuance block sequence and previous-hash pointers remain pristine.'
  },
  {
    level: 'LEVEL 7',
    title: 'Document & OCR Consistency',
    icon: FileText,
    desc: 'Performs computer vision and field-by-field OCR string comparison when a physical document or transcript is uploaded by an employer.'
  },
  {
    level: 'LEVEL 8',
    title: 'Lifecycle Status Evaluation',
    icon: ShieldCheck,
    desc: 'Evaluates real-time state: VERIFIED, ON_HOLD, RELEASED, or REVOKED, providing transparent, explainable evidence.'
  }
];

function Building2Icon(props: any) {
  return <Building2Icon {...props} />;
}

export default function VerificationChainPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>8-LEVEL VERIFICATION CHAIN</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Comprehensive 8-Level Trust Verification Model
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base">
            CERTX replaces binary pass/fail verification with a mathematically rigorous 8-level trust validation pipeline, delivering complete explainable evidence.
          </p>
        </div>

        {/* 8 Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEVELS.map((item, idx) => (
            <div
              key={item.level}
              className="bg-navy-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-extrabold text-blue-400 font-mono bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-md">
                    {item.level}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-white">Test the Live 8-Level Verification Engine</h3>
          <p className="text-xs text-slate-400">
            Verify demo certificates or test uploaded documents to view real-time cryptographic proof breakdown.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/verify"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
            >
              Open Verification Engine
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
