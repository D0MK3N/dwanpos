import React, { useState } from 'react';

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

interface Props {
  formData: Partial<UserProfile>;
  setFormData: (f: Partial<UserProfile>) => void;
  setEditing: (v: boolean) => void;
  setProfile: (p: UserProfile) => void;
  setProfileSuccess: (msg: string | null) => void;
  setProfileError: (msg: string | null) => void;
}

export default function ProfileEditForm({ formData, setFormData, setEditing, setProfile, setProfileSuccess, setProfileError }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  function validate() {
    const newErrors: { [k: string]: string } = {};
    if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Nama minimal 2 karakter';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email tidak valid';
    // Optional: validasi field lain
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      const { getAuthToken } = await import('@/app/utils/auth');
      const token = getAuthToken();
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Gagal update profil');
      const data = await res.json();
      setProfile(data);
      setProfileSuccess('Profil berhasil diupdate!');
      setEditing(false);
    } catch (e: any) {
      setProfileError(e.message || 'Gagal update profil');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold mb-1">Nama</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
        </div>
        {/* Tambah field lain sesuai kebutuhan */}
      </div>
      <div>
        <label className="block font-semibold mb-1">Bio</label>
        <textarea
          value={formData.bio || ''}
          onChange={e => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          rows={3}
        />
      </div>
      <div className="flex gap-4 justify-end">
        <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 border-none">Batal</button>
        <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 shadow border-none" disabled={submitting}>
          {submitting ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </div>
    </form>
  );
}