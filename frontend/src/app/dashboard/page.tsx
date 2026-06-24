'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Bug, AlertCircle, Clock, CheckCircle, RotateCcw, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { useSocket } from '@/lib/socket';
import { STATUS_COLORS, SEVERITY_COLORS, formatDate, timeAgo } from '@/lib/utils';
import Link from 'next/link';

const statCards = [
  { key: 'open', label: 'Open', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  { key: 'inProgress', label: 'In Progress', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'fixed', label: 'Fixed', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { key: 'closed', label: 'Closed', icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-50' },
  { key: 'reopened', label: 'Reopened', icon: RotateCcw, color: 'text-purple-500', bg: 'bg-purple-50' },
  { key: 'overdue', label: 'Overdue', icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
];

const PIE_COLORS = ['#EF4444', '#F59E0B', '#10B981'];

export default function DashboardPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
    refetchInterval: 60000,
  });

  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on('dashboard:refresh', () => refetch());
    return () => { socket.off('dashboard:refresh'); };
  }, [socket]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const { stats, severity, recentBugs, memberStats } = data || {};

  const severityData = [
    { name: 'High', value: severity?.high || 0 },
    { name: 'Medium', value: severity?.medium || 0 },
    { name: 'Low', value: severity?.low || 0 },
  ];

  return (
    <div className="p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of all bugs across VedaAI</p>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
          <Bug className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
          <div className="text-sm text-gray-500">Total bugs reported</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key] || 0;
          return (
            <div key={card.key} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-xl font-semibold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Severity pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Active bugs by severity</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                {severityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Member stats */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Bugs per team member</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={memberStats?.slice(0, 8)}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="assigned" name="Assigned" fill="#4f6ef7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bugs */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent bugs</h2>
          <Link href="/bugs" className="text-xs text-brand-600 hover:text-brand-700">View all →</Link>
        </div>
        <div className="space-y-2">
          {recentBugs?.map((bug: any) => (
            <Link
              key={bug.id}
              href={`/bugs/${bug.id}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
                {bug.severity}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{bug.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {bug.module && <span className="mr-2">{bug.module}</span>}
                  {timeAgo(bug.createdAt)}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
                {bug.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
