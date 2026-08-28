'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, Lock, KeyRound, Database, FileCode } from 'lucide-react';

interface ProofDrawerProps {
  proof: {
    canonicalHash: string;
    recalculatedHash: string;
    hashMatched: boolean;
    digitalSignature: string;
    signatureValid: boolean;
    algorithm: string;
    publicKeyFingerprint: string;
    ledgerIntegrityValid: boolean;
    encryptedDataPayload: string;
  };
  publicId: string;
}

export default function TechnicalProofDrawer({ proof, publicId }: ProofDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-navy-950 rounded-xl border border-slate-800 overflow-hidden my-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between bg-navy-900/80 hover:bg-navy-900 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Technical Cryptographic Proof Details
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">
            Judges Inspection Mode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{isOpen ? 'Hide Inspection' : 'View Inspection'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 space-y-4 font-mono text-xs text-slate-300 bg-slate-950 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" /> SHA-256 Fingerprint
                </span>
                <span className={proof.hashMatched ? 'text-emerald-400' : 'text-red-400'}>
                  {proof.hashMatched ? '✓ MATCHED' : '✕ MISMATCH'}
                </span>
              </div>
              <p className="text-[11px] text-blue-300 break-all bg-black/40 p-2 rounded border border-slate-800">
                {proof.canonicalHash}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" /> Ed25519 Digital Signature
                </span>
                <span className={proof.signatureValid ? 'text-emerald-400' : 'text-red-400'}>
                  {proof.signatureValid ? '✓ VALID' : '✕ INVALID'}
                </span>
              </div>
              <p className="text-[11px] text-purple-300 break-all bg-black/40 p-2 rounded border border-slate-800">
                {proof.digitalSignature}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Public Key Reference</p>
              <p className="text-cyan-400 font-bold">{proof.publicKeyFingerprint}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Signature Algorithm</p>
              <p className="text-slate-200 font-bold">{proof.algorithm}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <p className="text-slate-400 text-[11px] mb-1 font-sans font-semibold">Ledger Hash Chain</p>
              <p className={proof.ledgerIntegrityValid ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {proof.ledgerIntegrityValid ? '✓ Genesis-to-Tip Valid' : '✕ Chain Corrupted'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 font-sans font-semibold text-xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> AES-256-GCM Encrypted Student Data Payload
              </span>
              <span className="text-[10px] text-slate-400">Confidentiality Protected</span>
            </div>
            <p className="text-[10px] text-amber-300/80 break-all bg-black/40 p-2 rounded border border-slate-800 font-mono">
              {proof.encryptedDataPayload}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
