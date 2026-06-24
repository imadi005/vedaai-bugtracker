'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Clock, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useSocket } from '@/lib/socket';
import { STATUS_COLORS, SEVERITY_COLORS, timeAgo, formatDate } from '@/lib/utils';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'FIXED', 'CLOSED', 'REOPENED'];

export default function BugDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [comment, setComment] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bug', params.id],
    queryFn: () => api.get(`/bugs/${params.id}`).then((r) => r.data),
  });

  useEffect(() => {
    if (!socket) return;
    socket.emit('bug:join', params.id);
    socket.on('bug:updated', () => refetch());
    socket.on('bug:status_changed', () => refetch());
    socket.on('comment:new', () => refetch());
    socket.on('comment:deleted', () => refetch());
    return () => {
      socket.emit('bug:leave', params.id);
      socket.off('bug:updated');
      socket.off('bug:status_changed');
      socket.off('comment:new');
      socket.off('comment:deleted');
    };
  }, [socket, params.id]);

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/bugs/${params.id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bug', params.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.post(`/comments/bug/${params.id}`, { content }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['bug', params.id] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/comments/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bug', params.id] }),
  });

  if (isLoading) {
    return <div className="p-8 text-gray-400 text-sm">Loading bug...</div>;
  }

  const bug = data?.bug;
  if (!bug) return <div className="p-8 text-gray-400 text-sm">Bug not found</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/bugs" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[bug.severity as keyof typeof SEVERITY_COLORS]}`}>
              {bug.severity}
            </span>
            {bug.module && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{bug.module}</span>}
            {bug.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{bug.category}</span>}
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mt-1">{bug.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{bug.description}</p>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Comments ({bug.comments?.length || 0})
            </h2>
            <div className="space-y-4">
              {bug.comments?.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {c.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.user?.name}</span>
                      <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                      {(c.userId === user?.id || user?.role === 'ADMIN') && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                          className="text-xs text-gray-300 hover:text-red-400 ml-auto"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && comment.trim() && commentMutation.mutate(comment)}
                  placeholder="Add a comment..."
                  className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={() => comment.trim() && commentMutation.mutate(comment)}
                  disabled={!comment.trim() || commentMutation.isPending}
                  className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Audit log */}
          {bug.auditLogs?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Activity</h2>
              <div className="space-y-2">
                {bug.auditLogs.map((log: any) => (
                  <div key={log.id} className="text-xs text-gray-500 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                    <span>
                      <strong className="text-gray-700">{log.user?.name}</strong>{' '}
                      {log.action === 'STATUS_CHANGED' && `changed status from ${log.oldValue} → ${log.newValue}`}
                      {log.action === 'BUG_CREATED' && 'reported this bug'}
                      {log.action === 'BUG_UPDATED' && 'updated bug details'}
                      {log.action === 'BUG_ASSIGNED' && `assigned bug to someone`}
                      {' '}· {timeAgo(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h2>
            <div className="space-y-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => s !== bug.status && statusMutation.mutate(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    bug.status === s
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</h2>

            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <div className="text-xs text-gray-500">Reporter</div>
              <div className="text-xs font-medium text-gray-900 ml-auto">{bug.reporter?.name}</div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <div className="text-xs text-gray-500">Assignee</div>
              <div className="text-xs font-medium text-gray-900 ml-auto">
                {bug.assignee?.name || 'Unassigned'}
              </div>
            </div>

            {bug.dueDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <div className="text-xs text-gray-500">Due date</div>
                <div className={`text-xs font-medium ml-auto ${new Date(bug.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDate(bug.dueDate)}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
              <div className="text-xs text-gray-500">Reported</div>
              <div className="text-xs font-medium text-gray-900 ml-auto">{formatDate(bug.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
