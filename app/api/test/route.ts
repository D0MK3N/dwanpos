import { NextResponse } from 'next/server';

export async function GET() {
  console.log('✅ TEST API ROUTE HIT!');
  return NextResponse.json({ 
    message: 'Test API is working!',
    timestamp: new Date().toISOString()
  });
}