'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bug, LayoutDashboard, User, Bell, LogOut, ChevronRight, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bugs', icon: Bug, label: 'All Bugs' },
  { href: '/my-bugs', icon: User, label: 'My Bugs' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];

const adminItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
];

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-600',
  PM: 'bg-orange-100 text-orange-600',
  DEVELOPER: 'bg-blue-100 text-blue-600',
  QA: 'bg-green-100 text-green-600',
  VIEWER: 'bg-gray-100 text-gray-500',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm shadow-orange-200">
            <Bug className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-none">VedaAI</div>
            <div className="text-xs text-orange-400 font-medium mt-0.5">Bug Tracker</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-orange-500' : 'text-gray-400')} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-orange-300" />}
            </Link>
          );
        })}

        {(user?.role === 'ADMIN' || user?.role === 'PM') && (
          <>
            <div className="pt-4 pb-1 px-3">
              <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Admin</div>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  pathname.startsWith(item.href)
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0 text-gray-400" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all group">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate leading-none">{user?.name}</div>
            <div className={cn('text-xs mt-0.5 font-medium px-1.5 py-0.5 rounded-full inline-block', ROLE_BADGE[user?.role || 'VIEWER'])}>
              {user?.role}
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-gray-300 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
