import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu, FileCheck2, Building2, UserCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-xs font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-white text-base tracking-tight font-mono">CERT<span className="text-blue-500">X</span></span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase tracking-wider">
              Digital Trust
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            National Digital Trust & Verification Infrastructure engineered for academic credential integrity, envelope encryption, and 8-level proof execution.
          </p>
          <p className="text-[11px] text-blue-400 font-mono">Tagline: «Verify. Trust. Hire.»</p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3">Ecosystem Surfaces</h4>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-blue-400 transition-colors">CERTX Landing Website</Link></li>
            <li><Link href="/apply" className="hover:text-blue-400 transition-colors">Apply for Access</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-purple-400 transition-colors">CERTX Admin Portal</Link></li>
            <li><Link href="/login" className="hover:text-emerald-400 transition-colors">CERTX Product Platform</Link></li>
            <li><Link href="/verify" className="hover:text-cyan-400 transition-colors">8-Level Verification Engine</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3">Architecture & Security</h4>
          <ul className="space-y-2">
            <li><Link href="/security-architecture" className="hover:text-blue-400 transition-colors">Envelope Encryption (Per-Cert DEK)</Link></li>
            <li><Link href="/security-architecture" className="hover:text-blue-400 transition-colors">Local / Cloud KMS Abstraction</Link></li>
            <li><Link href="/verification-chain" className="hover:text-blue-400 transition-colors">Ed25519 & SHA-256 Specifications</Link></li>
            <li><Link href="/admin/ledger" className="hover:text-purple-400 transition-colors">Genesis-to-Tip Ledger Auditor</Link></li>
            <li><Link href="/admin/tamper-simulator" className="hover:text-amber-400 transition-colors">SIH Tamper Simulator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Compliance</h4>
          <p className="text-slate-400 leading-relaxed mb-2">
            Server-side RBAC and KMS envelope encryption protect student privacy. No DEKs or private keys exposed to browser.
          </p>
          <div className="p-2 rounded bg-navy-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">✓ Fail-Closed Security:</span> Missing KMS secrets or tampered tokens result in immediate server denial.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
        <p>© 2026 CERTX Digital Trust Ecosystem. Built for Smart India Hackathon.</p>
        <div className="flex gap-4">
          <span>Three Surface Architecture</span>
          <span>•</span>
          <span>Envelope Encryption</span>
          <span>•</span>
          <span>Server-Side RBAC</span>
        </div>
      </div>
    </footer>
  );
}
