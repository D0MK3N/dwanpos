import { NextResponse } from 'next/server';

// Contoh struktur transaksi sesuai UI
// {
//   id: string,
//   items: [{ productId: string, qty: number, price: number }],
//   total: number,
//   paymentMethod: string,
//   orderType: 'Dine-in' | 'Takeaway' | 'Delivery',
//   tableNumber?: string, // untuk Dine-in
//   orderNote?: string, // catatan order
//   createdAt: string
// }

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Validasi field utama
    if (!data.orderType || !['Dine-in', 'Takeaway', 'Delivery'].includes(data.orderType)) {
      return NextResponse.json({ success: false, error: 'Tipe order tidak valid' }, { status: 400 });
    }
    if (data.orderType === 'Dine-in' && !data.tableNumber) {
      return NextResponse.json({ success: false, error: 'Nomor meja wajib diisi untuk Dine-in' }, { status: 400 });
    }
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Item pesanan tidak boleh kosong' }, { status: 400 });
    }
    // Simpan transaksi ke database (mock)
    // TODO: Integrasi dengan backend/database
    return NextResponse.json({ success: true, transaction: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid transaction data' }, { status: 400 });
  }
}

export async function GET() {
  // TODO: Ambil daftar transaksi dari database
  return NextResponse.json({ success: true, transactions: [] });
}
