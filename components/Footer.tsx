import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cpu, FileCheck2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-white text-base tracking-tight font-mono">CERTI<span className="text-blue-500">SEAL</span></span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Cryptographically secured digital certificate verification and trust infrastructure engineered for Smart India Hackathon evaluation.
          </p>
          <p className="text-[11px] text-blue-400 font-mono">Tagline: «Verify. Trust. Hire.»</p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3">Verification Modes</h4>
          <ul className="space-y-2">
            <li><Link href="/verify" className="hover:text-blue-400 transition-colors">Method A: Camera QR Scan</Link></li>
            <li><Link href="/verify" className="hover:text-blue-400 transition-colors">Method B: Certificate ID Lookup</Link></li>
            <li><Link href="/verify" className="hover:text-blue-400 transition-colors">Method C: Document Upload & OCR</Link></li>
            <li><Link href="/verify/CERT-2026-000124" className="hover:text-amber-400 transition-colors">ON_HOLD Status Demo</Link></li>
            <li><Link href="/verify/CERT-2026-000126" className="hover:text-red-400 transition-colors">REVOKED Status Demo</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3">Architecture</h4>
          <ul className="space-y-2">
            <li><Link href="/how-it-works" className="hover:text-blue-400 transition-colors">SHA-256 Fingerprinting</Link></li>
            <li><Link href="/how-it-works" className="hover:text-blue-400 transition-colors">Ed25519 Digital Signatures</Link></li>
            <li><Link href="/how-it-works" className="hover:text-blue-400 transition-colors">AES-256-GCM Encryption</Link></li>
            <li><Link href="/security-architecture" className="hover:text-blue-400 transition-colors">Tamper-Evident Hash Chain</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-blue-400 transition-colors">Ledger Integrity Scanner</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider mb-3">Security & Compliance</h4>
          <p className="text-slate-400 leading-relaxed mb-2">
            Canonical data hashing ensures 100% deterministic cryptographic proof. Sensitive fields are encrypted at rest.
          </p>
          <div className="p-2 rounded bg-navy-900 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">✓ Zero Blockchain Hype:</span> Uses database hash-chaining for local tamper-evidence without high gas costs or overhead.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
        <p>© 2026 CERTISEAL Infrastructure. Built for Smart India Hackathon.</p>
        <div className="flex gap-4">
          <span>Privacy-First Architecture</span>
          <span>•</span>
          <span>Role-Based Access Control</span>
          <span>•</span>
          <span>Audit Ledger</span>
        </div>
      </div>
    </footer>
  );
}
