'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavbarPlatform from '@/components/NavbarPlatform';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, KeyRound, Cpu, CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { canonicalize } from '@/lib/crypto/canonical';

export default function IssueCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    studentName: 'Rahul Kumar',
    studentRollNo: '23CS101',
    course: 'B.Sc Computer Science',
    department: 'Computer Science & Engineering',
    certificateType: 'Degree Certificate',
    issueDate: '2026-08-15',
    completionDate: '2026-06-30',
    cgpa: '8.72',
    marks: '87.2%',
    graduationYear: '2026',
    publicId: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certTypes = [
    'Degree Certificate',
    'Diploma',
    'Provisional Certificate',
    'Transfer Certificate',
    'Course Completion Certificate',
    'Internship Certificate',
    'Training Certificate',
    'Bonafide Certificate',
    'Marksheet'
  ];

  const sampleStructured = {
    certificateId: formData.publicId || 'AUTO-GENERATED',
    institutionCode: 'NITD',
    studentName: formData.studentName,
    studentRollNo: formData.studentRollNo,
    course: formData.course,
    department: formData.department,
    certificateType: formData.certificateType,
    issueDate: formData.issueDate,
    cgpa: formData.cgpa
  };

  const canonicalPreview = canonicalize(sampleStructured);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId: 'inst-1',
          ...formData
        })
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success && data.certificate) {
        router.push(`/verify/${data.certificate.publicId}`);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Issuance failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarPlatform />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4" />
            Authorized Institutional Cryptographic Issuance — CERTX Platform
          </div>
          <h1 className="text-3xl font-extrabold text-white">Issue & Envelope Encrypt Certificate</h1>
          <p className="text-xs text-slate-400">
            Enter structured student details. The engine canonicalizes data, generates a SHA-256 fingerprint, signs with Ed25519, encrypts with a unique per-certificate DEK, wraps the DEK via KMS, and appends to the hash-chain ledger.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Inputs */}
          <div className="md:col-span-2 bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Certificate Type:</label>
                <select
                  value={formData.certificateType}
                  onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {certTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Custom Certificate ID (Optional):</label>
                <input
                  type="text"
                  value={formData.publicId}
                  onChange={(e) => setFormData({ ...formData, publicId: e.target.value })}
                  placeholder="Auto-generated if left blank"
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Student Full Name:</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Roll / Reg Number:</label>
                <input
                  type="text"
                  value={formData.studentRollNo}
                  onChange={(e) => setFormData({ ...formData, studentRollNo: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Course / Program:</label>
                <input
                  type="text"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Department:</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {formData.certificateType.includes('Degree') || formData.certificateType.includes('Marksheet') || formData.certificateType.includes('Diploma') ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">CGPA / Grade:</label>
                    <input
                      type="text"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Graduation Year:</label>
                    <input
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              ) : null}

              <div>
                <label className="text-xs font-semibold text-slate-300">Official Issue Date:</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2.5 bg-navy-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-950 mt-4"
            >
              <span>{isSubmitting ? 'ENVELOPE ENCRYPTING & SEALING...' : 'CRYPTOGRAPHICALLY SEAL & ISSUE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Preview Side Panel */}
          <div className="bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
            <h3 className="font-sans font-bold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Live Cryptographic Preview
            </h3>

            <div>
              <span className="text-slate-400 font-sans text-[11px]">Sorted Canonical JSON Payload:</span>
              <pre className="mt-1 p-2.5 rounded bg-black/60 border border-slate-800 text-blue-300 text-[10px] whitespace-pre-wrap break-all">
                {canonicalPreview}
              </pre>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px] font-sans">
              <div className="flex items-center justify-between text-slate-300">
                <span>Fingerprint Algorithm:</span>
                <span className="font-mono text-emerald-400 font-bold">SHA-256</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Digital Signature:</span>
                <span className="font-mono text-purple-400 font-bold">Ed25519</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Payload DEK Encryption:</span>
                <span className="font-mono text-amber-400 font-bold">AES-256-GCM (Per-Cert DEK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>KMS DEK Wrapping:</span>
                <span className="font-mono text-cyan-400 font-bold">LocalKMSProvider</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
