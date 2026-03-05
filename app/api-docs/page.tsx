import React from "react";

// Simple sidebar for API docs navigation
function ApiSidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-gradient-to-b from-blue-600 via-blue-500 to-cyan-500 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 shadow-xl z-40 flex flex-col items-center py-8 px-4">
      <h2 className="text-white text-xl font-extrabold mb-8 tracking-wide">API Docs</h2>
      <nav className="flex flex-col gap-4 w-full">
        <a href="#produk" className="text-white/90 hover:text-white font-semibold px-3 py-2 rounded transition-all">Produk</a>
        <a href="#kategori" className="text-white/90 hover:text-white font-semibold px-3 py-2 rounded transition-all">Kategori</a>
        <a href="#transaksi" className="text-white/90 hover:text-white font-semibold px-3 py-2 rounded transition-all">Transaksi</a>
        <a href="#catatan" className="text-white/90 hover:text-white font-semibold px-3 py-2 rounded transition-all">Catatan</a>
      </nav>
      <div className="mt-auto w-full flex flex-col items-center">
        <a href="/dashboard" className="mt-8 px-4 py-2 rounded-lg bg-white text-blue-600 font-bold shadow hover:bg-blue-100 transition-all w-full text-center flex items-center justify-center gap-2">
          <span className="text-xl">←</span> Dashboard
        </a>
      </div>
    </aside>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
      <ApiSidebar />
      <main className="flex-1 ml-56 p-4 md:p-8 max-w-3xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800">
        <header className="flex items-center gap-4 mb-8">
          <span className="inline-block text-5xl text-blue-600 dark:text-cyan-400">📚</span>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent tracking-wide drop-shadow-lg">API Documentation</h1>
        </header>
        <p className="mb-10 text-lg text-gray-700 dark:text-gray-300">
          Dokumentasi endpoint API untuk Mobile POS dan aplikasi lain. Navigasi sidebar, layout responsif, dan tampilan ramah pengguna.
        </p>

        <div className="space-y-10">
          {/* Produk Section */}
          <section id="produk" className="rounded-xl border border-blue-200 dark:border-cyan-900 bg-blue-50 dark:bg-neutral-800 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📦</span>
              <h2 className="text-xl font-bold text-blue-700 dark:text-cyan-300">Produk</h2>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-700 dark:text-cyan-300">GET</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-mono">/api/products</span>
              <span className="text-gray-600 dark:text-gray-400">— List semua produk</span>
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>Auth:</strong> Bisa pakai <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> (login user) <b>atau</b> <span className="font-mono">X-API-Key: &lt;api_key_produk&gt;</span> (tanpa login).
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>API Key:</strong> API key produk bisa dilihat/generate di halaman profil. Jangan bagikan ke pihak lain.
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Query Params:</strong> <span className="font-mono">(none)</span>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Request:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`GET /api/products\nX-API-Key: <api_key_produk>`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Response:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{
  "success": true,
  "message": "Data produk berhasil diambil",
  "data": [
    { "id": "P001", "name": "Es Teh", "category_name": "Minuman", "price": 8000, "stock": 20, "image_url": "..." },
    ...
  ]
}`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Error Response:</strong>
            </div>
            <pre className="bg-red-50 dark:bg-red-900 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{
  "success": false,
  "message": "Gagal mengambil data produk",
  "data": null
}`}</code></pre>
          </section>

          {/* Kategori Section */}
          <section id="kategori" className="rounded-xl border border-blue-200 dark:border-cyan-900 bg-blue-50 dark:bg-neutral-800 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🗂️</span>
              <h2 className="text-xl font-bold text-blue-700 dark:text-cyan-300">Kategori</h2>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-700 dark:text-cyan-300">GET</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-mono">/api/categories</span>
              <span className="text-gray-600 dark:text-gray-400">— List semua kategori produk</span>
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>Auth:</strong> Bisa pakai <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> (login user) <b>atau</b> <span className="font-mono">X-API-Key: &lt;api_key_kategori&gt;</span> (tanpa login).
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>API Key:</strong> API key kategori bisa dilihat/generate di halaman profil. Jangan bagikan ke pihak lain.
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Query Params:</strong> <span className="font-mono">(none)</span>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Request:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`GET /api/categories\nX-API-Key: <api_key_kategori>`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Response:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{
  "success": true,
  "message": "Data kategori berhasil diambil",
  "data": [
    { "id": "C001", "name": "Minuman" },
    ...
  ]
}`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Error Response:</strong>
            </div>
            <pre className="bg-red-50 dark:bg-red-900 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{
  "success": false,
  "message": "Gagal mengambil data kategori",
  "data": null
}`}</code></pre>
          </section>

          {/* Transaksi Section */}
          <section id="transaksi" className="rounded-xl border border-blue-200 dark:border-cyan-900 bg-blue-50 dark:bg-neutral-800 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💳</span>
              <h2 className="text-xl font-bold text-blue-700 dark:text-cyan-300">Transaksi</h2>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-700 dark:text-cyan-300">POST</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-mono">/api/transactions</span>
              <span className="text-gray-600 dark:text-gray-400">— Buat transaksi baru</span>
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>Auth:</strong> Bisa pakai <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> (login user) <b>atau</b> <span className="font-mono">X-API-Key: &lt;api_key_transaksi&gt;</span> (tanpa login).
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>API Key:</strong> API key transaksi bisa dilihat/generate di halaman profil. Jangan bagikan ke pihak lain.
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Body Params:</strong>
              <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`{
  "user_id": "mobile-pos-user-002",
  "cash": 50000,
  "order_type": "Takeaway",
  "items": [
    { "product_id": "P001", "qty": 2 }
  ]
}`}</code></pre>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Request:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`POST /api/transactions\nX-API-Key: <api_key_transaksi>\nContent-Type: application/json\n{ ...body... }`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Response:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`{
  "success": true,
  "message": "Transaksi berhasil dibuat",
  "data": {
    "id": "T001",
    "items": [ ... ]
  }
}`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Error Response:</strong>
            </div>
            <pre className="bg-red-50 dark:bg-red-900 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{
  "success": false,
  "message": "Gagal membuat transaksi",
  "data": null
}`}</code></pre>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-700 dark:text-cyan-300">GET</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-mono">/api/transactions/history?user_id=...</span>
              <span className="text-gray-600 dark:text-gray-400">— Riwayat transaksi user</span>
            </div>
            <div className="mb-2 text-xs text-blue-700 dark:text-cyan-300">
              <strong>Auth:</strong> Sama seperti endpoint transaksi, bisa pakai JWT atau API key transaksi.
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Query Params:</strong> <span className="font-mono">user_id</span>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Request:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`GET /api/transactions/history?user_id=...\nX-API-Key: <api_key_transaksi>`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Response:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{
  "success": true,
  "message": "Riwayat transaksi ditemukan",
  "data": [
    { "id": "T001", "items": [ ... ] }
  ]
}`}</code></pre>
          </section>

          {/* Catatan Section */}
          <section id="catatan" className="rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📝</span>
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Catatan</h2>
            </div>
            <ul className="list-disc ml-6 text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>Semua endpoint menerima dan mengembalikan data dalam format <span className="font-mono">JSON</span>.</li>
              <li>Gunakan header <code>ngrok-skip-browser-warning: true</code> jika mengakses via ngrok.</li>
              <li>Pastikan <span className="font-mono">Content-Type: application/json</span> untuk request POST.</li>
              <li>Jika terjadi error, periksa field <span className="font-mono">success</span> dan <span className="font-mono">message</span> pada response.</li>
              <li>Setiap endpoint produk, kategori, transaksi bisa diakses dengan dua cara:
                <ul className="list-disc ml-6">
                  <li><span className="font-mono">Authorization: Bearer &lt;token&gt;</span> (login user)</li>
                  <li><span className="font-mono">X-API-Key</span> sesuai endpoint (tanpa login)</li>
                </ul>
              </li>
              <li>API key bisa digenerate dan dilihat di halaman profil. Jangan bagikan ke pihak lain, dan segera generate ulang jika bocor.</li>
              <li>Untuk endpoint yang butuh auth lain, tambahkan header <span className="font-mono">Authorization: Bearer &lt;token&gt;</span> jika diperlukan.</li>
            </ul>
          </section>

          {/* Login & Register Section */}
          <section id="login-register" className="rounded-xl border border-blue-200 dark:border-cyan-900 bg-blue-50 dark:bg-neutral-800 p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔑</span>
              <h2 className="text-xl font-bold text-blue-700 dark:text-cyan-300">Login & Register</h2>
            </div>
            {/* Login */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-700 dark:text-cyan-300">POST</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-mono">/auth/login</span>
              <span className="text-gray-600 dark:text-gray-400">— Login user</span>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Body Params:</strong>
              <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`{\n  "username": "user001",\n  "password": "yourpassword"\n}`}</code></pre>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Request:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`POST /auth/login\nContent-Type: application/json\n{ ...body... }`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Response:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{\n  "success": true,\n  "message": "Login berhasil",\n  "token": "<jwt_token>",\n  "user": { "id": "user001", "name": "User Satu" }\n}`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Error Response:</strong>
            </div>
            <pre className="bg-red-50 dark:bg-red-900 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{\n  "success": false,\n  "message": "Username atau password salah",\n  "token": null\n}`}</code></pre>
            {/* Register */}
            <div className="mt-6 mb-3 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-blue-700 dark:text-cyan-300">POST</span>
              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-700 text-xs font-mono">/auth/register</span>
              <span className="text-gray-600 dark:text-gray-400">— Register user baru</span>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Body Params:</strong>
              <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`{\n  "username": "user002",\n  "password": "yourpassword",\n  "name": "User Dua"\n}`}</code></pre>
            </div>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Request:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2"><code>{`POST /auth/register\nContent-Type: application/json\n{ ...body... }`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Contoh Response:</strong>
            </div>
            <pre className="bg-gray-100 dark:bg-neutral-800 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{\n  "success": true,\n  "message": "Registrasi berhasil",\n  "user": { "id": "user002", "name": "User Dua" }\n}`}</code></pre>
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
              <strong>Error Response:</strong>
            </div>
            <pre className="bg-red-50 dark:bg-red-900 rounded-lg p-3 text-xs overflow-x-auto mt-2"><code>{`{\n  "success": false,\n  "message": "Username sudah terdaftar",\n  "user": null\n}`}</code></pre>
          </section>
        </div>
      </main>
    </div>
  );
}
