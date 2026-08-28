import React from 'react';
import { ShieldCheck, Lock, KeyRound, Database, FileCheck, Layers, Eye } from 'lucide-react';

export default function SecurityArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
          <Lock className="w-4 h-4" />
          Technical Security Specifications
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">CERTISEAL Security Architecture</h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Comprehensive breakdown of identity management, cryptographic primitives, payload encryption, hash-chaining, and audit logging.
        </p>
      </div>

      {/* Security Pillars Table */}
      <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
        <h3 className="text-base font-bold text-white mb-2">Cryptographic Primitive Mapping</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-navy-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Security Objective</th>
                <th className="p-3">Algorithm / Primitive</th>
                <th className="p-3">Implementation Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-3 font-semibold text-white">Integrity & Fingerprinting</td>
                <td className="p-3 font-mono text-blue-400">SHA-256</td>
                <td className="p-3">Generates 256-bit deterministic digest over canonicalized certificate payload.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Authenticity & Non-Repudiation</td>
                <td className="p-3 font-mono text-purple-400">Ed25519 (Edwards-curve DSA)</td>
                <td className="p-3">Signs certificate hash with institution private key; verified via public key.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Confidentiality At Rest</td>
                <td className="p-3 font-mono text-amber-400">AES-256-GCM</td>
                <td className="p-3">Encrypts sensitive student fields with authenticated tag verification.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Tamper Evidence</td>
                <td className="p-3 font-mono text-cyan-400">Hash-Chained Audit Ledger</td>
                <td className="p-3">Links current block hash to previous block hash starting from Genesis block.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">Access Control</td>
                <td className="p-3 font-mono text-emerald-400">Role-Based Access Control (RBAC)</td>
                <td className="p-3">5 distinct roles (Super Admin, Inst Admin, Faculty, Employer, Student).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical FAQ & Limitations Honesty */}
      <div className="bg-navy-950 rounded-2xl border border-slate-800 p-8 space-y-6">
        <h3 className="text-lg font-bold text-white">Technical Integrity & Implementation Scope</h3>
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-blue-400">1. Why Database Hash-Chaining instead of Public Blockchain?</h4>
            <p className="text-slate-400">
              Public blockchains incur expensive gas fees, latency, and compliance issues under privacy laws (such as GDPR right to erasure). Database-backed hash chaining provides identical cryptographic tamper-evidence without high infrastructure costs or slow response times.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-blue-400">2. How does OCR document upload work?</h4>
            <p className="text-slate-400">
              OCR serves exclusively as an extraction assistance layer for uploaded documents. Cryptographic trust is determined solely by comparing OCR-extracted fields against the signed institutional record.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800 space-y-1">
            <h4 className="font-bold text-blue-400">3. How is Status-Aware verification enforced?</h4>
            <p className="text-slate-400">
              When an institution places a certificate on administrative hold (e.g. pending clearance), the system cryptographically verifies origin while returning state <span className="font-mono text-amber-300 font-bold">ON_HOLD</span> with an explicit note that the certificate is authentic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
