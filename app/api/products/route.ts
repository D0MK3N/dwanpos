import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  const res = await fetch(`${backendUrl}/api/products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Forward cookies or auth headers if needed
    },
    // credentials: 'include', // Uncomment if you need cookies
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  const body = await req.text();
  const res = await fetch(`${backendUrl}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
