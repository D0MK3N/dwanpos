import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardHeader() {
  const { user } = useAuth();
  return (
    <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between shadow-sm z-10">
      <div className="text-xl font-bold tracking-wide text-blue-700 dark:text-cyan-300">Admin Dashboard</div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="font-medium text-neutral-700 dark:text-neutral-200">{user.name}</span>
        )}
        {/* Add avatar, notifications, or settings here if needed */}
      </div>
    </header>
  );
}
