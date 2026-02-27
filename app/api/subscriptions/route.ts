import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/mysql';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    let rows;
    if (userId) {
      // Ambil semua subscription user ini
      [rows] = await db.query('SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    } else {
      [rows] = await db.query('SELECT * FROM subscriptions ORDER BY created_at DESC');
    }
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, plan, status, activatedAt, userId } = await request.json();
    console.log('💾 Saving subscription:', { orderId, plan, status, userId });
    // Nonaktifkan semua subscription lama user ini
    await db.query('UPDATE subscriptions SET is_active = 0 WHERE user_id = ?', [userId]);
    // Tambahkan subscription baru
    const [result]: any = await db.query(
      'INSERT INTO subscriptions (user_id, plan_type, is_active, expires_at, payment_id, created_at, updated_at) VALUES (?, ?, 1, ?, ?, NOW(), NOW())',
      [userId, plan, null, orderId]
    );
    return NextResponse.json({
      success: true,
      message: 'Subscription saved',
      subscription: {
        id: result && result.insertId ? result.insertId : null,
        user_id: userId,
        plan_type: plan,
        is_active: 1,
        payment_id: orderId
      }
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}