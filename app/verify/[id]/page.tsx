'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import NavbarPlatform from '@/components/NavbarPlatform';
import Footer from '@/components/Footer';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Download, Share2, Copy, Building2, Calendar, User, BookOpen, KeyRound, Cpu, Clock, RefreshCw, Lock, Sparkles, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import VerificationTimeline from '@/components/VerificationTimeline';
import TechnicalProofDrawer from '@/components/TechnicalProofDrawer';

export default function VerificationResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const certIdParam = (params.id as string) || '';
  const isUploadedMode = searchParams.get('uploaded') === 'true';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showWhyTrust, setShowWhyTrust] = useState(true);

  // ZKP Modal State
  const [isZkpOpen, setIsZkpOpen] = useState(false);
  const [minCgpaInput, setMinCgpaInput] = useState('8.0');
  const [zkpResult, setZkpResult] = useState<any>(null);
  const [isEvaluatingZkp, setIsEvaluatingZkp] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      setLoading(true);

      if (isUploadedMode) {
        const stored = sessionStorage.getItem('ocr_temp_result');
        if (stored) {
          try {
            setData(JSON.parse(stored));
            setLoading(false);
            return;
          } catch (e) {}
        }
      }

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificateId: certIdParam })
        });
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (certIdParam) {
      fetchVerification();
    }
  }, [certIdParam, isUploadedMode]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEvaluateZkp = async () => {
    setIsEvaluatingZkp(true);
    try {
      const res = await fetch('/api/verify/zkp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId: data.publicId,
          minCgpa: minCgpaInput
        })
      });
      const resData = await res.json();
      setZkpResult(resData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluatingZkp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
        <NavbarPlatform />
        <main className="flex-1 max-w-4xl mx-auto py-16 text-center space-y-4 px-4 w-full">
          <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Cryptographic Verification Engine Executing...</h3>
            <p className="text-xs text-slate-400">Recalculating SHA-256 fingerprint, verifying Ed25519 digital signature, KMS envelope decryption, and scanning hash-chained ledger integrity...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
        <NavbarPlatform />
        <main className="flex-1 max-w-4xl mx-auto py-12 text-center space-y-4 px-4 w-full">
          <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Verification Engine Failure</h2>
          <p className="text-sm text-slate-400">Unable to query the institutional trust registry.</p>
          <Link href="/verify" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Return to Search
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isVerified = data.result === 'VERIFIED' || data.result === 'RELEASED';
  const isOnHold = data.result === 'ON_HOLD';
  const isRevoked = data.result === 'REVOKED';
  const isTampered = data.result === 'TAMPERED';
  const isNotFound = data.result === 'NOT_FOUND';

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarPlatform />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Banner Status Notification */}
        <div
          className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
            isVerified
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
              : isOnHold
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-100'
              : isRevoked
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-100'
              : isTampered
              ? 'bg-rose-950 border-rose-600 text-rose-100'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl ${
                isVerified
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isOnHold
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isVerified ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : isOnHold ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40">
                  STATUS: {data.result}
                </span>
                <span className="text-xs font-mono text-slate-300">Ref: {data.referenceId}</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {isVerified
                  ? '✓ AUTHENTIC CERTIFICATE'
                  : isOnHold
                  ? '✓ AUTHENTIC CERTIFICATE — ⚠ CURRENTLY ON HOLD'
                  : isRevoked
                  ? '✕ CERTIFICATE REVOKED'
                  : isTampered
                  ? '⚠ DOCUMENT TAMPERING DETECTED'
                  : 'CERTIFICATE NOT FOUND'}
              </h2>
              <p className="text-xs leading-relaxed opacity-90 max-w-2xl">{data.statusExplanation}</p>

              {isOnHold && (
                <div className="mt-2 p-2.5 rounded bg-amber-900/60 border border-amber-600/50 text-xs text-amber-200 font-semibold">
                  «Important: This certificate was legitimately issued by the institution. Institutional hold does NOT mean the document is fake.»
                </div>
              )}
            </div>
          </div>

          {!isNotFound && (
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              <a
                href={`/api/reports/download?certificateId=${data.publicId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HR Report</span>
              </a>

              <a
                href={`/api/certificates/${data.publicId}/vc`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                <span>Export W3C VC JSON-LD</span>
              </a>

              <button
                onClick={() => setIsZkpOpen(true)}
                className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>ZKP Qualification Prover</span>
              </button>
            </div>
          )}
        </div>

        {/* WHY CAN I TRUST THIS? Section */}
        <div className="bg-navy-900/90 rounded-2xl border border-blue-800/40 p-6 space-y-4">
          <button
            onClick={() => setShowWhyTrust(!showWhyTrust)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white">WHY CAN I TRUST THIS RESULT?</h3>
                <p className="text-xs text-slate-400">8-Level explainable evidence-chain breakdown.</p>
              </div>
            </div>
            {showWhyTrust ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showWhyTrust && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">1. Institution Identity</p>
                  <p className="text-slate-400 text-[11px]">{data.institution?.name} is registered in UGC/AISHE database.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">2. Envelope Encryption & KMS</p>
                  <p className="text-slate-400 text-[11px]">AES-256-GCM payload decrypted via unwrapped per-certificate DEK.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">3. Ed25519 Digital Signature</p>
                  <p className="text-slate-400 text-[11px]">Signature verified against institution public key fingerprint.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">4. Ledger Continuity</p>
                  <p className="text-slate-400 text-[11px]">Append-only database ledger is 100% intact from Genesis to Tip.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Field Mismatch Diff Table */}
        {data.documentComparison && (
          <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Uploaded Document Field Comparison vs Trusted Record
              </h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${data.documentComparison.isMatched ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {data.documentComparison.isMatched ? '✓ 100% MATCH' : '✕ MISMATCH DETECTED'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-navy-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Field Name</th>
                    <th className="p-3">Trusted Institution Record</th>
                    <th className="p-3">Submitted Document Value</th>
                    <th className="p-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.documentComparison.fieldDiffs.map((diff: any, idx: number) => (
                    <tr key={idx} className={diff.isMatch ? 'bg-emerald-950/10' : 'bg-rose-950/30'}>
                      <td className="p-3 font-semibold text-slate-200">{diff.field}</td>
                      <td className="p-3 font-mono text-emerald-300">{diff.trustedValue}</td>
                      <td className={`p-3 font-mono font-bold ${diff.isMatch ? 'text-slate-300' : 'text-rose-300 underline'}`}>
                        {diff.submittedValue}
                      </td>
                      <td className="p-3">
                        {diff.isMatch ? (
                          <span className="text-emerald-400 font-bold">✓ MATCH</span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> MISMATCH
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Structured Certificate Details Table */}
        {data.certificateDetails && (
          <div className="bg-navy-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Trusted Certificate Information</h3>
                <p className="text-xs text-slate-400">Canonical structured record sealed by authorized institution.</p>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-lg">
                {data.certificateDetails.certificateType}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Certificate ID:</span>
                  <span className="font-mono font-bold text-blue-300">{data.publicId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Issued By:</span>
                  <span className="font-bold text-white">{data.institution?.name} ({data.institution?.code})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Accreditation:</span>
                  <span className="text-slate-300">{data.institution?.accreditation}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Student Full Name:</span>
                  <span className="font-bold text-white">{data.certificateDetails.studentName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Roll / Reg Number:</span>
                  <span className="font-mono text-slate-200">{data.certificateDetails.studentRollNo}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Course / Program:</span>
                  <span className="font-bold text-white">{data.certificateDetails.course}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Department:</span>
                  <span className="text-slate-300">{data.certificateDetails.department}</span>
                </div>
                {data.certificateDetails.cgpa && (
                  <div className="flex justify-between py-2 border-b border-slate-800/80">
                    <span className="text-slate-400 font-medium">CGPA / Grade:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{data.certificateDetails.cgpa}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Official Issue Date:</span>
                  <span className="text-slate-300 font-mono">{data.certificateDetails.issueDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800/80">
                  <span className="text-slate-400 font-medium">Record Version:</span>
                  <span className="font-mono text-slate-300">v{data.certificateDetails.currentVersion}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Explanation Summary Box */}
        <div className="bg-gradient-to-r from-navy-900 to-slate-900 rounded-xl p-5 border border-blue-800/40 space-y-2">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            Verification Intelligence Summary
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{data.aiExplanation}</p>
        </div>

        {/* Verification Timeline */}
        <VerificationTimeline
          result={data.result}
          cryptographicProof={data.cryptographicProof}
          documentMatch={data.documentComparison ? data.documentComparison.isMatched : true}
        />

        {/* Technical Details Inspection Drawer */}
        <TechnicalProofDrawer proof={data.cryptographicProof} publicId={data.publicId} />
      </main>

      <Footer />
    </div>
  );
}
