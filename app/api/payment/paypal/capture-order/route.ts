import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎯 PAYPAL CAPTURE-ORDER API CALLED');
  
  try {
    const { orderID } = await request.json();
    console.log('Capturing order:', orderID);

    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const BASE_URL = process.env.PAYPAL_BASE_URL;

    console.log('PayPal Config:', {
      hasClientId: !!CLIENT_ID,
      hasClientSecret: !!CLIENT_SECRET,
      baseUrl: BASE_URL
    });

    // Jika credentials tidak ada, gunakan mock
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.log('⚠️ Using mock PayPal capture');
      return NextResponse.json({
        status: 'COMPLETED',
        id: orderID,
        purchase_units: [{
          payments: {
            captures: [{
              id: 'mock-capture-' + Date.now(),
              status: 'COMPLETED',
              amount: {
                currency_code: 'USD',
                value: '3.33'
              }
            }]
          }
        }]
      });
    }

    console.log('🔐 Using real PayPal capture');

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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ PayPal auth failed:', errorText);
      throw new Error('PayPal authentication failed');
    }

    const { access_token } = await tokenResponse.json();
    console.log('✅ Got access token');

    // Capture payment
    console.log('🔄 Capturing payment...');
    const captureResponse = await fetch(
      `${BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 Capture response status:', captureResponse.status);

    const captureData = await captureResponse.json();
    console.log('📡 Capture response data:', captureData);

    if (!captureResponse.ok) {
      console.error('❌ PayPal capture failed:', captureData);
      throw new Error(captureData.message || 'Failed to capture payment');
    }

    console.log('✅ Payment captured successfully:', captureData.status);
    return NextResponse.json(captureData);

  } catch (error) {
    console.error('💥 Error in capture-order:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}