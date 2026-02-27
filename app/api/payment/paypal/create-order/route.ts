import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🎯 PAYPAL CREATE-ORDER API CALLED');
  
  try {
    const { plan, amount, currency = 'USD' } = await request.json();
    console.log('Request:', { plan, amount, currency });

    // Validasi
    if (!plan || !amount) {
      return NextResponse.json(
        { error: 'Missing plan or amount' },
        { status: 400 }
      );
    }

    const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    const BASE_URL = process.env.PAYPAL_BASE_URL;

    // Jika credentials tidak ada, gunakan mock
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.log('⚠️ Using mock PayPal (credentials not found)');
      const mockOrder = {
        id: 'mock-order-' + Date.now(),
        status: 'CREATED',
        links: [{
          href: 'https://www.sandbox.paypal.com/checkoutnow?token=mock-token',
          rel: 'approve',
          method: 'GET'
        }]
      };
      return NextResponse.json(mockOrder);
    }

    console.log('🔐 Using real PayPal integration');

    // Get access token dari PayPal
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
      const error = await tokenResponse.text();
      console.error('❌ PayPal auth failed:', error);
      throw new Error('PayPal authentication failed');
    }

    const { access_token } = await tokenResponse.json();

    // Use amount as-is if currency is USD, otherwise convert from IDR
    let usdAmount = amount;
    if (currency === 'IDR') {
      usdAmount = (amount / 15000);
    }
    usdAmount = Number(usdAmount).toFixed(2);

    // Create order di PayPal
    const orderResponse = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: usdAmount,
            },
            description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
            custom_id: plan,
          },
        ],
        application_context: {
          brand_name: 'AI App',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success`,
          cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('❌ PayPal order creation failed:', orderData);
      throw new Error(orderData.message || 'Failed to create PayPal order');
    }

    console.log('✅ PayPal order created:', orderData.id);
    return NextResponse.json(orderData);

  } catch (error) {
    console.error('💥 Error in create-order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}