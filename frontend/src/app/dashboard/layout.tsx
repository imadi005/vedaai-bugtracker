'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/lib/store';
import { useSocket } from '@/lib/socket';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  useSocket(); // Initialize socket connection

  useEffect(() => {
    if (!token && !user) {
      router.push('/auth/login');
    }
  }, [token, user]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
