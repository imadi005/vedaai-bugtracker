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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
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
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Here's what's happening with your bugs today</p>
        </div>
        <Link
          href="/bugs/new"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-orange-200"
        >
          <Bug className="w-4 h-4" />
          Report Bug
        </Link>
      </div>

      {/* Total bug banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-5 mb-5 flex items-center gap-4 text-white shadow-lg shadow-orange-100">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Bug className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-4xl font-bold">{stats?.total || 0}</div>
          <div className="text-orange-100 text-sm mt-0.5">Total bugs reported across all modules</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold">{stats?.overdue || 0}</div>
          <div className="text-orange-200 text-xs">overdue 🔥</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key] || 0;
          return (
            <div key={card.key} className={`bg-white rounded-2xl border ${card.border} p-4 hover:shadow-sm transition-shadow`}>
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5 font-medium">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Severity pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Active bugs by severity</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={65}
                innerRadius={35}
                paddingAngle={3}
              >
                {severityData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {severityData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-xs text-gray-500">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Member stats */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Team workload</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={memberStats?.slice(0, 6)} barSize={10}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
              />
              <Bar dataKey="assigned" name="Assigned" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent bugs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Recent bugs</h2>
          <Link href="/bugs" className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
            View all →
          </Link>
        </div>
        <div className="space-y-1">
          {recentBugs?.map((bug: any) => (
            <Link
              key={bug.id}
              href={`/bugs/${bug.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
                {bug.severity}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate group-hover:text-orange-600 transition-colors">{bug.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  {bug.module && <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs">{bug.module}</span>}
                  <span>{timeAgo(bug.createdAt)}</span>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[bug.status as keyof typeof STATUS_COLORS]}`}>
                {bug.status.replace('_', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
