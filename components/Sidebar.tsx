
'use client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({ userProfile, userPlan, sidebarOpen, setSidebarOpen }: { userProfile?: UserProfile | null, userPlan?: string, sidebarOpen?: boolean, setSidebarOpen?: (open: boolean) => void }) {
  const pathname = usePathname();
  // Use controlled sidebarOpen for mobile
  const isOpen = typeof sidebarOpen === 'boolean' ? sidebarOpen : true;

  const menuSections = [
    {
      label: 'Main',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      ],
    },
    {
      label: 'Produk Management',
      items: [
        { href: '/products', label: 'Daftar Produk', icon: '📦' },
        { href: '/categories', label: 'Kategori Produk', icon: '🗂️' },
        { href: '/stock', label: 'Stok & Gudang', icon: '🏬' },
      ],
    },
    {
      label: 'Lainnya',
      items: [
        { href: '/payments', label: 'Payments', icon: '💳' },
        { href: '/profile', label: 'Profile', icon: '👤' },
        { href: '/api-docs', label: 'API Documentation', icon: '📚' },
      ],
    },
  ];

  return (
    <>
      {/* Profile Info */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-500 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 border-r border-white/20 dark:border-neutral-800 transition-transform w-64 lg:w-64 z-40 shadow-2xl lg:block ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
                {/* Close button for mobile sidebar */}
        {/* Close button for mobile sidebar */}
        {typeof sidebarOpen === 'boolean' && setSidebarOpen && (
          <div className="lg:hidden absolute top-4 right-4">
            <button
              className="p-2 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6 border-b border-white/20 dark:border-neutral-800 flex flex-col items-center gap-3">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
            DwanPOS
          </h1>
          {userProfile && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <img src={`https://i.pravatar.cc/80?u=${userProfile.email}`} className="w-16 h-16 rounded-full border-2 border-white shadow-lg" alt="Profile" />
              <div className="text-white font-bold text-lg">{userProfile.name}</div>
              <div className="text-white/80 text-xs">{userProfile.email}</div>
              {userPlan && <div className="text-xs bg-white/20 px-2 py-1 rounded text-white mt-1">Paket: <span className="uppercase">{userPlan}</span></div>}
            </div>
          )}
        </div>
        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {menuSections.map(section => (
            <div key={section.label}>
              <div className="text-xs font-bold uppercase text-white/60 tracking-wider mb-2 pl-2">{section.label}</div>
              <div className="space-y-1">
                {section.items.map(item => {
                  const isActive = (pathname ?? '').startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all text-base group ${
                        isActive
                          ? 'bg-white/10 text-white shadow-lg ring-2 ring-white/30'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen && setSidebarOpen(false)}
                    >
                      <span className="text-2xl drop-shadow-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      {/* Mobile Overlay */}
      {typeof sidebarOpen === 'boolean' && isOpen && setSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
