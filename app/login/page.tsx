'use client';

import React, { useState } from 'react';
import NavbarLanding from '@/components/NavbarLanding';
import Footer from '@/components/Footer';
import QuickDemoSwitcher from '@/components/QuickDemoSwitcher';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      localStorage.setItem('certiseal_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth-state-change'));

      // Redirect based on server-verified session role
      if (data.user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'INSTITUTION_ADMIN' || data.user.role === 'FACULTY') {
        router.push('/institution/dashboard');
      } else if (data.user.role === 'COMPANY' || data.user.role === 'COMPANY_HR') {
        router.push('/company/dashboard');
      } else if (data.user.role === 'STUDENT') {
        router.push('/student/dashboard');
      } else {
        router.push('/verify');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <NavbarLanding />

      <main className="flex-1 flex items-center justify-center max-w-md mx-auto px-4 py-12 w-full">
        <div className="w-full bg-navy-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white">CERTX Platform Login</h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your authorized email and password to access your role workspace.
            </p>
          </div>

          {/* Quick Demo Switcher helper on login */}
          <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">SIH Judge Demo Login:</span>
            <QuickDemoSwitcher />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="superadmin@certiseal.gov.in or admin@nit.ac.in"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to CERTX</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Don't have platform access yet?{' '}
            <Link href="/apply" className="text-blue-400 hover:underline font-medium">
              Apply for Access
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
