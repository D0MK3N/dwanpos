import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendRes = await fetch('http://localhost:8080/api/plans');
    if (!backendRes.ok) {
      const text = await backendRes.text();
      return NextResponse.json({ error: 'Failed to fetch plans from backend', detail: text }, { status: backendRes.status });
    }
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch plans', detail: error?.message }, { status: 500 });
  }
}
