'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AlertCircle, Clock, User } from 'lucide-react';
import api from '@/lib/api';
import { STATUS_COLORS, SEVERITY_COLORS, formatDate, timeAgo } from '@/lib/utils';

function BugCard({ bug }: { bug: any }) {
  return (
    <Link
      href={`/bugs/${bug.id}`}
      className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
    >
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border mt-0.5 ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
        {bug.severity}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{bug.title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{bug.module || 'No module'} · {timeAgo(bug.createdAt)}</div>
        {bug.dueDate && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${new Date(bug.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            Due {formatDate(bug.dueDate)}
          </div>
        )}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
        {bug.status.replace('_', ' ')}
      </span>
    </Link>
  );
}

function Section({ title, bugs, emptyText, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{bugs?.length || 0}</span>
      </div>
      {bugs?.length === 0 ? (
        <div className="text-sm text-gray-400 text-center py-4">{emptyText}</div>
      ) : (
        <div className="space-y-2">
          {bugs?.map((bug: any) => <BugCard key={bug.id} bug={bug} />)}
        </div>
      )}
    </div>
  );
}

export default function MyBugsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-bugs'],
    queryFn: () => api.get('/bugs/my').then((r) => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="p-8 text-sm text-gray-400">Loading your bugs...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">My Bugs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Bugs assigned to you and reported by you</p>
      </div>

      {data?.dueToday?.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Due Today</span>
          </div>
          <div className="space-y-2 mt-3">
            {data.dueToday.map((bug: any) => <BugCard key={bug.id} bug={bug} />)}
          </div>
        </div>
      )}

      {data?.overdue?.length > 0 && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-800">Overdue ({data.overdue.length})</span>
          </div>
          <div className="space-y-2 mt-3">
            {data.overdue.map((bug: any) => <BugCard key={bug.id} bug={bug} />)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Section title="Assigned to me" bugs={data?.assignedToMe} emptyText="No bugs assigned to you" icon={User} />
        <Section title="Reported by me" bugs={data?.reportedByMe} emptyText="You haven't reported any bugs" icon={AlertCircle} />
      </div>
    </div>
  );
}
