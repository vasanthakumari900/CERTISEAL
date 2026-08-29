'use client';

import React, { useState, useEffect } from 'react';
import NavbarAdmin from '@/components/NavbarAdmin';
import Footer from '@/components/Footer';
import { UserCheck, Check, X, HelpCircle, FileText, Building2, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'ALL' ? '/api/admin/applications' : `/api/admin/applications?status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
        if (data.applications.length > 0 && !selectedApp) {
          setSelectedApp(data.applications[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO') => {
    if (!selectedApp) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedApp.id,
          action,
          reviewNotes
        })
      });

      const data = await res.json();
      if (res.ok) {
        fetchApplications();
        setSelectedApp(data.application);
        setReviewNotes('');
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarAdmin />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              ADMIN PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">CERTX Access Applications</h1>
            <p className="text-xs text-slate-400">Review, approve, or reject organization requests for platform access.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ADDITIONAL_INFO_REQUIRED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-purple-600 text-white border border-purple-500'
                    : 'bg-navy-900 border border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-1 bg-navy-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 max-h-[700px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Applications ({applications.length})</span>
              <button onClick={fetchApplications} className="p-1 text-slate-400 hover:text-white">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400 p-4 text-center">Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No applications matching filter.</p>
            ) : (
              applications.map(app => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-3 rounded-xl border transition-all space-y-1 ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500/50 text-white'
                        : 'bg-navy-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-400">{app.applicationId}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        app.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        app.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="font-bold text-xs truncate">{app.organizationName}</p>
                    <p className="text-[11px] text-slate-400">{app.contactPerson} ({app.city}, {app.state})</p>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Application Details & Action Panel */}
          <div className="lg:col-span-2 bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-6">
            {selectedApp ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-blue-400">{selectedApp.applicationId}</span>
                      <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
                        selectedApp.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        selectedApp.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {selectedApp.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedApp.organizationName}</h2>
                    <p className="text-xs text-slate-400">{selectedApp.organizationType} • {selectedApp.officialWebsite}</p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Submitted: {new Date(selectedApp.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Official Nodal Contact:</span>
                    <p className="font-semibold text-white">{selectedApp.contactPerson} ({selectedApp.designation})</p>
                    <p className="font-mono text-blue-300">{selectedApp.officialEmail}</p>
                    <p className="text-slate-300">Phone: {selectedApp.phone}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Location & Registry Info:</span>
                    <p className="font-semibold text-white">{selectedApp.city}, {selectedApp.district}, {selectedApp.state}</p>
                    <p className="text-slate-300">AISHE / Reg ID: {selectedApp.institutionOrOrgId || 'N/A'}</p>
                    <p className="text-slate-300">Address: {selectedApp.address}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Operational Scope:</span>
                    <p className="text-slate-200">Expected Users: <strong>{selectedApp.expectedUsers}</strong></p>
                    <p className="text-slate-200">Expected Volume: <strong>{selectedApp.expectedVolume}</strong></p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400">Supporting Documentation / Notes:</span>
                    <p className="text-slate-300">{selectedApp.supportingDocs || 'Declaration consent accepted.'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-blue-400 uppercase">Reason for Requesting CERTX Access:</span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedApp.reason}</p>
                </div>

                {selectedApp.reviewNotes && (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1 text-xs">
                    <span className="font-bold text-purple-300">Review Notes ({selectedApp.reviewedBy || 'Admin'}):</span>
                    <p className="text-slate-300">{selectedApp.reviewNotes}</p>
                  </div>
                )}

                {/* Super Admin Action Controls */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Super Admin Review Decision</h3>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Enter review notes or verification comments..."
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
                  ></textarea>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAction('APPROVE')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" />
                      <span>[Approve] & Provision Platform Access</span>
                    </button>
                    <button
                      onClick={() => handleAction('REJECT')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>[Reject] Application</span>
                    </button>
                    <button
                      onClick={() => handleAction('REQUEST_INFO')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>[Request Information]</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">Select an application from the list to review details.</p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
