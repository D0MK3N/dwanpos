// app/dashboard/page.tsx - Enhanced dashboard with profile and detailed stats
"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
// Hydration-safe number formatting
function HydrationSafeNumber({ number }: { number: number }) {
  const [formatted, setFormatted] = useState('0');
  useEffect(() => {
    setFormatted(number.toLocaleString('id-ID'));
  }, [number]);
  return <span suppressHydrationWarning>{formatted}</span>;
}

// Hydration-safe date formatting
function HydrationSafeDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState(dateString);
  useEffect(() => {
    if (dateString && dateString !== "-") {
      const d = new Date(dateString);
      setFormatted(d.toLocaleDateString("id-ID"));
    }
  }, [dateString]);
  return <span suppressHydrationWarning>{formatted}</span>;
}
import type { RecentActivity } from "@/types/dashboard";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}
interface UserSubscription {
  plan_type: string;
  is_active: boolean;
}

interface DashboardStats {
  total_users: number;
  total_payments: number;
  total_revenue: number;
  active_subscriptions: number;
  subscriptions_by_plan: {
    free: number;
    standard: number;
    premium: number;
  };
}

// Plan product limits
const planLimits = {
  free: 10,
  standard: 100,
  premium: 1000
};

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function EnhancedDashboardPage() {
    // Sidebar open state
    const [sidebarOpen, setSidebarOpen] = useState(false);
  // Cart handlers
  function addToCart(prod: Product) {
    setCart(prev => {
      const found = prev.find(item => item.name === prod.name);
      if (found) {
        return prev.map(item => item.name === prod.name ? {...item, qty: item.qty + 1} : item);
      }
      return [...prev, {name: prod.name, price: prod.price, qty: 1}];
    });
  }
  function removeFromCart(name: string) {
    setCart(prev => prev.filter(item => item.name !== name));
  }
  function updateQty(name: string, qty: number) {
    setCart(prev => prev.map(item => item.name === name ? {...item, qty: Math.max(1, qty)} : item));
  }
  // State transaksi kasir POS
  const [cart, setCart] = useState<{name: string, price: number, qty: number}[]>([]);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
  }, [cart]);
  function handleTransaction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTransactionMsg('');
    if (cart.length === 0) {
      setTransactionMsg('Keranjang kosong.');
      return;
    }
    if (cash < total) {
      setTransactionMsg('Uang tunai kurang.');
      return;
    }
    setTimeout(() => {
      setTransactionMsg('Transaksi berhasil disimpan!');
      setCart([]);
      setCash(0);
    }, 800);
  }
  // Tripay payment modal state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [tripayInfo, setTripayInfo] = useState<{paymentUrl?: string, instructions?: string} | null>(null);
  // State untuk data dashboard
  // Handler for deleting product
  function handleDeleteProduct(id: string) {
    setProductLoading(true);
    setTimeout(() => {
      setProducts(prev => prev.filter(prod => prod.id !== id));
      setProductLoading(false);
    }, 500);
  }
    // Handler for adding product
    function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setProductError('');
      if (!newProduct.name.trim()) {
        setProductError('Nama produk wajib diisi.');
        return;
      }
      if (newProduct.price <= 0) {
        setProductError('Harga produk harus lebih dari 0.');
        return;
      }
      if (products.length >= currentLimit) {
        setProductError('Jumlah produk sudah mencapai batas paket.');
        return;
      }
      setProductLoading(true);
      // Simulate API call
      setTimeout(() => {
        setProducts(prev => [...prev, {
          id: Date.now().toString(),
          name: newProduct.name,
          price: newProduct.price
        }]);
        setNewProduct({name: '', price: 0});
        setProductLoading(false);
      }, 800);
    }
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // State untuk riwayat transaksi
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  useEffect(() => {
    if (!userProfile?.id) return;
    setHistoryLoading(true);
    fetch(`/api/transactions/history?user_id=${userProfile.id}`)
      .then(res => res.json())
      .then(data => setHistory(data.data || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [userProfile]);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate currentLimit after userPlan is defined (hydration-safe)
  const [currentLimit, setCurrentLimit] = useState<number>(10);
  useEffect(() => {
    setCurrentLimit(planLimits[userPlan as keyof typeof planLimits] || 10);
  }, [userPlan]);

  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({name: '', price: 0});
  const [productError, setProductError] = useState('');
  const [productLoading, setProductLoading] = useState(false);

  // State transaksi kasir POS
  // (removed duplicate cart state)
  const [cash, setCash] = useState(0);
  const [transactionMsg, setTransactionMsg] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  return (
    <div className="w-full min-h-screen bg-white dark:bg-blue-950 flex">
      {/* Burger menu for sidebar (mobile) */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Sidebar with profile info */}
      <Sidebar
        userProfile={userProfile}
        userPlan={userPlan}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {/* Main dashboard content */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Header */}
        <div className="bg-blue-700 shadow-2xl rounded-b-3xl pb-10">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-10 flex flex-col gap-4 md:gap-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2 md:mb-3 tracking-tight flex items-center gap-3">
              <span>🛒</span> Kasir POS
            </h1>
            <p className="text-blue-100 text-base md:text-lg">
              Selamat datang, <span className="font-bold text-white drop-shadow">{userProfile?.name || "User"}</span>
              <br />
              <span className="text-xs font-semibold">Paket: <span className="uppercase bg-blue-100 px-3 py-1 rounded text-blue-900 ml-2 tracking-wider shadow">{userPlan}</span></span>
            </p>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 px-4 sm:px-8 md:px-12 py-8">
          {/* Left: Produk & Transaksi */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Produk Terbaru */}
            <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-blue-100 flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">🆕 Produk Terbaru</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl shadow p-6 text-center text-gray-400 flex flex-col items-center gap-2">
                    <span className="text-4xl">📦</span>
                    <span>Belum ada produk.</span>
                  </div>
                ) : (
                  products.slice(-3).reverse().map((prod: Product) => (
                    <div key={prod.id} className="bg-blue-50 rounded-2xl shadow-md p-4 flex flex-col gap-1 border-l-4 border-blue-400 hover:shadow-xl transition-all">
                      <span className="font-medium text-blue-800 text-base md:text-lg flex items-center gap-2">📦 {prod.name}</span>
                      <span className="text-blue-700 text-base">Rp <HydrationSafeNumber number={prod.price} /></span>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Product Management Section */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-blue-200 flex flex-col gap-6 md:gap-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">📋 Daftar Produk</h2>
              <form onSubmit={handleAddProduct} className="flex flex-col md:flex-row gap-4 md:gap-6 mb-2 md:mb-4">
                <input
                  type="text"
                  placeholder="Nama produk"
                  value={newProduct.name}
                  onChange={e => setNewProduct((p: {name: string, price: number}) => ({...p, name: e.target.value}))}
                  className="flex-1 px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-lg shadow-sm"
                  disabled={products.length >= currentLimit || productLoading}
                />
                <input
                  type="number"
                  placeholder="Harga"
                  value={newProduct.price || ''}
                  onChange={e => setNewProduct((p: {name: string, price: number}) => ({...p, price: Number(e.target.value)}))}
                  className="w-36 md:w-48 px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-lg shadow-sm"
                  min={0}
                  disabled={products.length >= currentLimit || productLoading}
                />
                <button
                  type="submit"
                  className="px-6 md:px-10 py-3 md:py-4 rounded-xl bg-blue-700 text-white font-bold text-base md:text-lg shadow-lg hover:bg-blue-800 transition disabled:opacity-50"
                  disabled={products.length >= currentLimit || productLoading}
                >
                  {productLoading ? 'Menyimpan...' : 'Tambah Produk'}
                </button>
              </form>
              {productError && <div className="text-red-500 text-sm mb-2">{productError}</div>}
              <div className="text-xs md:text-sm text-blue-700 mb-2">
                Paket <span className="font-bold uppercase">{userPlan}</span>: Maksimal {currentLimit} produk
              </div>
              <ul className="divide-y divide-blue-100">
                {products.length === 0 && <li className="text-gray-400 py-2 flex items-center gap-2"><span className="text-xl">📦</span> Belum ada produk.</li>}
                {products.map((prod: Product, idx: number) => (
                  <li key={prod.id} className="flex justify-between items-center py-3 md:py-4 hover:bg-blue-50/60 rounded-xl transition-all">
                    <span className="font-medium text-blue-900 text-base md:text-lg flex items-center gap-2">📦 {prod.name}</span>
                    <span className="text-blue-700 text-base md:text-lg">Rp <HydrationSafeNumber number={prod.price} /></span>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="ml-4 px-3 md:px-4 py-2 text-xs md:text-sm rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition font-semibold shadow"
                      disabled={productLoading}
                    >
                      🗑 Hapus
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Transaksi Section */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-blue-200 flex flex-col gap-6 md:gap-8">
              <h2 className="text-2xl font-bold text-blue-900 mb-2 flex items-center gap-2">💸 Transaksi Kasir</h2>
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                {/* Daftar Produk */}
                <div>
                  <h3 className="font-semibold text-blue-700 mb-3">Pilih Produk</h3>
                  <ul className="divide-y divide-blue-50">
                    {products.length === 0 && <li className="text-gray-400 py-2 flex items-center gap-2"><span className="text-xl">📦</span> Belum ada produk.</li>}
                    {products.map((prod: Product, idx: number) => (
                      <li key={prod.id} className="flex justify-between items-center py-3 hover:bg-blue-50/60 rounded-xl transition-all">
                        <span className="font-medium text-blue-900 text-base md:text-lg flex items-center gap-2">📦 {prod.name}</span>
                        <span className="text-blue-700 text-base md:text-lg">Rp <HydrationSafeNumber number={prod.price} /></span>
                        <button
                          onClick={() => addToCart(prod)}
                          className={`ml-4 px-3 md:px-4 py-2 text-xs md:text-sm rounded-xl font-semibold shadow transition ${cart.some(item => item.name === prod.name) ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                          disabled={cart.some(item => item.name === prod.name)}
                        >
                          {cart.some(item => item.name === prod.name) ? '✔ Ditambahkan' : '➕ Tambah'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Keranjang & Pembayaran */}
                <div className="mt-6 md:mt-8">
                  <h3 className="font-semibold text-blue-700 mb-3">Keranjang</h3>
                  <ul className="divide-y divide-blue-50 mb-4 md:mb-6">
                    {cart.length === 0 && <li className="text-gray-400 py-2 flex items-center gap-2"><span className="text-xl">🛒</span> Keranjang kosong.</li>}
                    {cart.map((item: {name: string, price: number, qty: number}, idx: number) => (
                      <li key={item.name} className="flex items-center justify-between py-3 hover:bg-purple-50/60 rounded-xl transition-all">
                        <span className="font-medium text-blue-900 text-base md:text-lg flex items-center gap-2">📦 {item.name}</span>
                        <span className="text-blue-700 text-base md:text-lg">Rp <HydrationSafeNumber number={item.price} /></span>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={e => updateQty(item.name, Number(e.target.value))}
                          className="w-20 md:w-24 ml-2 px-3 py-2 border border-blue-300 rounded-xl text-blue-900 text-base md:text-lg shadow-sm"
                        />
                        <button
                          onClick={() => removeFromCart(item.name)}
                          className="ml-2 px-3 md:px-4 py-2 text-xs md:text-sm rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition font-semibold shadow"
                        >
                          ❌ Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={handleTransaction} className="space-y-4 md:space-y-6">
                    <div className="flex justify-between items-center border-t border-blue-100 pt-4 mt-2">
                      <span className="font-semibold text-blue-900 text-base md:text-lg flex items-center gap-2">💰 Total</span>
                      <span className="text-2xl md:text-3xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-xl shadow-inner flex items-center gap-2">Rp <HydrationSafeNumber number={total} /></span>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm text-blue-900 mb-2">Uang Tunai</label>
                      <input
                        type="number"
                        min={0}
                        value={cash || ''}
                        onChange={e => setCash(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-lg shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 md:py-4 rounded-xl bg-blue-700 text-white font-bold text-base md:text-lg shadow-lg hover:bg-blue-800 transition"
                      disabled={cart.length === 0 || cash < total}
                    >
                      Proses Transaksi
                    </button>
                    {transactionMsg && <div className="text-center text-blue-700 font-medium mt-2">{transactionMsg}</div>}
                    {/* Modal Pembayaran Tripay QRIS */}
                    {showPaymentModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-xs text-center">
                          <h4 className="font-bold text-blue-900 mb-6 text-xl">Pembayaran QRIS (Tripay Sandbox)</h4>
                          {paymentLoading ? (
                            <div className="text-blue-700 font-semibold">Memproses transaksi...</div>
                          ) : tripayInfo && tripayInfo.paymentUrl ? (
                            <>
                              <a
                                href={tripayInfo.paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-3 bg-yellow-400 text-blue-900 rounded-2xl font-bold mt-2 shadow-lg"
                              >
                                Buka Link Pembayaran QRIS
                              </a>
                              <div className="text-xs text-gray-600 mt-2">{tripayInfo.instructions || ''}</div>
                              <button
                                className="w-full py-3 rounded-2xl bg-gray-200 text-gray-700 font-semibold mt-6 shadow"
                                onClick={() => { setShowPaymentModal(false); setTripayInfo(null); }}
                              >
                                Tutup
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="text-red-500">Gagal membuat transaksi Tripay QRIS.</div>
                              <button
                                className="w-full py-3 rounded-2xl bg-gray-200 text-gray-700 font-semibold mt-6 shadow"
                                onClick={() => { setShowPaymentModal(false); setTripayInfo(null); }}
                              >
                                Tutup
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Tripay Info */}
                    {tripayInfo && tripayInfo.paymentUrl && (
                      <div className="text-center mt-6">
                        <a
                          href={tripayInfo.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-6 py-3 bg-yellow-400 text-blue-900 rounded-2xl font-bold mt-2 shadow-lg"
                        >
                          Bayar via Tripay (Sandbox)
                        </a>
                        <div className="text-xs text-gray-600 mt-2">{tripayInfo.instructions || ''}</div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Riwayat Transaksi & Aktivitas */}
          <div className="w-full lg:w-[420px] flex flex-col gap-8">
            {/* Riwayat Transaksi Kasir */}
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-blue-200">
              <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">📑 Riwayat Transaksi Kasir</h2>
              {historyLoading ? (
                <div className="text-blue-400">Memuat riwayat transaksi...</div>
              ) : history.length === 0 ? (
                <div className="text-gray-400 flex flex-col items-center gap-2"><span className="text-4xl">📄</span> Belum ada transaksi.</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl shadow bg-white border border-blue-100">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead className="bg-blue-50 text-blue-900">
                      <tr>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Tanggal</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Total</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Tunai</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Kembali</th>
                        <th className="px-3 md:px-4 py-2 md:py-3 text-left">Item</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((trx: any) => (
                        <tr key={trx.id} className="border-b last:border-b-0 border-blue-50 hover:bg-blue-50 transition-colors">
                          <td className="px-3 md:px-4 py-2 md:py-3"><HydrationSafeDate dateString={trx.created_at} /></td>
                          <td className="px-3 md:px-4 py-2 md:py-3 font-semibold text-blue-800">Rp <HydrationSafeNumber number={trx.total} /></td>
                          <td className="px-3 md:px-4 py-2 md:py-3">Rp <HydrationSafeNumber number={trx.cash} /></td>
                          <td className="px-3 md:px-4 py-2 md:py-3">Rp <HydrationSafeNumber number={trx.change} /></td>
                          <td className="px-3 md:px-4 py-2 md:py-3">
                            <ul className="list-disc ml-4">
                              {trx.items && trx.items.map((item: any) => (
                                <li key={item.id} className="flex items-center gap-1">📦 {item.product_name} <span className="text-xs text-gray-500">x{item.qty}</span> <span className="text-blue-700">(Rp <HydrationSafeNumber number={item.price} />)</span></li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Recent Activity Section (hydration-safe date) */}
            {recentActivity.length > 0 && (
              <div className="bg-white/90 rounded-3xl shadow-xl p-6 md:p-8 border border-blue-200">
                <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">🕒 Aktivitas Terbaru</h2>
                <div className="flex flex-col gap-4">
                  {recentActivity.map((act: RecentActivity, idx: number) => (
                    <div key={idx} className="bg-blue-50 rounded-xl shadow p-4 flex flex-col gap-1 border-l-4 border-blue-400 hover:shadow-lg transition-all">
                      <span className="font-medium text-blue-800 text-base md:text-lg flex items-center gap-2">📝 {act.title}</span>
                      <span className="text-blue-500 text-xs flex items-center gap-1">⏱ <HydrationSafeDate dateString={act.time} /></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  // ...existing code...
}
