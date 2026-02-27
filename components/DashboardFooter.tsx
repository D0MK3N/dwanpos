import React from 'react';

export default function DashboardFooter() {
  return (
    <footer className="w-full bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400 mt-auto">
      &copy; {new Date().getFullYear()} DwanPOS Admin. All rights reserved.
    </footer>
  );
}
