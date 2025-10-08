// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "NO_WEBHOOK_SECRET" }, { status: 500 });
  }

  let event: any;
  try {
    const raw = await req.text(); // must be raw for signature verify
    console.log("🛰️  Webhook hit. Has signature?", !!sig);
    event = stripe.webhooks.constructEvent(raw, sig!, secret);
  } catch (err: any) {
    console.error("❌ BAD_SIGNATURE:", err.message);
    return NextResponse.json({ error: "BAD_SIGNATURE" }, { status: 400 });
  }

  console.log("✅ Stripe event:", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items", "line_items.data.price.product"],
      });

      const payload = {
        session_id: session.id,
        mode: session.mode,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_details?.email ?? null,
        date: session.metadata?.date ?? null,
        line_items: (full.line_items?.data || []).map((li: any) => ({
          description:
            li.description ||
            li.price?.product?.name ||
            li.price?.nickname ||
            "Item",
          quantity: li.quantity,
          unit_amount: li.price?.unit_amount,
          currency: li.price?.currency,
        })),
      };

      const url = process.env.N8N_WEBHOOK_URL!;
      const bearer = process.env.N8N_SHARED_SECRET || "";
      console.log("➡️  Forwarding to n8n:", { url, hasSecret: !!bearer, items: payload.line_items?.length });

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${bearer}`,
          "X-Source": "stripe",
        },
        body: JSON.stringify(payload),
      });

      const body = await resp.text().catch(() => "");
      console.log("⬅️  n8n response:", resp.status, body);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Handler error:", err.message || err);
    return NextResponse.json({ error: "HANDLER_ERROR" }, { status: 500 });
  }
}
