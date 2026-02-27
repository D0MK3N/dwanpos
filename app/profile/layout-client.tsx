'use client';

import Sidebar from '@/components/Sidebar';

export default function ProfileLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-0 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
