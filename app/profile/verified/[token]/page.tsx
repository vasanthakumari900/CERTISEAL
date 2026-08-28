'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ShieldCheck, CheckCircle2, EyeOff, Lock, Building2, User, BookOpen, Download, ExternalLink } from 'lucide-react';

export default function StudentVerifiedProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenParam = (params.token as string) || '';

  const hideCgpa = searchParams.get('hideCgpa') === 'true';
  const hideRoll = searchParams.get('hideRoll') === 'true';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Decode demo profile token or fetch candidate verification data
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ certificateId: 'CERT-2026-000123' })
        });
        const result = await res.json();
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [tokenParam]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-slate-400 font-mono text-xs">
        Loading Privacy-Preserving Candidate Credential Profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-blue-950 via-navy-900 to-indigo-950 p-6 rounded-2xl border border-blue-800/50 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Verified Candidate Public Profile
        </div>
        <h1 className="text-2xl font-extrabold text-white">Rahul Kumar</h1>
        <p className="text-xs text-slate-300">
          This public profile presents verified academic credentials sealed cryptographically by authorized educational institutions.
        </p>
      </div>

      {/* Selective Disclosure Notice */}
      <div className="p-4 rounded-xl bg-navy-900/80 border border-indigo-500/30 text-xs flex items-center gap-3">
        <EyeOff className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="text-slate-300">
          <span className="font-bold text-white">Privacy-Preserving Selective Disclosure Active:</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            The student has configured custom field permissions for this public link. Sensitive details are hidden per candidate preferences.
          </p>
        </div>
      </div>

      {/* Credential Card */}
      {data && data.certificateDetails && (
        <div className="bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                {data.certificateDetails.certificateType}
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">{data.certificateDetails.course}</h3>
              <p className="text-xs text-slate-400">{data.institution?.name}</p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              ✓ VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Student Name:</span>
                <span className="font-bold text-white">{data.certificateDetails.studentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Roll Number:</span>
                {hideRoll ? (
                  <span className="text-indigo-400 font-mono text-[11px] italic">[Hidden by Candidate]</span>
                ) : (
                  <span className="font-mono text-slate-200">{data.certificateDetails.studentRollNo}</span>
                )}
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Issued By:</span>
                <span className="font-bold text-slate-200">{data.institution?.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Course Program:</span>
                <span className="font-bold text-white">{data.certificateDetails.course}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">CGPA / Grade:</span>
                {hideCgpa ? (
                  <span className="text-indigo-400 font-mono text-[11px] italic">[Hidden by Candidate]</span>
                ) : (
                  <span className="font-bold text-emerald-400 font-mono">{data.certificateDetails.cgpa}</span>
                )}
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400 font-medium">Issue Date:</span>
                <span className="font-mono text-slate-300">{data.certificateDetails.issueDate}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <a
              href={`/verify/${data.publicId}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify Full Cryptographic Evidence</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
