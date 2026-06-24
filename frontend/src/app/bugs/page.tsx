'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import api from '@/lib/api';
import { STATUS_COLORS, SEVERITY_COLORS, timeAgo } from '@/lib/utils';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'REOPENED'];
const SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'];

export default function BugsPage() {
  const [filters, setFilters] = useState({ status: '', severity: '', search: '', page: 1 });

  const { data, isLoading } = useQuery({
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
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">All Bugs</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.pagination?.total || 0} total bugs</p>
        </div>
        <Link
          href="/bugs/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-200"
        >
          <Plus className="w-4 h-4" />
          Report Bug
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-48 bg-gray-50 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search bugs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-300"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilters({ ...filters, status: '', page: 1 })}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${!filters.status ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, status: filters.status === s ? '' : s, page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${filters.status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ ...filters, severity: filters.severity === s ? '' : s, page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filters.severity === s
                    ? s === 'HIGH' ? 'bg-red-500 text-white' : s === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bug list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-300 text-sm">Loading bugs...</div>
        ) : data?.bugs?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-gray-400 text-sm font-medium">No bugs found</div>
            <div className="text-gray-300 text-xs mt-1">Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {data?.bugs?.map((bug: any) => (
                <Link
                  key={bug.id}
                  href={`/bugs/${bug.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50/50 transition-colors group"
                >
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
                    {bug.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors truncate">{bug.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      {bug.module && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{bug.module}</span>}
                      <span>by {bug.reporter?.name}</span>
                      {bug.assignee && <span className="text-orange-400">→ {bug.assignee?.name}</span>}
                      <span>{timeAgo(bug.createdAt)}</span>
                      {bug._count?.comments > 0 && <span>💬 {bug._count.comments}</span>}
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
                    {bug.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>

            {data?.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
                <div className="text-xs text-gray-300">Page {filters.page} of {data.pagination.totalPages}</div>
                <div className="flex gap-2">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 text-gray-500"
                  >← Prev</button>
                  <button
                    disabled={filters.page === data.pagination.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50 text-gray-500"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
