'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Building2, GraduationCap, Briefcase, UserCheck, ChevronDown, CheckCircle2 } from 'lucide-react';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'FACULTY' | 'COMPANY' | 'STUDENT';
  institutionId?: string;
  institutionName?: string;
}

const DEMO_ROLES = [
  {
    role: 'SUPER_ADMIN',
    label: 'Super Admin',
    name: 'Dr. Vikramaditya',
    email: 'superadmin@certiseal.gov.in',
    icon: Shield,
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800/50',
    desc: 'Platform governance, institution approvals, security & ledger scanner'
  },
  {
    role: 'INSTITUTION_ADMIN',
    label: 'Institution Admin',
    name: 'Prof. Ramesh K. (NIT)',
    email: 'admin@nit.ac.in',
    icon: Building2,
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800/50',
    desc: 'Cert issuance, key rotation, hold/release/revocation management'
  },
  {
    role: 'FACULTY',
    label: 'Faculty Issuer',
    name: 'Dr. Priya Sharma (NIT)',
    email: 'priya.sharma@nit.ac.in',
    icon: GraduationCap,
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50',
    desc: 'Issue new certificates, dynamic forms, seal & QR preview'
  },
  {
    role: 'COMPANY',
    label: 'Employer / HR',
    name: 'Suresh Kumar (Tata)',
    email: 'recruiter@tata.com',
    icon: Briefcase,
    badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/50',
    desc: 'Triple-mode verification, upload document OCR & field diff'
  },
  {
    role: 'STUDENT',
    label: 'Student',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@student.nit.ac.in',
    icon: UserCheck,
    badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/50',
    desc: 'View my certificates, verification badge, download & share link'
  }
];

export default function QuickDemoSwitcher() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('certiseal_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {}
    } else {
      // Default to Employer for easy verification demo
      switchRole('COMPANY');
    }
  }, []);

  const switchRole = async (targetRole: string) => {
    const demoItem = DEMO_ROLES.find(r => r.role === targetRole) || DEMO_ROLES[3];
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoItem.email,
          password: 'SIH2026MasterPass!'
        })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('certiseal_user', JSON.stringify(data.user));
        setIsOpen(false);
        // Dispatch custom event for instant UI update
        window.dispatchEvent(new Event('auth-state-change'));
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const currentRoleConfig = DEMO_ROLES.find(r => r.role === currentUser?.role) || DEMO_ROLES[3];

  return (
    <div className="relative inline-block text-left z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-900 border border-slate-700/80 text-slate-200 hover:border-blue-500 transition-all text-xs font-medium shadow-md"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-mono">Role:</span>
          <span className="font-semibold text-blue-400">{currentRoleConfig.label}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-navy-950 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-slate-800 mb-1">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">SIH Judge Demo Switcher</p>
            <p className="text-[11px] text-slate-400">Switch roles instantly to test end-to-end flows</p>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {DEMO_ROLES.map(item => {
              const Icon = item.icon;
              const isSelected = currentUser?.role === item.role;

              return (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/50 text-white'
                      : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${item.badgeColor} mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{item.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
