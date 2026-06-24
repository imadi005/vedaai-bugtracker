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
  const [form, setForm] = useState({
    title: '', description: '', severity: 'MEDIUM',
    module: '', category: '', assigneeId: '', dueDate: '',
  });
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
    onError: (err: any) => {
      setError(err?.response?.data?.error || 'Failed to create bug');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/bugs" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Report a Bug</h1>
          <p className="text-sm text-gray-500">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Bug title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Short descriptive title of the bug"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Steps to reproduce, expected vs actual behavior, environment..."
            rows={5}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Severity */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Severity</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="HIGH">🔴 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>

          {/* Module */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Module</label>
            <select
              value={form.module}
              onChange={(e) => setForm({ ...form, module: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select module</option>
              {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Assign to</label>
            <select
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Unassigned</option>
              {usersData?.users?.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Due date (optional)</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {mutation.isPending ? 'Reporting...' : 'Report Bug'}
          </button>
          <Link
            href="/bugs"
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
