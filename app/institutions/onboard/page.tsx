'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, Upload, RefreshCw, AlertCircle } from 'lucide-react';

export default function InstitutionOnboardingPage() {
  const [officerName, setOfficerName] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [website, setWebsite] = useState('');
  const [documentationDetails, setDocumentationDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName || !officialEmail || !institutionName) {
      setErrorMessage('Please complete all required official identity fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/institutions/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerName,
          officerDesignation,
          officialDomainEmail: officialEmail,
          institutionName,
          officialWebsite: website,
          documentationDetails
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setSubmittedResult(data);
      } else {
        setErrorMessage(data.error || 'Onboarding submission failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Submission error.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Building2 className="w-4 h-4" />
          Institution Onboarding Portal
        </div>
        <h1 className="text-3xl font-extrabold text-white">Join CERTISEAL Trust Network</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Accredited educational institutions can submit official domain credentials to request participation and generate Ed25519 signing identities.
        </p>
      </div>

      {submittedResult ? (
        <div className="bg-navy-900/80 rounded-2xl border border-emerald-500/50 p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Onboarding Application Submitted</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your application for <strong className="text-white">{institutionName}</strong> has been recorded under Application ID <span className="font-mono text-emerald-400 font-bold">{submittedResult.id}</span>.
          </p>
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono">
            <p>Status: <span className="text-amber-400 font-bold">SUBMITTED (PENDING SUPER ADMIN REVIEW)</span></p>
            <p>Officer: {officerName} ({officialEmail})</p>
          </div>
          <Link
            href="/institutions"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            <span>View Trust Registry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-navy-900/70 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">1. Official Institution Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Official Institution Name *</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Madras Institute of Technology"
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Official Website URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://mitindia.edu"
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">2. Authorized Nodal Officer Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nodal Officer Full Name *</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="Dr. K. Ramanathan"
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Official Designation</label>
                <input
                  type="text"
                  value={officerDesignation}
                  onChange={(e) => setOfficerDesignation(e.target.value)}
                  placeholder="Dean of Academic Courses / Controller of Exams"
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-semibold">Official Domain Email (.edu / .ac.in / .gov.in) *</label>
                <input
                  type="email"
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="dean@mitindia.edu"
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-slate-300 font-semibold">UGC / AICTE Accreditation Reference / Notes</label>
            <textarea
              rows={3}
              value={documentationDetails}
              onChange={(e) => setDocumentationDetails(e.target.value)}
              placeholder="Provide AISHE Code, UGC recognition order reference number..."
              className="w-full px-3.5 py-2 bg-navy-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950 border border-red-700 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recording Onboarding Request...</span>
              </>
            ) : (
              <>
                <span>SUBMIT ONBOARDING APPLICATION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
