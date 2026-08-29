'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarPlatform from '@/components/NavbarPlatform';
import Footer from '@/components/Footer';
import { Building2, Plus, ShieldCheck, KeyRound, AlertTriangle, CheckCircle2, Clock, XCircle, Search, RefreshCw, Eye } from 'lucide-react';

export default function InstitutionDashboardPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [keyRotationSuccess, setKeyRotationSuccess] = useState<string | null>(null);

  // Modal State for Status Updates
  const [activeModalCert, setActiveModalCert] = useState<any | null>(null);
  const [modalAction, setModalAction] = useState<'HOLD' | 'RELEASE' | 'REVOKE' | null>(null);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, searchQuery]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      let url = `/api/certificates?status=${statusFilter}`;
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.certificates) setCertificates(data.certificates);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!activeModalCert || !modalAction) return;

    let actionType = 'PLACE_ON_HOLD';
    if (modalAction === 'RELEASE') actionType = 'RELEASE';
    if (modalAction === 'REVOKE') actionType = 'REVOKE';

    try {
      const res = await fetch(`/api/certificates/${activeModalCert.publicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          reason: actionReason
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveModalCert(null);
        setModalAction(null);
        setActionReason('');
        fetchCertificates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRotateKeys = async () => {
    try {
      const res = await fetch('/api/institutions/inst-1/rotate-key', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setKeyRotationSuccess(`Ed25519 Signing Key Rotated to Version ${data.newKeyVersion}! Public Fingerprint: ${data.publicKeyFingerprint}`);
        setTimeout(() => setKeyRotationSuccess(null), 5000);
      }
    } catch (e) {}
  };

  const verifiedCount = certificates.filter(c => c.status === 'VERIFIED').length;
  const onHoldCount = certificates.filter(c => c.status === 'ON_HOLD').length;
  const releasedCount = certificates.filter(c => c.status === 'RELEASED').length;
  const revokedCount = certificates.filter(c => c.status === 'REVOKED').length;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarPlatform />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <Building2 className="w-4 h-4" />
              National Institute of Technology Portal — CERTX Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Certificate Issuance & Lifecycle Management</h1>
            <p className="text-xs text-slate-400">Issue cryptographically signed certificates with per-certificate DEK envelope encryption.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRotateKeys}
              className="px-4 py-2.5 bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Rotate Ed25519 Keys</span>
            </button>

            <Link
              href="/institution/certificates/issue"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-blue-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>+ ISSUE NEW CERTIFICATE</span>
            </Link>
          </div>
        </div>

        {keyRotationSuccess && (
          <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-600 text-purple-200 text-xs font-mono">
            {keyRotationSuccess}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-navy-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Issued</span>
            <p className="text-xl font-bold text-white">{certificates.length}</p>
          </div>

          <div className="bg-navy-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">VERIFIED Active</span>
            <p className="text-xl font-bold text-emerald-400">{verifiedCount}</p>
          </div>

          <div className="bg-navy-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">ON_HOLD</span>
            <p className="text-xl font-bold text-amber-400">{onHoldCount}</p>
          </div>

          <div className="bg-navy-900/60 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-medium">REVOKED</span>
            <p className="text-xl font-bold text-rose-400">{revokedCount}</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-navy-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll number, or Certificate ID..."
              className="w-full pl-9 pr-4 py-2 bg-navy-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {['ALL', 'VERIFIED', 'ON_HOLD', 'RELEASED', 'REVOKED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-navy-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Certificates Table */}
        <div className="bg-navy-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-navy-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Certificate ID</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Roll No</th>
                  <th className="p-3.5">Type & Program</th>
                  <th className="p-3.5">CGPA</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {certificates.map((cert) => {
                  let badgeStyle = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                  if (cert.status === 'ON_HOLD') badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
                  if (cert.status === 'RELEASED') badgeStyle = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
                  if (cert.status === 'REVOKED') badgeStyle = 'bg-rose-500/20 text-rose-400 border-rose-500/40';

                  return (
                    <tr key={cert.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-400">{cert.publicId}</td>
                      <td className="p-3.5 font-semibold text-white">{cert.studentName}</td>
                      <td className="p-3.5 font-mono text-slate-300">{cert.studentRollNo}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-200">{cert.certificateType}</p>
                        <p className="text-[10px] text-slate-400">{cert.course}</p>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">{cert.cgpa || 'N/A'}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${badgeStyle}`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/verify/${cert.publicId}`}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold"
                        >
                          Verify View
                        </Link>

                        {cert.status !== 'ON_HOLD' && cert.status !== 'REVOKED' && (
                          <button
                            onClick={() => { setActiveModalCert(cert); setModalAction('HOLD'); }}
                            className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 hover:bg-amber-900 text-[11px] font-semibold"
                          >
                            Hold
                          </button>
                        )}

                        {cert.status === 'ON_HOLD' && (
                          <button
                            onClick={() => { setActiveModalCert(cert); setModalAction('RELEASE'); }}
                            className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 hover:bg-blue-900 text-[11px] font-semibold"
                          >
                            Release
                          </button>
                        )}

                        {cert.status !== 'REVOKED' && (
                          <button
                            onClick={() => { setActiveModalCert(cert); setModalAction('REVOKE'); }}
                            className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 text-[11px] font-semibold"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Modal */}
        {activeModalCert && modalAction && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy-950 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                {modalAction === 'HOLD' ? 'Place Certificate ON_HOLD' : modalAction === 'RELEASE' ? 'Release Institutional Hold' : 'Revoke Certificate'}
              </h3>
              <p className="text-xs text-slate-400">
                Certificate ID: <span className="font-mono text-blue-400">{activeModalCert.publicId}</span> ({activeModalCert.studentName})
              </p>

              {modalAction !== 'RELEASE' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300">Administrative Reason:</label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder={modalAction === 'HOLD' ? 'e.g. Central library clearance pending' : 'e.g. Falsified academic credits'}
                    className="w-full mt-1.5 p-3 bg-navy-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setActiveModalCert(null); setModalAction(null); }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
