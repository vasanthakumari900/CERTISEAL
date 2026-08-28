'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, MapPin, ChevronRight, Award, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function InstitutionsDirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchRegistry();
  }, [searchQuery, selectedState, selectedCity, selectedType, selectedStatus]);

  const fetchRegistry = async () => {
    setLoading(true);
    try {
      let url = `/api/institutions/search?query=${encodeURIComponent(searchQuery)}&state=${selectedState}&city=${selectedCity}&type=${selectedType}&status=${selectedStatus}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.institutions) setInstitutions(data.institutions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'ALL', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 
    'Gujarat', 'Delhi', 'West Bengal', 'Uttar Pradesh', 'Rajasthan', 'Punjab', 'Odisha', 
    'Bihar', 'Madhya Pradesh', 'Assam'
  ];

  const cities = [
    'ALL', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Kancheepuram', 'Vellore',
    'Bengaluru', 'Thiruvananthapuram', 'Mumbai', 'Pune', 'Hyderabad', 'New Delhi', 'Kolkata', 'Ahmedabad'
  ];

  const types = [
    'ALL', 'Government College', 'Autonomous College', 'State University', 'Central University', 
    'IIT', 'NIT', 'AIIMS', 'Deemed University', 'Arts and Science College', 'Medical College'
  ];

  const statuses = ['ALL', 'PARTICIPATING', 'NOT_ONBOARDED', 'VERIFIED', 'ONBOARDING', 'SUSPENDED'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Building2 className="w-4 h-4" />
          Master Higher Education Institution Registry
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">National & Local Institution Directory</h1>
        <p className="text-sm text-slate-400">
          Search local government colleges, autonomous engineering institutes, medical colleges, and state universities across all Indian cities and states.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-navy-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type any college name, city or code (e.g. Chennai, CEG, IIT Madras, MIT, SSN, Loyola, MCC, MMC, REC)..."
            className="w-full pl-12 pr-4 py-3 bg-navy-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Filter by City:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Filter by State:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Institution Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">CERTISEAL Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {statuses.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
          <span>Found {institutions.length} local and state institution records</span>
          <span className="text-blue-400">UGC / AISHE Master Database Sync</span>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map((inst) => {
          const isParticipating = inst.status === 'PARTICIPATING' || inst.status === 'VERIFIED';
          const isNotOnboarded = inst.status === 'NOT_ONBOARDED';

          let statusBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
          let statusText = '✓ PARTICIPATING';
          if (isNotOnboarded) {
            statusBadge = 'bg-slate-800 text-slate-400 border-slate-700';
            statusText = 'NOT ONBOARDED';
          }

          return (
            <div key={inst.id} className="bg-navy-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                    {inst.publicId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white line-clamp-2">{inst.officialName}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-semibold text-blue-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {inst.city}, {inst.state}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-medium text-slate-200">{inst.institutionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accreditation:</span>
                    <span className="font-mono text-emerald-400 font-bold">{inst.accreditation || 'UGC Approved'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official Website:</span>
                    <a href={inst.officialWebsite} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono text-[11px] truncate max-w-[160px]">
                      {inst.officialWebsite.replace('https://', '')}
                    </a>
                  </div>
                </div>
              </div>

              <Link
                href={`/institutions/${inst.publicId}`}
                className="w-full py-2.5 bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mt-4"
              >
                <span>View Local Institution Profile</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
