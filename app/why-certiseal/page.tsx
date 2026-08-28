'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, Minus, Layers, Lock, Building2, Cpu, Eye, FileText } from 'lucide-react';

export default function WhyCertiSealPage() {
  const comparisonData = [
    {
      capability: 'Primary Purpose',
      digilocker: 'Citizen document storage repository',
      blockchain: 'Decentralized immutable ledger',
      qrOnly: 'Simple link to PDF document',
      certiseal: 'Evidence-based Trust & Verification Engine',
      certisealWinner: true
    },
    {
      capability: 'Institution Identity & Authorization',
      digilocker: 'Government issuer directory',
      blockchain: 'Varies / Public Key Address',
      qrOnly: 'Unverified URL domain',
      certiseal: 'UGC/AISHE Snapshot + Ed25519 Institution Keypairs',
      certisealWinner: true
    },
    {
      capability: 'Cryptographic Fingerprinting',
      digilocker: 'Document hash / digital signature',
      blockchain: 'Tx hash on block',
      qrOnly: 'None or static string',
      certiseal: 'SHA-256 Canonical JSON Payload Hashing',
      certisealWinner: true
    },
    {
      capability: 'Status-Aware Academic Lifecycle',
      digilocker: 'Static document lookup',
      blockchain: 'Immutable (hard to update status)',
      qrOnly: 'Binary (Found / Not Found)',
      certiseal: 'VERIFIED, ON_HOLD, RELEASED, REVOKED, TAMPERED',
      certisealWinner: true
    },
    {
      capability: 'Document-vs-Record Field Mismatch',
      digilocker: 'Manual visual inspection',
      blockchain: 'Not supported',
      qrOnly: 'Not supported',
      certiseal: 'Automated OCR & Field-Level Mismatch Table',
      certisealWinner: true
    },
    {
      capability: 'Tamper-Evident Evidence Chain',
      digilocker: 'Repository logs',
      blockchain: 'Public/Private Blockchain',
      qrOnly: 'None',
      certiseal: 'Genesis-to-Tip Append-Only Hash Ledger',
      certisealWinner: true
    },
    {
      capability: 'Explainable Verification Proofs',
      digilocker: 'Issuer verification check',
      blockchain: 'Requires block explorer',
      qrOnly: 'Raw webpage redirect',
      certiseal: 'Interactive "WHY CAN I TRUST THIS?" Evidence Panel',
      certisealWinner: true
    },
    {
      capability: 'Employer Verification Reports',
      digilocker: 'View document',
      blockchain: 'View transaction',
      qrOnly: 'View PDF',
      certiseal: 'Downloadable PDF HR Receipt (VER-2026-XXXXXXXX)',
      certisealWinner: true
    },
    {
      capability: 'Privacy-Preserving Selective Disclosure',
      digilocker: 'Full document exposure',
      blockchain: 'Varies',
      qrOnly: 'Full document exposure',
      certiseal: 'Student Wallet Disclosure Controls',
      certisealWinner: true
    }
  ];

  const trustLevels = [
    { level: 'LEVEL 1', name: 'INSTITUTION TRUST', desc: 'Is the institution known & listed in UGC/AISHE registries?', status: 'REGISTRY_LISTED / PARTICIPATING' },
    { level: 'LEVEL 2', name: 'ISSUER AUTHENTICATION', desc: 'Is the issuer authorized with valid Ed25519 signing credentials?', status: 'ACTIVE_KEYPAIR' },
    { level: 'LEVEL 3', name: 'CERTIFICATE REGISTRY', desc: 'Does the canonical certificate record exist in the trusted database?', status: 'RECORD_FOUND' },
    { level: 'LEVEL 4', name: 'DATA INTEGRITY', desc: 'Does structured data match the SHA-256 canonical hash fingerprint?', status: 'HASH_MATCH' },
    { level: 'LEVEL 5', name: 'DIGITAL SIGNATURE', desc: 'Is the Ed25519 signature verified against institution public key?', status: 'SIGNATURE_VALID' },
    { level: 'LEVEL 6', name: 'LEDGER CONTINUITY', desc: 'Is the append-only database hash chain intact from Genesis to Tip?', status: 'CHAIN_INTACT' },
    { level: 'LEVEL 7', name: 'DOCUMENT CONSISTENCY', desc: 'Does uploaded physical PDF data match trusted record field-by-field?', status: 'FIELDS_MATCH' },
    { level: 'LEVEL 8', name: 'LIFECYCLE STATUS', desc: 'What is the current academic administrative status of the credential?', status: 'VERIFIED / RELEASED' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Ecosystem Differentiation & Positioning
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">CERTISEAL</span> is Needed
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">
          CERTISEAL does not replace national repositories like DigiLocker or NAD. Instead, it acts as a <strong className="text-blue-400 font-semibold">Digital Trust and Verification Layer</strong> that provides explainable cryptographic evidence, lifecycle state awareness, and tamper detection for employers and institutions.
        </p>
      </div>

      {/* Core Question & Concept */}
      <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span>Addressing the Core Question: "Doesn't DigiLocker Already Do This?"</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="bg-navy-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>DigiLocker & NAD (Repository Layer)</span>
            </h3>
            <p className="leading-relaxed">
              DigiLocker is an exceptional national platform for citizens to store and retrieve official documents. However, DigiLocker functions primarily as a <strong>storage & access repository</strong>.
            </p>
            <ul className="space-y-1.5 text-slate-400 font-mono">
              <li>• Focuses on document issuance & citizen access</li>
              <li>• Limited explainable evidence chain for third-party HRs</li>
              <li>• Does not track administrative lifecycle (e.g., library holds)</li>
            </ul>
          </div>

          <div className="bg-navy-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>CERTISEAL (Trust & Verification Layer)</span>
            </h3>
            <p className="leading-relaxed">
              CERTISEAL provides an <strong>explainable evidence chain</strong> for immediate employer verification. It validates not just existence, but cryptographic integrity, lifecycle hold states, and field-level document tampering.
            </p>
            <ul className="space-y-1.5 text-slate-400 font-mono">
              <li>• 8-Level evidence-chain verification model</li>
              <li>• Status-aware engine (VERIFIED, ON_HOLD, REVOKED)</li>
              <li>• Field-by-field OCR mismatch comparison table</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Ecosystem Matrix</h2>
          <h3 className="text-2xl font-bold text-white">Capability Comparison</h3>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-navy-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy-950 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-4 px-4 font-bold">Capability / Feature</th>
                <th className="py-4 px-4">DigiLocker / NAD</th>
                <th className="py-4 px-4">Blockchain Platforms</th>
                <th className="py-4 px-4">Traditional QR</th>
                <th className="py-4 px-4 text-blue-400 bg-blue-950/40 font-bold border-l border-blue-900/50">CERTISEAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{row.capability}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.digilocker}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.blockchain}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.qrOnly}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400 bg-blue-950/20 border-l border-blue-900/50">
                    {row.certiseal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8-Level Trust Model */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Trust Hierarchy</h2>
          <h3 className="text-2xl font-bold text-white">The 8 Levels of CERTISEAL Verification</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trustLevels.map((lvl, idx) => (
            <div key={idx} className="bg-navy-900/70 p-5 rounded-xl border border-slate-800 flex items-start gap-4">
              <div className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-xs font-bold shrink-0">
                {lvl.level}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{lvl.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {lvl.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{lvl.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/50"
        >
          <span>Test the Verification Engine</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
