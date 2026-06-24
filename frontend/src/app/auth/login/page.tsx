'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid credentials. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => setForm({ email, password: 'password123' });

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            🐛
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">VedaAI Bug Tracker</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Squash bugs<br />ship faster.
          </h1>
          <p className="text-orange-100 text-lg leading-relaxed">
            Internal bug tracking for the VedaAI team.<br />
            Simple enough for everyone, powerful enough for devs.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { emoji: '⚡', label: 'Real-time updates' },
              { emoji: '👥', label: 'Team assignments' },
              { emoji: '📊', label: 'Live dashboard' },
              { emoji: '🔔', label: 'Instant alerts' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-white text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-orange-200 text-sm">Built for 20-person teams who move fast.</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🐛</span>
            <span className="font-semibold text-gray-900">VedaAI Bug Tracker</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder-gray-300"
                placeholder="you@vedaai.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all placeholder-gray-300"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-200"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-300 text-center mb-3">Quick login (demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '👑 Admin', email: 'admin@vedaai.com' },
                { label: '📋 PM', email: 'pm@vedaai.com' },
                { label: '💻 Dev', email: 'dev@vedaai.com' },
                { label: '🧪 QA', email: 'qa@vedaai.com' },
              ].map((u) => (
                <button
                  key={u.email}
                  onClick={() => quickLogin(u.email)}
                  className="text-xs px-3 py-2 border border-gray-100 rounded-lg text-gray-500 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  {u.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-300 text-center mt-2">All passwords: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
