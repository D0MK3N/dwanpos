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
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Fetch profile data (simulate real-time sync, ready for mobile integration)
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setProfileError(null);
      try {
        const { getAuthToken } = await import('@/app/utils/auth');
        const token = getAuthToken();
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Gagal memuat profil');
        const data = await res.json();
        setProfile(data);
        setFormData(data);
      } catch (e: any) {
        setProfileError(e.message || 'Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
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
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-blue-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!profile && !profileError) return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Ringkasan', icon: '👤' },
    { id: 'security', label: 'Keamanan', icon: '🔒' },
    { id: 'api', label: 'Kunci API', icon: '🔑' },
    { id: 'activity', label: 'Aktivitas', icon: '📊' },
    { id: 'preferences', label: 'Preferensi', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-blue-950 p-6">
      <div className="max-w-5xl mx-auto">
        {profileError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-center">
            {profileError}
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-100 mb-2 tracking-tight">
            Pengaturan Profil
          </h1>
          <p className="text-lg text-blue-700 dark:text-blue-200">
            Kelola akun, keamanan, dan preferensi Anda di sini
          </p>
        </div>

        {/* Profile Card */}
        <div className="mb-8 bg-white/95 dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden border border-blue-100 dark:border-blue-800">
          <div className="relative bg-blue-600 h-44">
            <div className="absolute -bottom-16 left-8 flex items-end gap-6">
              <div className="relative group">
                <img
                  src={formData.avatar || profile?.avatar || 'https://i.pravatar.cc/150'}
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
                <h2 className="text-3xl font-bold drop-shadow-lg">{profile?.name || 'Pengguna'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-white/90">{profile?.email || 'Belum ada email'}</p>
                  {profile?.email_verified && (
                    <span className="px-2 py-0.5 bg-green-500 rounded text-xs font-bold">✓ Terverifikasi</span>
                  )}
                </div>
                {profile?.job_title && <p className="text-white/80 text-sm mt-1">{profile.job_title}</p>}
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
            {profile && profile.bio && !editing && (
              <p className="text-neutral-700 dark:text-neutral-300 mb-6 text-lg">{profile.bio}</p>
            )}
            {/* ...existing code for editing and viewing profile fields... */}
            {editing ? (
              <ProfileEditForm
                formData={formData}
                setFormData={setFormData}
                setEditing={setEditing}
                setProfile={setProfile}
                setProfileSuccess={setProfileSuccess}
                setProfileError={setProfileError}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* ...existing code for profile info cards... */}
              </div>
            )}
            {profileSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-center">
                {profileSuccess}
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
                  ? 'bg-blue-600 text-white shadow-lg'
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
          {activeTab === 'api' && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 p-6">
              <h2 className="text-2xl font-bold text-blue-700 dark:text-cyan-300 mb-4 flex items-center gap-2">🔑 API Key</h2>
              <ApiKeySection />
              <div className="mt-6 text-sm text-blue-700 dark:text-blue-200">
                <ul className="list-disc ml-6">
                  <li>Gunakan <span className="font-mono">X-API-Key</span> sesuai endpoint: produk, kategori, transaksi.</li>
                  <li>API key berbeda untuk setiap endpoint, bisa digenerate ulang kapan saja.</li>
                  <li>Jaga kerahasiaan API key, jangan dibagikan ke pihak tidak berwenang.</li>
                  <li>Jika API key bocor, segera generate ulang.</li>
                </ul>
              </div>
            </div>
          )}
          {/* ...existing code for other tabs... */}
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
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-xl transition-all font-bold"
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

function ApiKeySection() {
  const [apiKeys, setApiKeys] = useState<{ api_key_product: string; api_key_category: string; api_key_transaction: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchApiKeys() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/api-keys', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) throw new Error('Gagal mengambil API key');
      const data = await res.json();
      setApiKeys(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile/api-keys/generate', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (!res.ok) throw new Error('Gagal generate API key');
      const data = await res.json();
      setApiKeys(data);
      showToast('API key berhasil digenerate!');
    } catch (e: any) {
      setError(e.message);
      showToast('Gagal generate API key', 'bg-red-600');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <p className="text-blue-700 dark:text-blue-200 mb-2">API key digunakan untuk autentikasi akses endpoint produk, kategori, dan transaksi.</p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition-all"
          >
            🔄 Generate API Key Baru
          </button>
        </div>
        {loading && <span className="text-blue-600 dark:text-blue-300 animate-pulse">Memuat...</span>}
        {error && <span className="text-red-600 dark:text-red-400">{error}</span>}
      </div>
      {apiKeys && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <ApiKeyCard label="Produk" value={apiKeys.api_key_product} />
          <ApiKeyCard label="Kategori" value={apiKeys.api_key_category} />
          <ApiKeyCard label="Transaksi" value={apiKeys.api_key_transaction} />
        </div>
      )}
    </div>
  );
}

function ApiKeyCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-xl p-4 flex flex-col gap-2 shadow">
      <span className="font-bold text-blue-700 dark:text-cyan-300 text-lg">{label} API Key</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs break-all bg-white dark:bg-neutral-800 px-2 py-1 rounded select-all border border-blue-100 dark:border-blue-800">{value || '-'}</span>
        <button
          onClick={() => copyToClipboard(value, `${label} API Key`)}
          className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
        >
          Salin
        </button>
      </div>
    </div>
  );
}

// ProfileEditForm component for editing profile fields
function ProfileEditForm({
  formData,
  setFormData,
  setEditing,
  setProfile,
  setProfileSuccess,
  setProfileError,
}: {
  formData: Partial<UserProfile>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setProfileSuccess: React.Dispatch<React.SetStateAction<string | null>>;
  setProfileError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const { getAuthToken } = await import('@/app/utils/auth');
      const token = getAuthToken();
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Gagal menyimpan perubahan');
      const data = await res.json();
      setProfile(data);
      setProfileSuccess('Profil berhasil diperbarui!');
      setEditing(false);
    } catch (e: any) {
      setProfileError(e.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Nama</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Telepon</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Perusahaan</label>
          <input
            type="text"
            name="company"
            value={formData.company || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Jabatan</label>
          <input
            type="text"
            name="job_title"
            value={formData.job_title || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Lokasi</label>
          <input
            type="text"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
          />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1 text-blue-700 dark:text-blue-200">Bio</label>
        <textarea
          name="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-100"
          rows={3}
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-xl transition-all"
        >
          {saving ? 'Menyimpan...' : '💾 Simpan'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-8 py-3 bg-neutral-200 dark:bg-neutral-700 text-blue-900 dark:text-blue-100 rounded-xl font-bold hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-all"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
