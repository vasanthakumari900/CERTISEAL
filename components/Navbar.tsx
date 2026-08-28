'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Search, Cpu, Lock, LayoutDashboard, Building2, AlertTriangle, Menu, X } from 'lucide-react';
import QuickDemoSwitcher, { UserSession } from './QuickDemoSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getDashboardPath = () => {
    if (!user) return '/verify';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      case 'INSTITUTION_ADMIN':
      case 'FACULTY':
        return '/institution/dashboard';
      case 'COMPANY':
        return '/company/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/verify';
    }
  };

  const navLinks = [
    { href: '/verify', label: 'Verify Certificate', icon: Search },
    { href: '/institutions', label: 'National Registry', icon: Building2 },
    { href: '/how-it-works', label: 'How It Works', icon: Cpu },
    { href: '/security-architecture', label: 'Security Specs', icon: Lock },
    { href: '/admin/tamper-simulator', label: 'Tamper Simulator', icon: AlertTriangle },
    { href: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 group-hover:border-blue-400 transition-all shadow-lg shadow-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">CERTI</span>
              <span className="font-extrabold text-lg tracking-tight text-blue-500 font-mono">SEAL</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">NATIONAL TRUST INFRASTRUCTURE</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href.includes('/dashboard') && pathname.includes('/dashboard'));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors py-1 px-2 rounded-lg ${
                  isActive
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Demo Switcher & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          <QuickDemoSwitcher />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
