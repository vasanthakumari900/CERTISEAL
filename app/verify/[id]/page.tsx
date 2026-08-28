'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, FileText, Download, Share2, Copy, Building2, Calendar, User, BookOpen, KeyRound, Cpu, Clock, RefreshCw, Lock, Sparkles, ExternalLink } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">Cryptographic Verification Engine Executing...</h3>
          <p className="text-xs text-slate-400">Recalculating SHA-256 fingerprint, verifying Ed25519 digital signature, and scanning hash-chained ledger integrity...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Verification Engine Failure</h2>
        <p className="text-sm text-slate-400">Unable to query the institutional trust registry.</p>
        <Link href="/verify" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
          Return to Search
        </Link>
      </div>
    );
  }

  const isVerified = data.result === 'VERIFIED' || data.result === 'RELEASED';
  const isOnHold = data.result === 'ON_HOLD';
  const isRevoked = data.result === 'REVOKED';
  const isTampered = data.result === 'TAMPERED';
  const isNotFound = data.result === 'NOT_FOUND';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Top Banner Status Notification */}
      <div
        className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
          isVerified
            ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
            : isOnHold
            ? 'bg-amber-950/80 border-amber-500/60 text-amber-100'
            : isRevoked
            ? 'bg-red-950/80 border-red-500/60 text-red-100'
            : isTampered
            ? 'bg-red-950 border-red-600 text-red-100'
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
                : 'bg-red-500/20 text-red-400'
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

        {/* Action Buttons */}
        {!isNotFound && (
          <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
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
              <span>Zero-Knowledge Proof (ZKP)</span>
            </button>
          </div>
        )}
      </div>

      {/* Field Mismatch Diff Table (If Document Upload Tampering Detected) */}
      {data.documentComparison && (
        <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Uploaded Document Field Comparison vs Trusted Record
            </h3>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${data.documentComparison.isMatched ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
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
                  <tr key={idx} className={diff.isMatch ? 'bg-emerald-950/10' : 'bg-red-950/30'}>
                    <td className="p-3 font-semibold text-slate-200">{diff.field}</td>
                    <td className="p-3 font-mono text-emerald-300">{diff.trustedValue}</td>
                    <td className={`p-3 font-mono font-bold ${diff.isMatch ? 'text-slate-300' : 'text-red-300 underline'}`}>
                      {diff.submittedValue}
                    </td>
                    <td className="p-3">
                      {diff.isMatch ? (
                        <span className="text-emerald-400 font-bold">✓ MATCH</span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">
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

      {/* Technical Details Inspection Drawer for Judges */}
      <TechnicalProofDrawer proof={data.cryptographicProof} publicId={data.publicId} />

      {/* ZKP Modal */}
      {isZkpOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-950 border border-indigo-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Zero-Knowledge Qualification Prover</h3>
              </div>
              <button onClick={() => setIsZkpOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Verify candidate eligibility threshold criteria (e.g. CGPA ≥ 8.0) using Zero-Knowledge Proofs **without revealing the candidate's exact CGPA grade**.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Set Eligibility CGPA Threshold Criteria:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={minCgpaInput}
                    onChange={(e) => setMinCgpaInput(e.target.value)}
                    placeholder="e.g. 8.0"
                    className="flex-1 px-3.5 py-2 bg-navy-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleEvaluateZkp}
                    disabled={isEvaluatingZkp}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all"
                  >
                    {isEvaluatingZkp ? 'Proving...' : 'Evaluate ZKP Proof'}
                  </button>
                </div>
              </div>

              {zkpResult && (
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans font-semibold">Eligibility Result:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${zkpResult.isEligible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {zkpResult.isEligible ? '✓ QUALIFIED (MEETS CRITERIA)' : '✕ DOES NOT MEET CRITERIA'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">Evaluated: <span className="text-indigo-300">{zkpResult.criteriaEvaluated}</span></p>
                  <p className="text-[10px] text-cyan-300 break-all bg-black/50 p-2 rounded border border-slate-800">
                    {zkpResult.zkpProofHash}
                  </p>
                  <p className="text-[10px] text-slate-400 font-sans italic">{zkpResult.disclosureNotice}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsZkpOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Close Prover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
