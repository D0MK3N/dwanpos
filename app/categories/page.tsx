

// =======================
//  Kategori Produk Page
// =======================
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import DashboardFooter from '@/components/DashboardFooter';


// =======================
//  Type Definitions
// =======================
type Category = {
  id: string;
  name: string;
  productCount?: number;
};
type CategoryForm = Omit<Category, 'id' | 'productCount'>;


// =======================
//  Main Component
// =======================
export default function CategoriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ name: '' });
  const [editId, setEditId] = useState<string | null>(null);


  // =======================
  //  Auth Guard & Data Fetch
  // =======================
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);


  // =======================
  //  Fetch Categories
  // =======================
  async function fetchCategories() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/categories-with-product-count');
      if (!res.ok) throw new Error('Gagal mengambil data kategori');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (e) {
      setError('Gagal mengambil data kategori');
    } finally {
      setLoading(false);
    }
  }


  // =======================
  //  Handle Form Submit
  // =======================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/categories/${editId}` : '/api/categories';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Gagal menyimpan kategori');
      setShowForm(false);
      setForm({ name: '' });
      setEditId(null);
      fetchCategories();
    } catch (e) {
      alert('Gagal menyimpan kategori');
    }
  }


  // =======================
  //  Handle Delete
  // =======================
  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus kategori');
      fetchCategories();
    } catch (e) {
      alert('Gagal menghapus kategori');
    }
  }


  // =======================
  //  Handle Edit
  // =======================
  function handleEdit(category: Category) {
    setForm({ name: category.name });
    setEditId(category.id);
    setShowForm(true);
  }


  // =======================
  //  Loading State
  // =======================
  if (authLoading || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // =======================
  //  Render
  // =======================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900 flex">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center py-8 px-4 md:px-8 lg:ml-64">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
            {/* Section Card */}
            <div className="bg-white/90 dark:bg-neutral-900 rounded-3xl shadow-xl border border-blue-100 dark:border-blue-800 p-8 flex flex-col gap-4">
              <div className="mb-2">
                <h1 className="text-3xl font-extrabold text-blue-900 dark:text-white mb-1 tracking-tight">Kategori Produk</h1>
                <p className="text-blue-700 dark:text-blue-200 text-base">Kelola kategori produk untuk toko Anda</p>
              </div>
              <div className="flex justify-end">
                <button
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition text-base shadow border-none"
                  onClick={() => {
                    setShowForm(true);
                    setForm({ name: '' });
                    setEditId(null);
                  }}
                >
                  + Tambah Kategori
                </button>
              </div>
              {showForm && (
                <form onSubmit={handleSubmit} className="mb-4 bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow border border-blue-100 dark:border-blue-800 space-y-4 w-full mx-auto">
                  <input
                    type="text"
                    placeholder="Nama Kategori"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 placeholder:text-blue-400"
                  />
                  <div className="flex gap-4 justify-end">
                    <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 rounded bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-200 border-none">Batal</button>
                    <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 shadow border-none">
                      {editId ? 'Update' : 'Tambah'} Kategori
                    </button>
                  </div>
                </form>
              )}
              <div className="overflow-x-auto rounded-2xl shadow bg-white/95 dark:bg-neutral-800 border border-blue-100 dark:border-blue-800">
                {loading ? (
                  <div className="text-center py-8 text-blue-300">Memuat data kategori...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead className="bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100">
                      <tr>
                        <th className="px-4 py-3 text-left rounded-tl-2xl font-semibold">Kode</th>
                        <th className="px-4 py-3 text-left font-semibold">Nama Kategori</th>
                        <th className="px-4 py-3 text-right font-semibold">Jumlah Produk</th>
                        <th className="px-4 py-3 text-center rounded-tr-2xl font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-blue-300">Tidak ada kategori ditemukan.</td>
                        </tr>
                      ) : (
                        categories.map(category => (
                          <tr key={category.id} className="border-b last:border-b-0 border-blue-50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-blue-900 dark:text-blue-100">{category.id}</td>
                            <td className="px-4 py-3 font-semibold text-blue-900 dark:text-white">{category.name}</td>
                            <td className="px-4 py-3 text-right text-blue-900 dark:text-blue-100">{category.productCount}</td>
                            <td className="px-4 py-3 text-center">
                              <button className="text-blue-600 dark:text-blue-300 hover:underline font-medium mr-2" onClick={() => handleEdit(category)}>Edit</button>
                              <button className="text-red-500 dark:text-red-400 hover:underline font-medium" onClick={() => handleDelete(category.id)}>Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
}