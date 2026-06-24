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

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Bug className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">VedaAI</div>
            <div className="text-xs text-gray-400">Bug Tracker</div>
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}

        {(user?.role === 'ADMIN' || user?.role === 'PM') && (
          <>
            <div className="pt-3 pb-1">
              <div className="text-xs font-medium text-gray-400 px-3 uppercase tracking-wider">Admin</div>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  pathname.startsWith(item.href)
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 truncate">{user?.role}</div>
          </div>
          <button
            onClick={() => logout()}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
