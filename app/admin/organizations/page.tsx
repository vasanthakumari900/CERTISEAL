'use client';

import React, { useState, useEffect } from 'react';
import NavbarAdmin from '@/components/NavbarAdmin';
import Footer from '@/components/Footer';
import { Building2, ShieldAlert, CheckCircle2, AlertOctagon, RefreshCw, Users, ShieldCheck, Key } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, [filterStatus]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'ALL' ? '/api/admin/organizations' : `/api/admin/organizations?status=${filterStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.institutions) {
        setOrganizations(data.institutions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (institutionId: string, targetStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionId,
          targetStatus,
          reason: `Admin updated status to ${targetStatus}`
        })
      });
      if (res.ok) {
        fetchOrganizations();
      } else {
        const data = await res.json();
        alert(data.error || 'Status update failed.');
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
              <Building2 className="w-3.5 h-3.5" />
              ADMIN PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Organization & Institution Governance</h1>
            <p className="text-xs text-slate-400">Manage onboarded organizations, monitor issuance statistics, and suspend/reactivate institution access.</p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'PARTICIPATING', 'VERIFIED', 'SUSPENDED', 'REGISTRY_LISTED'].map(st => (
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

        {/* Organizations Table */}
        <div className="bg-navy-900/80 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Organizations Directory ({organizations.length})</span>
            <button onClick={fetchOrganizations} className="p-1 text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading organizations...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                    <th className="py-2.5 px-3">Public ID / Name</th>
                    <th className="py-2.5 px-3">Type & State</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Certificates</th>
                    <th className="py-2.5 px-3">Users</th>
                    <th className="py-2.5 px-3 text-right">Governance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {organizations.map((org: any) => (
                    <tr key={org.id} className="hover:bg-navy-950/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-blue-400 font-bold">{org.publicId}</span>
                        <p className="font-bold text-white text-sm">{org.officialName}</p>
                        <span className="text-[11px] text-slate-400 font-mono">{org.officialEmail}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-200">{org.institutionType}</span>
                        <p className="text-[11px] text-slate-400">{org.city}, {org.state}</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                          org.status === 'SUSPENDED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          org.status === 'PARTICIPATING' || org.status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {org.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {org._count?.certificates || 0}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {org._count?.users || 0}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {org.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => handleStatusChange(org.id, 'PARTICIPATING')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shadow"
                          >
                            Reactivate Organization
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(org.id, 'SUSPENDED')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-bold rounded-lg text-xs transition-all"
                          >
                            Suspend Organization
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
