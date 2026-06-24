'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Bug, AlertCircle, Clock, CheckCircle, RotateCcw, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { useSocket } from '@/lib/socket';
import { STATUS_COLORS, SEVERITY_COLORS, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

const statCards = [
  { key: 'open', label: 'Open', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
  { key: 'inProgress', label: 'In Progress', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  { key: 'fixed', label: 'Fixed', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
  { key: 'closed', label: 'Closed', icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-100' },
  { key: 'reopened', label: 'Reopened', icon: RotateCcw, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  { key: 'overdue', label: 'Overdue', icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
];

const PIE_COLORS = ['#ef4444', '#f97316', '#22c55e'];

export default function DashboardPage() {
  const { user } = useAuthStore();
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
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-48" />
          <div className="h-24 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="p-4 lg:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-4 lg:mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-900">
            Good {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs lg:text-sm text-gray-400 mt-0.5">Here's what's happening with your bugs today</p>
        </div>
        <Link
          href="/bugs/new"
          className="flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs lg:text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-200 flex-shrink-0"
        >
          <Bug className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
          <span className="hidden sm:inline">Report Bug</span>
          <span className="sm:hidden">Report</span>
        </Link>
      </div>

      {/* Total banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 lg:p-5 mb-4 lg:mb-5 flex items-center gap-3 text-white shadow-lg shadow-orange-100">
        <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Bug className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-3xl lg:text-4xl font-bold">{stats?.total || 0}</div>
          <div className="text-orange-100 text-xs lg:text-sm mt-0.5">Total bugs reported</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl lg:text-2xl font-bold">{stats?.overdue || 0}</div>
          <div className="text-orange-200 text-xs">overdue 🔥</div>
        </div>
      </div>

      {/* Stat cards — 3 cols on mobile, 6 on desktop */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3 mb-4 lg:mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key] || 0;
          return (
            <div key={card.key} className={`bg-white rounded-xl lg:rounded-2xl border ${card.border} p-3 lg:p-4`}>
              <div className={`w-7 h-7 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${card.color}`} />
              </div>
              <div className="text-xl lg:text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium leading-tight">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts — stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">By severity</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={30} paddingAngle={3}>
                {severityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-3 mt-1">
            {severityData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-xs text-gray-400">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 lg:p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Team workload</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={memberStats?.slice(0, 5)} barSize={8}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 11 }} />
              <Bar dataKey="assigned" name="Assigned" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bugs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Recent bugs</h2>
          <Link href="/bugs" className="text-xs text-orange-500 hover:text-orange-600 font-semibold">View all →</Link>
        </div>
        <div className="space-y-1">
          {recentBugs?.map((bug: any) => (
            <Link key={bug.id} href={`/bugs/${bug.id}`}
              className="flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
                {bug.severity.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate group-hover:text-orange-600 transition-colors">{bug.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{bug.module} · {timeAgo(bug.createdAt)}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
                {bug.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
