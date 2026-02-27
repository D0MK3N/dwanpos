import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  console.log('🔍 Checking order status:', orderId);

  try {
    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const BASE_URL = process.env.PAYPAL_BASE_URL;

    // Jika credentials tidak ada, gunakan mock
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json({
        id: orderId,
        status: 'COMPLETED',
        create_time: new Date().toISOString()
      });
    }

    // Get access token
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    // Get order details
    const orderResponse = await fetch(
      `${BASE_URL}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const orderData = await orderResponse.json();
    return NextResponse.json(orderData);

  } catch (error) {
    console.error('Error checking order status:', error);
    return NextResponse.json(
      { error: 'Failed to check order status' },
      { status: 500 }
    );
  }
}