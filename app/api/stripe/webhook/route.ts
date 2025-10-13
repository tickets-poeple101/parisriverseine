import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs'; // required for Stripe SDK

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const raw = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      raw,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Stripe signature verify failed:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle only what you care about
  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });

      const payload = {
        type: event.type,
        session_id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
        created: session.created,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
        metadata: session.metadata,
        line_items: lineItems.data.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          amount_subtotal: li.amount_subtotal,
          amount_total: li.amount_total,
          price_id: li.price?.id ?? null,
          product_id: li.price?.product ?? null,
        })),
      };

      // Forward to n8n with the exact header your Webhook node expects
      await fetch(process.env.N8N_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-shared-secret': process.env.N8N_SHARED_SECRET!, // must match your n8n credential
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('Forward to n8n failed:', e);
      // still return 200 so Stripe doesn’t retry forever
    }
  }

  return NextResponse.json({ received: true });
}
