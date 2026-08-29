'use client';

import React, { useState } from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import { ShieldCheck, Building2, Send, CheckCircle2, AlertCircle, ArrowLeft, FileText, Lock } from 'lucide-react';
import Link from 'next/link';

export default function AccessApplicationPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: 'University',
    institutionOrOrgId: '',
    officialEmail: '',
    contactPerson: '',
    designation: '',
    phone: '',
    state: 'Tamil Nadu',
    district: '',
    city: '',
    officialWebsite: '',
    address: '',
    reason: '',
    expectedUsers: '10-50',
    expectedVolume: '1,000 - 10,000/year',
    supportingDocs: '',
    declarationConsent: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData(prev => ({ ...prev, [target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Application submission failed.');
      }

      setSubmissionResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>CERTX ECOSYSTEM ONBOARDING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Apply for CERTX Platform Access
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-2xl mx-auto">
            Submit your institution or organization details to request onboarding into the CERTX Digital Trust Network.
            All applications are subjected to administrative verification by the Super Admin.
          </p>
        </div>

        {submissionResult ? (
          <div className="bg-navy-900 border border-emerald-500/40 rounded-2xl p-8 shadow-2xl text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Application Submitted Successfully</h2>
            <p className="text-sm text-slate-300 mt-2">
              Your organization onboarding request has been logged in the CERTX Governance System.
            </p>

            <div className="my-6 p-4 rounded-xl bg-navy-950 border border-slate-800 text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">CERTX Application ID:</span>
                <span className="font-mono font-bold text-blue-400">{submissionResult.applicationId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  {submissionResult.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Organization:</span>
                <span className="text-white font-medium">{submissionResult.application?.organizationName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Official Email:</span>
                <span className="text-slate-300">{submissionResult.application?.officialEmail}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-lg mx-auto mb-6">
              Our Super Admin review team will evaluate your credentials and supporting documents.
              Once approved, your Institution Admin credentials will be activated for platform login.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                Return to Landing Website
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium"
              >
                Check Login Portal
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-navy-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Organization Identity */}
            <div>
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>1. Organization & Institutional Identity</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    name="organizationName"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Madras Institute of Technology"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Organization Type *</label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="University">University</option>
                    <option value="IIT / NIT">IIT / NIT / IIIT</option>
                    <option value="Engineering College">Autonomous / Engineering College</option>
                    <option value="Government Agency">Government / Statutory Body</option>
                    <option value="HR Verification Enterprise">Enterprise / HR Verification Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">AISHE Code / Govt Reg No</label>
                  <input
                    type="text"
                    name="institutionOrOrgId"
                    value={formData.institutionOrOrgId}
                    onChange={handleChange}
                    placeholder="e.g. C-24902 or CIN-U12345"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Website *</label>
                  <input
                    type="url"
                    name="officialWebsite"
                    required
                    value={formData.officialWebsite}
                    onChange={handleChange}
                    placeholder="https://mitindia.edu"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>2. Official Nodal Contact</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Dr. K. Swaminathan"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Dean of Academics / Registrar"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email Domain *</label>
                  <input
                    type="email"
                    name="officialEmail"
                    required
                    value={formData.officialEmail}
                    onChange={handleChange}
                    placeholder="registrar@mitindia.edu"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 44 2251 6000"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Operational Requirements */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                3. Onboarding Scope & Certificate Volume
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Issuance Users</label>
                  <select
                    name="expectedUsers"
                    value={formData.expectedUsers}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="1-10">1 - 10 Faculty Issuers</option>
                    <option value="10-50">10 - 50 Faculty Issuers</option>
                    <option value="50+">50+ Faculty Issuers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Annual Volume</label>
                  <select
                    name="expectedVolume"
                    value={formData.expectedVolume}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="< 1,000">Under 1,000 certificates/year</option>
                    <option value="1,000 - 10,000/year">1,000 - 10,000 certificates/year</option>
                    <option value="10,000 - 50,000/year">10,000 - 50,000 certificates/year</option>
                    <option value="> 50,000/year">Over 50,000 certificates/year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Requesting Access *</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Explain why your institution needs CERTX access (e.g., Eliminating fake degree certificates, automated HR verification, digital student credential vault)."
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            {/* Consent & Submission */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="declarationConsent"
                  checked={formData.declarationConsent}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-700 bg-navy-950 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-300">
                  I hereby declare that I am an authorized representative of the organization and that all provided information is accurate and subject to CERTX Super Admin audit.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !formData.declarationConsent}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
              >
                {loading ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit CERTX Access Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
