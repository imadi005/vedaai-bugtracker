'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30 * 1000 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInit>{children}</AuthInit>
    </QueryClientProvider>
  );
}

function AuthInit({ children }: { children: React.ReactNode }) {
  const { fetchMe, token } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (token) await fetchMe();
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading VedaAI...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
