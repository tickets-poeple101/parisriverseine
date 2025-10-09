// app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const stripe = getStripe();

export async function POST(req: Request) {
  const hdrs = await headers(); // <-- await to satisfy your TS defs
  const sig = hdrs.get("stripe-signature");
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whsec) {
    return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown signature error";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const full = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["line_items.data.price.product"],
    });

    const lineItems =
      full.line_items?.data.map((li) => {
        const product =
          typeof li.price?.product === "string" ? undefined : li.price?.product;

        return {
          quantity: li.quantity ?? 1,
          priceId: li.price?.id ?? null,
          productId:
            typeof li.price?.product === "string"
              ? li.price?.product
              : product?.id ?? null,
          productName:
            product && typeof product === "object"
              ? (product as Stripe.Product).name
              : null,
        };
      }) ?? [];

    const payload = {
      sessionId: full.id,
      paymentStatus: full.payment_status,
      amountTotal: full.amount_total,
      currency: full.currency,
      customerDetails: full.customer_details,
      metadata: full.metadata,
      lineItems,
      created: full.created,
      mode: full.mode,
    };

    const res = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.N8N_SHARED_SECRET!}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "n8n failed");
      console.error("n8n forward failed:", msg);
      return new NextResponse("received with n8n error", { status: 200 });
    }
  }

  return new NextResponse("ok", { status: 200 });
}
