'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const MODULES = ['Authentication', 'Dashboard', 'Bug Management', 'Notifications', 'Attachments', 'User Management', 'Analytics', 'API', 'Other'];
const CATEGORIES = ['UI Bug', 'Feature Bug', 'Performance Bug', 'Security Bug', 'UX Bug', 'Data Bug', 'Integration Bug'];

export default function NewBugPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', severity: 'MEDIUM', module: '', category: '', assigneeId: '', dueDate: '' });
  const [error, setError] = useState('');

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/bugs', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push(`/bugs/${res.data.bug.id}`);
    },
    onError: (err: any) => setError(err?.response?.data?.error || 'Failed to create bug'),
  });

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-white";
  const labelClass = "text-sm font-semibold text-gray-700 block mb-1.5";

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/bugs" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report a Bug</h1>
          <p className="text-sm text-gray-400">Fill in what broke and we'll get it fixed</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className={labelClass}>What broke? <span className="text-orange-400">*</span></label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Short clear title — e.g. Login button not working on mobile" className={inputClass} required />
        </div>

        <div>
          <label className={labelClass}>Tell us more <span className="text-orange-400">*</span></label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Steps to reproduce, what you expected, what actually happened, device/browser info..." rows={5}
            className={`${inputClass} resize-none`} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>How bad is it?</label>
            <div className="flex gap-2">
              {[
                { val: 'HIGH', label: '🔴 High', active: 'bg-red-500 text-white border-red-500' },
                { val: 'MEDIUM', label: '🟡 Medium', active: 'bg-amber-500 text-white border-amber-500' },
                { val: 'LOW', label: '🟢 Low', active: 'bg-green-500 text-white border-green-500' },
              ].map((s) => (
                <button key={s.val} type="button" onClick={() => setForm({ ...form, severity: s.val })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${form.severity === s.val ? s.active : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Which area?</label>
            <select value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className={inputClass}>
              <option value="">Select module</option>
              {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Bug type</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Assign to</label>
            <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className={inputClass}>
              <option value="">Unassigned</option>
              {usersData?.users?.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Fix by (optional)</label>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={`${inputClass} w-auto`} />
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">{error}</div>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-200">
            {mutation.isPending ? 'Reporting...' : '🐛 Report Bug'}
          </button>
          <Link href="/bugs" className="px-6 py-3 border border-gray-200 text-gray-500 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
