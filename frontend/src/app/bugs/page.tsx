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
    <div className="p-4 lg:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-900">All Bugs</h1>
          <p className="text-xs lg:text-sm text-gray-400 mt-0.5">{data?.pagination?.total || 0} total</p>
        </div>
        <Link href="/bugs/new"
          className="flex items-center gap-1.5 px-3 py-2 lg:px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs lg:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-200">
          <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span className="hidden sm:inline">Report Bug</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 lg:p-4 mb-3 lg:mb-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3">
          <Search className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <input type="text" placeholder="Search bugs..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-300" />
        </div>

        {/* Status pills — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setFilters({ ...filters, status: '', page: 1 })}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${!filters.status ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilters({ ...filters, status: filters.status === s ? '' : s, page: 1 })}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${filters.status === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
          <div className="w-px bg-gray-200 flex-shrink-0 mx-1" />
          {SEVERITIES.map((s) => (
            <button key={s} onClick={() => setFilters({ ...filters, severity: filters.severity === s ? '' : s, page: 1 })}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                filters.severity === s
                  ? s === 'HIGH' ? 'bg-red-500 text-white' : s === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Bug list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-300 text-sm">Loading...</div>
        ) : data?.bugs?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-gray-400 text-sm">No bugs found</div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {data?.bugs?.map((bug: any) => (
                <Link key={bug.id} href={`/bugs/${bug.id}`}
                  className="flex items-start gap-2.5 lg:gap-4 px-4 lg:px-5 py-3.5 lg:py-4 hover:bg-orange-50/50 transition-colors group">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 mt-0.5 ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
                    {bug.severity.slice(0, 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">{bug.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      {bug.module && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded hidden sm:inline">{bug.module}</span>}
                      <span>{bug.reporter?.name}</span>
                      {bug.assignee && <span className="text-orange-400 hidden sm:inline">→ {bug.assignee?.name}</span>}
                      <span>{timeAgo(bug.createdAt)}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
                    {bug.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>

            {data?.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
                <span className="text-xs text-gray-300">Page {filters.page} of {data.pagination.totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-30 text-gray-500">← Prev</button>
                  <button disabled={filters.page === data.pagination.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-30 text-gray-500">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
