
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import DashboardFooter from '@/components/DashboardFooter';

export default function StockPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Auth guard: redirect if not logged in
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900 flex">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 md:px-8 lg:ml-64">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
            <div className="bg-white/90 dark:bg-neutral-900 rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800 p-8 flex flex-col gap-4">
              <div className="mb-2">
                <h1 className="text-3xl font-extrabold text-blue-900 dark:text-white mb-1 tracking-tight">Stok & Gudang</h1>
                <p className="text-blue-700 dark:text-blue-200 text-base">Halaman ini akan menampilkan stok produk dan gudang untuk kasir.</p>
              </div>
              <div className="bg-white/95 dark:bg-neutral-800 rounded-2xl shadow border border-blue-100 dark:border-blue-800 p-8 text-center">
                <p className="text-blue-900 dark:text-blue-100 text-lg">Belum ada data, silakan tambahkan stok/gudang.</p>
              </div>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}