import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

export async function POST(request: NextRequest) {
  try {
    const { amount, plan, userId, userEmail } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        plan,
        userId: userId || "",
        userEmail: userEmail || "",
      },
    });

    // Record payment in Go backend
    try {
      await fetch(process.env.GO_BACKEND_URL + "/api/payments/stripe/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (process.env.GO_BACKEND_API_KEY || "")
        },
        body: JSON.stringify({
          user_id: userId,
          plan_type: plan,
          amount: amount / 100, // USD cents to dollars
          currency: "USD",
          method: "stripe",
          stripe_payment_intent_id: paymentIntent.id,
        }),
      });
    } catch (err) {
      console.error("Failed to record payment in Go backend:", err);
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
