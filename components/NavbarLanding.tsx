'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowRight, Menu, X, Lock, Cpu, Building2, HelpCircle, FileText, CheckCircle2 } from 'lucide-react';
import QuickDemoSwitcher from './QuickDemoSwitcher';

export default function NavbarLanding() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/problem', label: 'The Problem' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/security-architecture', label: 'Security Specs' },
    { href: '/verification-chain', label: '8-Level Verification' },
    { href: '/for-institutions', label: 'For Institutions' },
    { href: '/for-students', label: 'For Students' },
    { href: '/for-employers', label: 'For Employers' },
    { href: '/institutions', label: 'National Registry' },
    { href: '/faq', label: 'FAQ' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-navy-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* CERTX Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 group-hover:border-blue-400 transition-all shadow-lg shadow-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg tracking-tight text-white font-mono">CERT</span>
              <span className="font-extrabold text-lg tracking-tight text-blue-500 font-mono">X</span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded uppercase tracking-wider">
                Digital Trust
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">NATIONAL CERTIFICATE TRUST ARCHITECTURE</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-3">
          {navLinks.slice(0, 7).map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium transition-colors py-1 px-2 rounded-md ${
                  isActive ? 'text-blue-400 bg-blue-500/10 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="relative group py-2">
            <button className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1">
              More ▾
            </button>
            <div className="absolute right-0 mt-1 w-48 rounded-xl bg-navy-900 border border-slate-700 shadow-xl p-2 hidden group-hover:block z-50">
              {navLinks.slice(7).map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Action Buttons & Quick Demo Switcher */}
        <div className="flex items-center gap-3">
          <QuickDemoSwitcher />

          <Link
            href="/apply"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-900/40"
          >
            <span>Apply for Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white font-medium text-xs transition-all"
          >
            Platform Login
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 text-xs text-slate-200 hover:bg-slate-900 rounded-lg"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
            >
              Apply for CERTX Access
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-lg border border-slate-700 text-slate-200 text-xs font-medium"
            >
              Platform Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
