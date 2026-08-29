'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, ShieldAlert, LogOut, LayoutDashboard, Building2, Users, FileCheck2, Activity, Cpu, Settings, AlertTriangle, Key } from 'lucide-react';
import QuickDemoSwitcher from './QuickDemoSwitcher';

export default function NavbarAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('certiseal_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('certiseal_user');
    window.dispatchEvent(new Event('auth-state-change'));
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-purple-950/95 backdrop-blur-md border-b border-purple-900/60 text-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300 shadow-lg shadow-purple-950">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">CERTX</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded uppercase tracking-wider">
                ADMIN PORTAL
              </span>
            </div>
            <p className="text-[10px] text-purple-300/80 -mt-1 hidden sm:block tracking-wide">SUPER ADMIN ECOSYSTEM GOVERNANCE</p>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden xl:flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/admin/dashboard' ? 'bg-purple-600/30 text-white border border-purple-500/40' : 'text-purple-200 hover:bg-purple-900/40'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/applications"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/admin/applications' ? 'bg-purple-600/30 text-white border border-purple-500/40' : 'text-purple-200 hover:bg-purple-900/40'
            }`}
          >
            Applications
          </Link>
          <Link
            href="/admin/organizations"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/admin/organizations' ? 'bg-purple-600/30 text-white border border-purple-500/40' : 'text-purple-200 hover:bg-purple-900/40'
            }`}
          >
            Organizations
          </Link>
          <Link
            href="/admin/institutions"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/admin/institutions' ? 'bg-purple-600/30 text-white border border-purple-500/40' : 'text-purple-200 hover:bg-purple-900/40'
            }`}
          >
            Institutions
          </Link>
          <Link
            href="/admin/audit-logs"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/admin/audit-logs' ? 'bg-purple-600/30 text-white border border-purple-500/40' : 'text-purple-200 hover:bg-purple-900/40'
            }`}
          >
            Audit Logs
          </Link>
          <Link
            href="/admin/ledger"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === '/admin/ledger' ? 'bg-purple-600/30 text-white border border-purple-500/40' : 'text-purple-200 hover:bg-purple-900/40'
            }`}
          >
            Ledger Monitor
          </Link>
          <Link
            href="/admin/tamper-simulator"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              pathname === '/admin/tamper-simulator' ? 'bg-rose-600/30 text-rose-200 border border-rose-500/50' : 'text-amber-300 hover:bg-purple-900/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Tamper Simulator</span>
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <QuickDemoSwitcher />

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900/50 border border-purple-700/60 text-purple-200 hover:text-white hover:bg-purple-800/60 text-xs font-medium transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
