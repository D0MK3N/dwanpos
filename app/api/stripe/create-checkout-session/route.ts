import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { user_id, plan_type, amount, currency } = await req.json();
  const res = await fetch(process.env.STRIPE_EXPRESS_URL + "/api/checkout/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount,
      currency,
      metadata: { user_id, plan_type },
    }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: true, message: "Failed to create Stripe Checkout session" }, { status: 500 });
  }
  const { url } = await res.json();
  return NextResponse.json({ url });
}
