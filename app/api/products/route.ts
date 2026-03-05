import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  // Ambil token dari cookie atau header
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${backendUrl}/api/products`, {
    method: 'GET',
    headers,
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  const body = await req.text();
  // Ambil token dari cookie atau header
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${backendUrl}/api/products`, {
    method: 'POST',
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
