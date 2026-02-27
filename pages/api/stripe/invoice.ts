import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { payment_intent_id } = req.query;
  if (!payment_intent_id || typeof payment_intent_id !== 'string') {
    return res.status(400).json({ error: 'Missing payment_intent_id' });
  }
  try {
    // Find invoice by PaymentIntent
    const invoices = await stripe.invoices.list({
      payment_intent: payment_intent_id,
      limit: 1,
    });
    if (!invoices.data.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    const invoice = invoices.data[0];
    return res.status(200).json({ invoice });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
