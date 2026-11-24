/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AGE_BANDS, type AgeBand } from '../tutor-prompt.ts';
import type { UserProfile } from '../types/auth.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  defaultAgeBand?: AgeBand;
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultAgeBand = '8-10',
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>(defaultAgeBand);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        tab === 'login'
          ? { identifier: email || username, password }
          : { username, email, password, ageBand };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (data.token) {
        localStorage.setItem('tutorly_token', data.token);
      }

      setSuccessMsg(tab === 'login' ? `Welcome back, ${data.user.username}! 🌟` : `Welcome to Tutorly, ${data.user.username}! 🚀`);
      
      setTimeout(() => {
        onAuthSuccess(data.user);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border-2 border-blue-200 shadow-2xl p-6 sm:p-7 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 mb-3 border-2 border-white">
            {tab === 'login' ? <LogIn className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
          </div>
          <h2 id="auth-modal-title" className="text-2xl sm:text-3xl font-black text-slate-900">
            {tab === 'login' ? 'Welcome Back!' : 'Join Tutorly'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {tab === 'login'
              ? 'Log in to continue your learning adventures'
              : 'Create a free student profile to track your questions'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer ${
              tab === 'signup'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Student Nickname or Username</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. AstroKid or SuperSam"
                className="w-full text-sm font-semibold rounded-xl border-2 border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{tab === 'login' ? 'Email or Username' : 'Email Address'}</span>
            </label>
            <input
              type={tab === 'login' ? 'text' : 'email'}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tab === 'login' ? 'Email or nickname' : 'student@example.com'}
              className="w-full text-sm font-semibold rounded-xl border-2 border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm font-semibold rounded-xl border-2 border-slate-200 px-3.5 py-2.5 focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 transition-all"
            />
          </div>

          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Age Group</span>
              </label>
              <select
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                className="w-full text-sm font-bold rounded-xl border-2 border-slate-200 px-3.5 py-2.5 bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-600 transition-all cursor-pointer"
              >
                {AGE_BANDS.map((band) => (
                  <option key={band} value={band}>
                    Age {band} {band === '5-7' ? '🌱' : band === '8-10' ? '🚀' : '🎓'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-sm sm:text-base transition-all shadow-md shadow-blue-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Connecting…</span>
            ) : tab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Student Profile</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-400">
            🔒 Kid-safe environment. We never share student account info.
          </p>
        </div>
      </div>
    </div>
  );
}
