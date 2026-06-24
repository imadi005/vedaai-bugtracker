'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { STATUS_COLORS, SEVERITY_COLORS, timeAgo } from '@/lib/utils';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'REOPENED'];
const SEVERITIES = ['', 'HIGH', 'MEDIUM', 'LOW'];

export default function BugsPage() {
  const [filters, setFilters] = useState({ status: '', severity: '', search: '', page: 1 });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bugs', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.search) params.set('search', filters.search);
      params.set('page', String(filters.page));
      params.set('limit', '20');
      return api.get(`/bugs?${params}`).then((r) => r.data);
    },
  });

  return (
    <div className="p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">All Bugs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.pagination?.total || 0} bugs total</p>
        </div>
        <Link
          href="/bugs/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Report Bug
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="flex-1 text-sm outline-none text-gray-900 placeholder-gray-400"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-gray-600"
          >
            <option value="">All Status</option>
            {STATUSES.slice(1).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none text-gray-600"
          >
            <option value="">All Severity</option>
            {SEVERITIES.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Bug list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading bugs...</div>
        ) : data?.bugs?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-sm">No bugs found</div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {data?.bugs?.map((bug: any) => (
                <Link
                  key={bug.id}
                  href={`/bugs/${bug.id}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
                      {bug.severity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{bug.title}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                      {bug.module && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{bug.module}</span>}
                      <span>by {bug.reporter?.name}</span>
                      {bug.assignee && <span>→ {bug.assignee?.name}</span>}
                      <span>{timeAgo(bug.createdAt)}</span>
                      <span>{bug._count?.comments} comments</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
                    {bug.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data?.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  Page {filters.page} of {data.pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={filters.page === data.pagination.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
