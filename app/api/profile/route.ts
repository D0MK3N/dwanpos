import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  try {
    // Ambil token dari header Authorization atau cookie
    let authHeader = req.headers.get('authorization');
    let cookie = req.headers.get('cookie');
    let headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      return NextResponse.json({ error: true, message: 'Gagal mengambil data profil dari backend', status: res.status }, { status: res.status });
    }
    const data = await res.json();
    // Normalisasi respons agar sesuai frontend
    const user = data.user || data;
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      email_verified: user.email_verified ?? true,
      created_at: user.created_at ?? '',
      // Tambahkan field lain jika backend sudah support
    });
  } catch (error: any) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 });
  }
}
