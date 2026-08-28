'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cpu, Lock, KeyRound, Database, Search, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { canonicalize } from '@/lib/crypto/canonical';

export default function HowItWorksPage() {
  const [testCgpa, setTestCgpa] = useState('8.72');
  const [testName, setTestName] = useState('Rahul Kumar');

  // Dynamic demonstration of SHA-256 fingerprint recalculation on input change
  const samplePayload = {
    certificateId: 'CERT-2026-000123',
    institutionCode: 'NITD',
    studentName: testName,
    studentRollNo: '23CS101',
    course: 'B.Sc Computer Science',
    cgpa: testCgpa,
    issueDate: '2026-08-15'
  };

  const canonicalString = canonicalize(samplePayload);

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Cpu className="w-4 h-4" />
          Interactive Cryptographic Visualization
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How Verification Works</h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Explore how CERTISEAL achieves tamper-evident security without public blockchain overhead using deterministic canonicalization, Ed25519 signatures, and hash-chaining.
        </p>
      </div>

      {/* Interactive Cryptographic Sandbox */}
      <div className="bg-navy-900/80 rounded-2xl border border-blue-500/40 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live SHA-256 Fingerprint Recalculation Sandbox
            </h3>
            <p className="text-xs text-slate-400">Modify field values below to observe how the canonical string and SHA-256 hash change instantly.</p>
          </div>
          <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg">Judges Live Sandbox</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Student Name:</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300">CGPA Value (Try changing 8.72 to 9.72):</label>
            <input
              type="text"
              value={testCgpa}
              onChange={(e) => setTestCgpa(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div>
            <span className="text-slate-400 font-sans font-semibold">Sorted Canonical JSON Output:</span>
            <pre className="mt-1.5 p-3 rounded-lg bg-black/60 border border-slate-800 text-blue-300 overflow-x-auto whitespace-pre-wrap break-all">
              {canonicalString}
            </pre>
          </div>
        </div>
      </div>

      {/* 6 Step Interactive Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 font-bold font-mono text-xs">01</div>
            <h4 className="text-sm font-bold text-white">Canonical Serialization</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All certificate fields are converted into a standardized JSON structure with key-sorting and whitespace normalization, eliminating false hash mismatches due to formatting differences.
          </p>
        </div>

        <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 font-bold font-mono text-xs">02</div>
            <h4 className="text-sm font-bold text-white">SHA-256 Fingerprinting</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The canonical payload is passed to SHA-256, generating a unique 64-character hex cryptographic fingerprint that uniquely identifies the exact certificate state.
          </p>
        </div>

        <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold font-mono text-xs">03</div>
            <h4 className="text-sm font-bold text-white">Ed25519 Digital Signature</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The institution signs the SHA-256 fingerprint using its private key. Verification uses the institution's public key, ensuring proof of origin and non-repudiation.
          </p>
        </div>

        <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs">04</div>
            <h4 className="text-sm font-bold text-white">AES-256-GCM Payload Encryption</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sensitive student identifiers are encrypted using AES-256-GCM before storage, preserving student privacy while remaining verifiable.
          </p>
        </div>

        <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs">05</div>
            <h4 className="text-sm font-bold text-white">Append-Only Hash-Chained Ledger</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every record operation embeds the hash of the preceding block (`previous_hash`). Any silent database modification invalidates the chain integrity.
          </p>
        </div>

        <div className="bg-navy-900/60 p-6 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold font-mono text-xs">06</div>
            <h4 className="text-sm font-bold text-white">Status-Aware Verification Engine</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upon lookup or QR scan, CERTISEAL executes 12 cryptographic checks and evaluates the lifecycle status (`VERIFIED`, `ON_HOLD`, `RELEASED`, `REVOKED`, `TAMPERED`).
          </p>
        </div>
      </div>
    </div>
  );
}
