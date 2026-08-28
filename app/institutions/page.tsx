'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Building2, Search, MapPin, ChevronRight, Award, CheckCircle2, 
  ShieldCheck, ExternalLink, Navigation, Filter, Layers, Database, RefreshCw, ChevronLeft
} from 'lucide-react';

export default function InstitutionsDirectoryPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedManagement, setSelectedManagement] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Near me geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const fetchRegistry = useCallback(async () => {
    setLoading(true);
    setGeoError(null);
    try {
      if (nearMeActive) return;

      let url = `/api/institutions/search?query=${encodeURIComponent(searchQuery)}` +
        `&state=${encodeURIComponent(selectedState)}` +
        `&district=${encodeURIComponent(selectedDistrict)}` +
        `&city=${encodeURIComponent(selectedCity)}` +
        `&type=${encodeURIComponent(selectedType)}` +
        `&management=${encodeURIComponent(selectedManagement)}` +
        `&source=${encodeURIComponent(selectedSource)}` +
        `&status=${encodeURIComponent(selectedStatus)}` +
        `&page=${currentPage}&limit=12`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.institutions) {
        setInstitutions(data.institutions);
        setTotalCount(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error('Error fetching directory:', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedState, selectedDistrict, selectedCity, selectedType, selectedManagement, selectedSource, selectedStatus, currentPage, nearMeActive]);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  const handleNearMeClick = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please select your State and District manually.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const res = await fetch(`/api/institutions/near-me?lat=${lat}&lng=${lng}&radius=300`);
          const data = await res.json();
          if (data.institutions) {
            setInstitutions(data.institutions);
            setTotalCount(data.totalFound || data.institutions.length);
            setTotalPages(1);
            setNearMeActive(true);
          }
        } catch (e) {
          setGeoError('Unable to fetch location-based institutions.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setGeoError('Location permission denied or unavailable. Please use State / District filters below.');
      },
      { timeout: 10000 }
    );
  };

  const resetNearMe = () => {
    setNearMeActive(false);
    setCurrentPage(1);
  };

  const indianStates = [
    'ALL', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry', 'Chandigarh'
  ];

  const districts = [
    'ALL', 'Chennai', 'Chengalpattu', 'Tiruchirappalli', 'Coimbatore', 'Madurai', 'Salem', 
    'Bengaluru Urban', 'Dakshina Kannada', 'Mumbai Suburban', 'Pune', 'New Delhi', 'South Delhi', 
    'Kolkata', 'Varanasi', 'Kanpur Nagar', 'Hyderabad', 'Ranga Reddy', 'Visakhapatnam', 'Kozhikode', 
    'Ahmedabad', 'Jaipur', 'Kamrup Metropolitan'
  ];

  const cities = [
    'ALL', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Chromepet', 
    'Bengaluru', 'Mangaluru', 'Mumbai', 'Pune', 'New Delhi', 'Kolkata', 'Kharagpur', 'Varanasi', 
    'Kanpur', 'Hyderabad', 'Visakhapatnam', 'Kozhikode', 'Ahmedabad', 'Jaipur', 'Guwahati'
  ];

  const categories = [
    'ALL', 'Central University', 'State Public University', 'State Private University', 
    'Deemed University', 'IIT', 'NIT', 'IIIT', 'IIM', 'IISER', 'AIIMS', 
    'Autonomous College', 'Engineering / Technical Institution', 'Medical College', 
    'Government College', 'Government-Aided College', 'Private College'
  ];

  const managementTypes = ['ALL', 'Government', 'Private', 'Government-Aided', 'Deemed'];
  const sources = ['ALL', 'AISHE', 'UGC', 'NMC', 'AICTE'];
  const statuses = ['ALL', 'PARTICIPATING', 'REGISTRY_LISTED', 'NOT_ONBOARDED', 'VERIFIED', 'ONBOARDING'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 px-2 sm:px-4">
      {/* Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Building2 className="w-4 h-4" />
          <span>National & Local Institution Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Search Higher Education Institutions Across India
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Authoritative directory of Universities, IITs, NITs, AIIMS, Autonomous Colleges, and Technical & Medical Institutions.
        </p>

        {/* Data Freshness Indicator Banner */}
        <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 bg-navy-900/90 px-4 py-1.5 rounded-lg border border-slate-800 shadow-sm">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Government-source directory snapshot</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">Last synchronized: August 2026</span>
        </div>
      </div>

      {/* Near Me & Search Panel */}
      <div className="bg-navy-900/80 p-5 rounded-2xl border border-slate-800 space-y-5 shadow-2xl backdrop-blur">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              placeholder="Search institution name, AISHE code (e.g. U-0456, C-24902), city, or university..."
              className="w-full pl-12 pr-4 py-3 bg-navy-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Geolocation Button */}
          <button
            onClick={nearMeActive ? resetNearMe : handleNearMeClick}
            disabled={isLocating}
            className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-lg shrink-0 ${
              nearMeActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-500/30'
            }`}
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{nearMeActive ? '✕ Clear Near Me Filter' : isLocating ? 'Locating...' : 'Near Me / Local Institutions'}</span>
          </button>
        </div>

        {geoError && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <span>⚠️ {geoError}</span>
          </div>
        )}

        {/* Multi-Parameter Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs pt-1">
          <div>
            <label className="text-slate-400 font-semibold mb-1 block">State / UT:</label>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">City / Town:</label>
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Institution Category:</label>
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Management:</label>
            <select
              value={selectedManagement}
              onChange={(e) => { setSelectedManagement(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {managementTypes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold mb-1 block">Govt Source:</label>
            <select
              value={selectedSource}
              onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); if (nearMeActive) resetNearMe(); }}
              className="w-full p-2.5 bg-navy-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {sources.map(src => <option key={src} value={src}>{src}</option>)}
            </select>
          </div>
        </div>

        {/* Results Counter & Pagination Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 font-mono pt-3 border-t border-slate-800/80 gap-2">
          <span>Found {totalCount} matching government-source directory records</span>
          <span className="text-blue-400">Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono">Searching National Directory Database...</p>
        </div>
      ) : institutions.length === 0 ? (
        <div className="bg-navy-900/40 p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Institutions Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try broadening your search query, choosing a different State/District, or clearing specific filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutions.map((inst) => {
            const isParticipating = inst.status === 'PARTICIPATING' || inst.status === 'VERIFIED';
            const primarySource = inst.sources && inst.sources[0] ? inst.sources[0].sourceName : 'AISHE';

            // Trust Distinction Level Badges
            let trustBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            let trustLabel = 'DIRECTORY LISTING';
            let trustIcon = <Database className="w-3 h-3 text-slate-400" />;

            if (isParticipating) {
              trustBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              trustLabel = 'ISSUER VERIFIED';
              trustIcon = <ShieldCheck className="w-3 h-3 text-emerald-400" />;
            } else if (inst.sources && inst.sources.length > 0) {
              trustBadgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
              trustLabel = 'SOURCE VERIFIED';
              trustIcon = <CheckCircle2 className="w-3 h-3 text-blue-400" />;
            }

            return (
              <div key={inst.id} className="bg-navy-900/70 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl backdrop-blur">
                <div className="space-y-3.5">
                  {/* Top Bar: Identifiers & Trust Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                        {inst.aisheCode || inst.publicId}
                      </span>
                      {inst.distanceKm !== undefined && inst.distanceKm !== null && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {inst.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${trustBadgeClass}`}>
                      {trustIcon}
                      <span>{trustLabel}</span>
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-2">{inst.officialName}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-semibold text-blue-300">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{inst.city}, {inst.district}, {inst.state}</span>
                    </p>
                  </div>

                  {/* Attributes Table */}
                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-medium text-slate-200">{inst.institutionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Management:</span>
                      <span className="font-medium text-slate-300">{inst.managementType || inst.institutionCategory || 'Government'}</span>
                    </div>
                    {inst.accreditations && inst.accreditations[0] && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Accreditation:</span>
                        <span className="font-mono text-emerald-400 font-bold">{inst.accreditations[0].grade}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Primary Source:</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        Source: {primarySource}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Link Button */}
                <Link
                  href={`/institutions/${inst.publicId}`}
                  className="w-full py-2.5 bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mt-4"
                >
                  <span>View Institution Profile</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!nearMeActive && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-navy-900 border border-slate-700 text-white text-xs font-semibold rounded-xl disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-mono text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-navy-900 border border-slate-700 text-white text-xs font-semibold rounded-xl disabled:opacity-40 flex items-center gap-1 hover:bg-slate-800 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
