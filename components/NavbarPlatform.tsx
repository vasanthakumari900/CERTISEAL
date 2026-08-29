'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, Search, LayoutDashboard, FilePlus2, Award, Briefcase, GraduationCap, LogOut, KeyRound, Building2, User, FileText } from 'lucide-react';
import QuickDemoSwitcher from './QuickDemoSwitcher';

export default function NavbarPlatform() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  const loadUser = () => {
    const stored = localStorage.getItem('certiseal_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('auth-state-change', loadUser);
    return () => window.removeEventListener('auth-state-change', loadUser);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('certiseal_user');
    window.dispatchEvent(new Event('auth-state-change'));
    router.push('/login');
  };

  const getRoleBadge = () => {
    if (!user) return 'PUBLIC';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return { label: 'SUPER ADMIN', color: 'bg-purple-950 text-purple-300 border-purple-800' };
      case 'INSTITUTION_ADMIN':
        return { label: 'INSTITUTION ADMIN', color: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'FACULTY':
        return { label: 'FACULTY ISSUER', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' };
      case 'COMPANY':
      case 'COMPANY_HR':
        return { label: 'EMPLOYER / HR', color: 'bg-amber-950 text-amber-300 border-amber-800' };
      case 'STUDENT':
        return { label: 'STUDENT VAULT', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' };
      default:
        return { label: user.role, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/95 backdrop-blur-md border-b border-blue-900/40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/verify" className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 shadow-lg shadow-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">CERTX</span>
              <span className="font-extrabold text-lg tracking-tight text-blue-400 font-mono">PLATFORM</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">OPERATIONAL TRUST WORKSPACE</p>
          </div>
        </Link>

        {/* Dynamic Platform Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          {(!user || user.role === 'COMPANY' || user.role === 'COMPANY_HR') && (
            <>
              <Link
                href="/company/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname.includes('/company/dashboard') ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Verification Dashboard
              </Link>
              <Link
                href="/verify"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/verify' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Verify Certificate
              </Link>
            </>
          )}

          {(user?.role === 'INSTITUTION_ADMIN' || user?.role === 'FACULTY') && (
            <>
              <Link
                href="/institution/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/institution/dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Institution Dashboard
              </Link>
              <Link
                href="/institution/certificates/issue"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  pathname.includes('/issue') ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FilePlus2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Issue Certificate</span>
              </Link>
              <Link
                href="/verify"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/verify' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Verify Engine
              </Link>
            </>
          )}

          {user?.role === 'STUDENT' && (
            <>
              <Link
                href="/student/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/student/dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                My Credential Vault
              </Link>
              <Link
                href="/verify"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname === '/verify' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white'
                }`}
              >
                Verify Certificate
              </Link>
            </>
          )}
        </nav>

        {/* User Info & Demo Switcher */}
        <div className="flex items-center gap-3">
          {typeof roleBadge === 'object' && (
            <span className={`hidden lg:inline-block px-2.5 py-1 text-[10px] font-bold rounded-md border ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
          )}

          <QuickDemoSwitcher />

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
