'use client';

import { useState, useEffect } from 'react';

// Toast utility
function showToast(message: string, color: string = 'bg-green-600') {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 ${color} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] text-lg font-semibold transition-opacity duration-300`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 2000);
}

// Copy to clipboard
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => showToast(`${label} disalin!`), () => showToast(`Gagal menyalin`, 'bg-red-600'));
}

// Interfaces
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at: string;
  avatar?: string;
  email_verified?: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used?: string;
}

type TabType = 'overview' | 'security' | 'api' | 'activity' | 'preferences';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  // Fetch profile data (simulate real-time sync, ready for mobile integration)
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        // Replace with your actual API endpoint
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setFormData(data);
      } catch (e) {
        showToast('Gagal memuat profil', 'bg-red-600');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // Optionally, add polling or websocket for real-time sync
  }, []);

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Responsive/mobile-friendly: use Tailwind responsive classes throughout
  // ...existing code...
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Ringkasan', icon: '👤' },
    { id: 'security', label: 'Keamanan', icon: '🔒' },
    { id: 'api', label: 'Kunci API', icon: '🔑' },
    { id: 'activity', label: 'Aktivitas', icon: '📊' },
    { id: 'preferences', label: 'Preferensi', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-lg text-blue-700 dark:text-blue-200">
            Kelola akun, keamanan, dan preferensi Anda di sini
          </p>
        </div>

        {/* Profile Card */}
        <div className="mb-8 bg-white/95 dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden border border-blue-100 dark:border-blue-800">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-44">
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <img
                  src={formData.avatar || profile.avatar || 'https://i.pravatar.cc/150'}
                  alt="Avatar"
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-neutral-800 shadow-xl object-cover"
                />
                {editing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold text-sm">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
              <div className="pb-4 text-white">
                <h2 className="text-3xl font-bold drop-shadow-lg">{profile.name || 'Pengguna'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/90">{profile.email || 'Belum ada email'}</p>
                  {profile.email_verified && (
                    <span className="px-2 py-0.5 bg-green-500 rounded text-xs font-bold">✓ Terverifikasi</span>
                  )}
                </div>
                {profile.job_title && <p className="text-white/80 text-sm mt-1">{profile.job_title}</p>}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="absolute top-6 right-6 px-6 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
            >
              {editing ? '✕ Batal' : '✏️ Ubah Profil'}
            </button>
          </div>
          <div className="pt-20 px-8 pb-8">
            {profile.bio && !editing && (
              <p className="text-neutral-700 dark:text-neutral-300 mb-6 text-lg">{profile.bio}</p>
            )}
            {/* ...existing code for editing and viewing profile fields... */}
            {editing ? (
              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ...existing code for form fields... */}
                </div>
                {/* ...existing code for bio textarea and buttons... */}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* ...existing code for profile info cards... */}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white/95 dark:bg-neutral-800 rounded-xl p-2 shadow-lg border border-blue-100 dark:border-blue-800 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-blue-900 dark:text-blue-100 hover:bg-blue-50 dark:hover:bg-blue-900/30'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* ...existing code for tab content, just update card backgrounds/borders to match new style... */}
        </div>

        {/* Tombol Logout */}
        <div className="mt-8 bg-white/95 dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-blue-100 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg">Keluar Akun</p>
              <p className="text-sm text-blue-700 dark:text-blue-200">Keluar dari akun Anda</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                showToast('Keluar...');
                setTimeout(() => window.location.href = '/login', 1000);
              }}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-bold"
            >
              🚪 Keluar
            </button>
          </div>
        </div>

      </div>

      {/* ...existing code for modals, just update card backgrounds/borders to match new style... */}
    </div>
  );
}
