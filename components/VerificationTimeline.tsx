'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, Database, KeyRound, Cpu } from 'lucide-react';

interface TimelineProps {
  result: 'VERIFIED' | 'ON_HOLD' | 'RELEASED' | 'REVOKED' | 'TAMPERED' | 'NOT_FOUND';
  cryptographicProof: {
    hashMatched: boolean;
    signatureValid: boolean;
    ledgerIntegrityValid: boolean;
  };
  documentMatch?: boolean;
}

export default function VerificationTimeline({ result, cryptographicProof, documentMatch = true }: TimelineProps) {
  const steps = [
    {
      id: 1,
      title: 'Institutional Registry Check',
      desc: 'Verify institution accreditation & active status',
      icon: ShieldCheck,
      isPassed: result !== 'NOT_FOUND',
      statusText: result === 'NOT_FOUND' ? 'Record Not Found' : 'Passed'
    },
    {
      id: 2,
      title: 'Canonical SHA-256 Fingerprint',
      desc: 'Recalculate deterministic hash from structured payload',
      icon: Cpu,
      isPassed: cryptographicProof.hashMatched,
      statusText: cryptographicProof.hashMatched ? 'Matched' : 'Hash Mismatch'
    },
    {
      id: 3,
      title: 'Ed25519 Digital Signature',
      desc: 'Validate signature against institution public key',
      icon: KeyRound,
      isPassed: cryptographicProof.signatureValid,
      statusText: cryptographicProof.signatureValid ? 'Valid Signature' : 'Invalid Signature'
    },
    {
      id: 4,
      title: 'Tamper-Evident Ledger Integrity',
      desc: 'Verify block hash-chain from Genesis record',
      icon: Database,
      isPassed: cryptographicProof.ledgerIntegrityValid,
      statusText: cryptographicProof.ledgerIntegrityValid ? 'Chain Verified' : 'Ledger Corrupted'
    },
    {
      id: 5,
      title: 'Status & Document Compliance',
      desc: 'Evaluate administrative state & field match',
      icon: Clock,
      isPassed: result !== 'TAMPERED' && documentMatch,
      statusText: result === 'ON_HOLD' ? 'On Administrative Hold' : result === 'REVOKED' ? 'Revoked' : result === 'TAMPERED' ? 'Tampering Detected' : 'Verified'
    }
  ];

  return (
    <div className="w-full bg-navy-900/60 rounded-xl p-5 border border-slate-800 my-6">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Verification Execution Timeline
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                step.isPassed
                  ? 'bg-slate-900/80 border-emerald-500/40 text-slate-200'
                  : 'bg-red-950/20 border-red-500/50 text-red-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${step.isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {step.isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className="text-xs font-semibold leading-snug">{step.title}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">{step.desc}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Step 0{step.id}</span>
                <span className={`text-[10px] font-bold ${step.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {step.statusText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
