import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SEVERITY_COLORS = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

export const STATUS_COLORS = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  FIXED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  REOPENED: 'bg-purple-100 text-purple-700',
};

export const STATUS_DOTS = {
  OPEN: 'bg-red-500',
  IN_PROGRESS: 'bg-amber-500',
  FIXED: 'bg-green-500',
  CLOSED: 'bg-gray-400',
  REOPENED: 'bg-purple-500',
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
