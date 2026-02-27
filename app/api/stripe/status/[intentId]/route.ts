import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

export async function GET(req: NextRequest, context: { params: { intentId: string } }) {
  const { intentId } = await context.params;
  if (!intentId) {
    return NextResponse.json({ success: false, message: 'Missing intentId' }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
    let status = paymentIntent.status;
    let responseStatus = 'pending';
    if (status === 'succeeded') responseStatus = 'completed';
    else if (status === 'requires_payment_method' || status === 'canceled') responseStatus = 'failed';
    else if (status === 'processing') responseStatus = 'pending';
    // Add more Stripe statuses as needed

    return NextResponse.json({
      success: true,
      data: {
        status: responseStatus,
        stripeStatus: status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        id: paymentIntent.id,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 404 });
  }
}
