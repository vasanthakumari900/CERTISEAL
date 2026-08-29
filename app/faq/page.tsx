'use client';

import React, { useState } from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, ArrowRight } from 'lucide-react';

const FAQS = [
  {
    q: 'What is CERTX?',
    a: 'CERTX is a digital trust architecture for academic certificate issuance and verification. It uses Ed25519 digital signatures, envelope encryption with per-certificate DEKs, KMS abstraction, and an immutable hash-chain ledger to prevent document forgery.'
  },
  {
    q: 'How does an institution get onboarded?',
    a: 'Institutions click "Apply for CERTX Access" on the landing site. Submissions enter the CERTX Admin Portal for Super Admin review. Upon approval, the institution record is activated and Institution Admin credentials are provisioned.'
  },
  {
    q: 'What is Envelope Encryption with Per-Certificate DEK?',
    a: 'Instead of encrypting all student data with a single static master key, CERTX generates a unique 256-bit Data Encryption Key (DEK) for every issued certificate. The DEK encrypts the payload, and the DEK itself is wrapped using a Key Encryption Key (KEK) via a KMS provider interface.'
  },
  {
    q: 'How does the 8-Level Verification Engine work?',
    a: 'When a certificate is verified, CERTX evaluates 8 explicit levels: (1) Institution Identity, (2) Issuer Authentication, (3) Certificate Registry, (4) SHA-256 Hash Integrity, (5) Ed25519 Signature, (6) Hash-Chain Ledger Audit, (7) Document OCR Consistency, and (8) Lifecycle Status (VERIFIED, ON_HOLD, RELEASED, REVOKED).'
  },
  {
    q: 'What happens if an organization is suspended by Super Admin?',
    a: 'If a Super Admin suspends an organization in the Admin Portal, the server-side RBAC immediately blocks faculty and admins of that institution from issuing new certificates or performing administrative actions.'
  },
  {
    q: 'Are certificates stored in plain text in the database?',
    a: 'No. Sensitive certificate payloads are envelope-encrypted using AES-256-GCM and per-certificate DEKs wrapped via KMS. Cryptographic secrets and private keys are never exposed to the client browser.'
  }
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CERTX Technical & Architectural FAQ
          </h1>
          <p className="mt-3 text-slate-400 text-sm">
            Answers to common questions regarding onboarding, cryptography, envelope encryption, KMS, and verification.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-navy-900 border border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:bg-slate-900/60 transition-all"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-navy-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 text-center max-w-md mx-auto space-y-3">
          <h3 className="text-sm font-bold text-white">Have More Questions?</h3>
          <p className="text-xs text-slate-400">
            Submit an access application or contact our engineering team.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs"
          >
            <span>Apply for CERTX Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
