import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  const url = new URL(request.url);
  const query = url.search || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) headers['x-api-key'] = apiKey;
  const res = await fetch(`${backendUrl}/api/transactions/${query}`, {
    method: 'GET',
    headers,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  const body = await request.text();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) headers['x-api-key'] = apiKey;
  const res = await fetch(`${backendUrl}/api/transactions/`, {
    method: 'POST',
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
