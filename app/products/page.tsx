
'use client';


import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardFooter from '@/components/DashboardFooter';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const baseUrl = '';

type Product = {
  id: string;
  name: string;
  category_name: string;
  category: string; // readable name from backend
  price: number;
  stock: number;
  image_url?: string;
};

type ProductForm = Omit<Product, 'id' | 'category'>;


export default function ProductsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>({ name: '', category_name: '', price: 0, stock: 0, image_url: '' });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [editId, setEditId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  // UI: Info for section
  const sectionInfo = {
    title: 'Daftar Produk',
    subtitle: 'Kelola produk toko Anda dengan mudah dan nyaman.'
  };

  // Auth guard: redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  async function fetchCategories() {
    try {
      const res = await fetch(`${baseUrl}/api/categories/`);
      if (!res.ok) throw new Error('Gagal mengambil data kategori');
      const data = await res.json();
      setCategories(data.data || []);
    } catch {}
  }

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${baseUrl}/api/products/`);
      if (!res.ok) throw new Error('Gagal mengambil data produk');
      const data = await res.json();
      setProducts(data.data || []);
    } catch (e) {
      setError('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId
        ? `${baseUrl}/api/products/${editId}`
        : `${baseUrl}/api/products/`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Gagal menyimpan produk');
      setShowForm(false);
      setForm({ name: '', category_name: '', price: 0, stock: 0 });
      setEditId(null);
      fetchProducts();
    } catch (e) {
      alert('Gagal menyimpan produk');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      const res = await fetch(`${baseUrl}/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus produk');
      fetchProducts();
    } catch (e) {
      alert('Gagal menghapus produk');
    }
  }

  function handleEdit(product: Product) {
    setForm({
      name: product.name,
      category_name: product.category_name,
      price: product.price,
      stock: product.stock,
      image_url: typeof product.image_url === 'string' ? product.image_url : ''
    });
    setImagePreview(typeof product.image_url === 'string' ? product.image_url : '');
    setEditId(product.id);
    setShowForm(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, image_url: reader.result as string }));
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const filtered = products.filter(
    (p) =>
      (categoryFilter === '' || p.category_name === categoryFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  // Show loading while checking auth
  if (authLoading || !user) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-900">
      {/* Sidebar */}
      <Sidebar />
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-screen ml-0 lg:ml-64">
        {/* Dashboard Header */}
        <DashboardHeader />
        {/* Main page content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-8 bg-transparent min-h-[calc(100vh-120px)]">
          {/* Section Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-extrabold text-blue-900 dark:text-white mb-1 tracking-tight">{sectionInfo.title}</h1>
            <p className="text-blue-700 dark:text-blue-200 text-base">{sectionInfo.subtitle}</p>
          </div>
          {/* Filter & Search Card */}
          <div className="mb-6 bg-white/95 dark:bg-neutral-800 rounded-2xl shadow p-6 border border-blue-100 dark:border-blue-800 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto flex-1">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 placeholder:text-blue-400"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Cari produk, kode..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full md:w-72 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 placeholder:text-blue-400"
              />
            </div>
            <button
              className="w-full md:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition text-base mt-2 md:mt-0 shadow border-none"
              onClick={() => {
                setShowForm(true);
                setForm({ name: '', category_name: categories[0]?.name || '', price: 0, stock: 0 });
                setEditId(null);
              }}
            >
              + Tambah Produk
            </button>
          </div>
          {/* Form Card */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white/95 dark:bg-neutral-800 p-6 rounded-2xl shadow border border-blue-100 dark:border-blue-800 space-y-4 max-w-2xl w-full mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Nama Produk"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-lg bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 placeholder:text-blue-400"
                />
                <select
                  value={form.category_name}
                  onChange={e => setForm(f => ({ ...f, category_name: e.target.value }))}
                  required
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-lg bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="number"
                  placeholder="Harga"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  required
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-lg bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 placeholder:text-blue-400"
                />
                <input
                  type="number"
                  placeholder="Stok"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                  required
                  className="flex-1 px-4 py-2 border border-blue-200 rounded-lg bg-white dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 placeholder:text-blue-400"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border" />
                )}
              </div>
              <div className="flex gap-4 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setImagePreview(''); }} className="px-4 py-2 rounded bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-200 border-none">Batal</button>
                <button type="submit" className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 shadow border-none">
                  {editId ? 'Update' : 'Tambah'} Produk
                </button>
              </div>
            </form>
          )}
          {/* Table Card */}
          <div className="overflow-x-auto rounded-2xl shadow bg-white/95 dark:bg-neutral-800 border border-blue-100 dark:border-blue-800">
            {loading ? (
              <div className="text-center py-8 text-blue-400">Memuat data produk...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-tl-2xl font-semibold">Kode</th>
                    <th className="px-4 py-3 text-left font-semibold">Gambar</th>
                    <th className="px-4 py-3 text-left font-semibold">Nama Produk</th>
                    <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                    <th className="px-4 py-3 text-right font-semibold">Harga</th>
                    <th className="px-4 py-3 text-right font-semibold">Stok</th>
                    <th className="px-4 py-3 text-center rounded-tr-2xl font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-blue-300">Tidak ada produk ditemukan.</td>
                    </tr>
                  ) : (
                    filtered.map(product => (
                      <tr key={product.id} className="border-b last:border-b-0 border-blue-50 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-blue-900 dark:text-blue-100">{product.id}</td>
                        <td className="px-4 py-3">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-14 h-14 object-cover rounded border" />
                          ) : (
                            <span className="text-blue-300 italic">Tidak ada</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-blue-900 dark:text-white">{product.name}</td>
                        <td className="px-4 py-3 text-blue-900 dark:text-blue-100">{product.category_name || '-'}</td>
                        <td className="px-4 py-3 text-right text-blue-900 dark:text-blue-100">Rp {product.price.toLocaleString('id-ID')}</td>
                        <td className="px-4 py-3 text-right text-blue-900 dark:text-blue-100">{product.stock}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-blue-600 dark:text-blue-300 hover:underline font-medium mr-2" onClick={() => handleEdit(product)}>Edit</button>
                          <button className="text-red-500 dark:text-red-400 hover:underline font-medium" onClick={() => handleDelete(product.id)}>Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
        {/* Dashboard Footer */}
        <DashboardFooter />
      </div>
    </div>
  );
}