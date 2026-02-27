import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || 'http://localhost:8080';
  // Fetch categories and products in parallel
  const [catRes, prodRes] = await Promise.all([
    fetch(`${backendUrl}/api/categories/`, { headers: { 'Content-Type': 'application/json' } }),
    fetch(`${backendUrl}/api/products`, { headers: { 'Content-Type': 'application/json' } })
  ]);
  const catData = await catRes.json();
  const prodData = await prodRes.json();
  const products = prodData.data || [];
  // Combine product count into categories
  const categoriesWithCount = (catData.data || []).map((cat: any) => ({
    ...cat,
    productCount: products.filter((p: any) => p.category_name === cat.name).length,
  }));
  return Response.json({ data: categoriesWithCount }, { status: 200 });
}
