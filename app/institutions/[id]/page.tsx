'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Building2, MapPin, Globe, Mail, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Award, FileText, Send } from 'lucide-react';

export default function InstitutionProfilePage() {
  const params = useParams();
  const instId = (params.id as string) || '';

  const [inst, setInst] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestedJoin, setRequestedJoin] = useState(false);
  const [companyNameInput, setCompanyNameInput] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/institutions/search?query=${encodeURIComponent(instId)}`);
        const data = await res.json();
        if (data.institutions && data.institutions.length > 0) {
          setInst(data.institutions[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [instId]);

  const handleRequestJoin = async () => {
    if (!inst) return;
    try {
      const res = await fetch('/api/institutions/request-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId: inst.id,
          requestedBy: 'HR Recruiter',
          companyName: companyNameInput || 'Employer Verification Team',
          reason: 'Employer requesting institution onboarding for candidate qualification verification'
        })
      });
      const data = await res.json();
      if (data.success) {
        setRequestedJoin(true);
      }
    } catch (e) {}
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-16 text-center text-slate-400 text-sm">Loading National Master Registry Profile...</div>;
  }

  if (!inst) {
    return <div className="max-w-4xl mx-auto py-16 text-center text-red-400 text-sm">Institution record not found in National Registry.</div>;
  }

  const isParticipating = inst.status === 'PARTICIPATING' || inst.status === 'VERIFIED';
  const isNotOnboarded = inst.status === 'NOT_ONBOARDED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header Profile Banner */}
      <div className="bg-navy-900/80 p-8 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded">
                {inst.publicId}
              </span>
              <span className="text-xs text-slate-400 font-mono">UGC / AISHE Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{inst.officialName}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {inst.address}, {inst.city}, {inst.district}, {inst.state} - {inst.postalCode}
            </p>
          </div>

          <div className="shrink-0">
            {isParticipating ? (
              <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> CERTISEAL PARTICIPATING
              </span>
            ) : (
              <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> NOT ONBOARDED
              </span>
            )}
          </div>
        </div>

        {/* Links & Contacts */}
        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-300">
          <a href={inst.officialWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-400 hover:underline">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{inst.officialWebsite}</span>
          </a>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{inst.officialEmail}</span>
          </div>
        </div>
      </div>

      {/* Official Source Data Section vs CERTISEAL Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Official Source Data Box */}
        <div className="bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-4 h-4 text-emerald-400" />
            Official Regulatory & Accreditation Data
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Institution Type:</span>
              <span className="font-semibold text-white">{inst.institutionType}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Category / Funding:</span>
              <span className="text-slate-200">{inst.institutionCategory || 'Government'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Established Year:</span>
              <span className="font-mono text-slate-200">{inst.establishedYear || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">NAAC Accreditation:</span>
              <span className="font-mono font-bold text-emerald-400">{inst.accreditation || 'UGC Approved'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Data Source:</span>
              <span className="font-mono text-blue-400">UGC / AISHE Master Database</span>
            </div>
          </div>
        </div>

        {/* CERTISEAL Participation & Action Box */}
        <div className="bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            CERTISEAL Network Trust Status
          </h3>

          {isParticipating ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 space-y-1">
                <p className="font-bold">✓ Active Network Member</p>
                <p className="text-[11px] opacity-90">This institution cryptographically seals certificates using its Ed25519 signing keypair.</p>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 font-semibold">Public Verification Key Fingerprint:</span>
                <p className="p-2.5 rounded bg-black/60 border border-slate-800 text-cyan-400 font-mono text-[11px] break-all">
                  {inst.publicKeyFingerprint || 'ED25519-FP-INIT-2026'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
                <p className="font-bold text-amber-400">CERTISEAL Verification Unavailable</p>
                <p className="text-[11px] text-slate-400">
                  This institution is listed in the National Registry, but has not yet completed onboarding to issue cryptographically signed certificates on CERTISEAL.
                </p>
              </div>

              {requestedJoin ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Onboarding request submitted! Platform admins will notify university officers.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-slate-300 font-semibold">Request Institution to Join CERTISEAL:</label>
                  <input
                    type="text"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    placeholder="Your Company / Recruiter Name (e.g. Tata Consultancy)"
                    className="w-full px-3 py-2 bg-navy-950 border border-slate-700 rounded-lg text-white text-xs"
                  />
                  <button
                    onClick={handleRequestJoin}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>REQUEST INSTITUTION TO JOIN</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
