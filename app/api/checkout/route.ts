// app/api/checkout/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/** Map your SKUs (from your UI) to Stripe Price IDs */
const PRICE_MAP: Record<string, string> = {
  PARISIENS_ADULT: "price_1SFuSsBq3JaiOlPJhMq7H9YM",
  PARISIENS_CHILD: "price_1SFuTDBq3JaiOlPJrLzArpUb",
  MOUCHES_ADULT: "price_1SFuTmBq3JaiOlPJNYtSb4I3",
  MOUCHES_CHILD: "price_1SFuTyBq3JaiOlPJy4lutU4K",
  BIGBUSCOMBO_ADULT: "price_1SFuUZBq3JaiOlPJjrdeFNVL",
  BIGBUSCOMBO_CHILD: "price_1SFuV4Bq3JaiOlPJtSPjwSO9",
};

type CreateSessionItem = { sku: string; quantity: number };
type CreateSessionBody = {
  items: CreateSessionItem[];
  date?: string;
  successUrl?: string;
  cancelUrl?: string;
  customerEmail?: string; // optional: pass from client if you have it
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  // ---------- Parse & validate body ----------
  let body: CreateSessionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Invalid payload: items[] required" }, { status: 400 });
  }

  // ---------- Build Stripe line_items ----------
  let line_items: { price: string; quantity: number }[];
  try {
    line_items = body.items.map((it) => {
      if (!it || typeof it.sku !== "string") {
        throw new Error("Each item must include a sku:string");
      }
      const priceId = PRICE_MAP[it.sku];
      if (!priceId) {
        const keys = Object.keys(PRICE_MAP).join(", ");
        throw new Error(`No Stripe price mapped for SKU "${it.sku}". Valid SKUs: ${keys}`);
      }
      const qty = Number.isFinite(it.quantity) ? Math.max(1, Math.floor(it.quantity)) : 1;
      return { price: priceId, quantity: qty };
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid items" }, { status: 400 });
  }

  // ---------- URLs ----------
  const baseUrlRaw = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrlRaw) {
    return NextResponse.json({ error: "NEXT_PUBLIC_BASE_URL not set" }, { status: 500 });
  }
  const baseUrl = baseUrlRaw.replace(/\/$/, "");
  const success_url = body.successUrl ?? `${baseUrl}/success`;
  const cancel_url = body.cancelUrl ?? `${baseUrl}/cancel`;

  // ---------- Stripe client ----------
  const stripe = getStripe();

  // ---------- Session params ----------
  const params = {
    mode: "payment" as const,
    line_items,
    success_url,
    cancel_url,
    customer_email: body.customerEmail || undefined,
    // include date in metadata so it flows to the webhook/n8n
    metadata: { source: "homepage", ...(body.date ? { date: body.date } : {}) },
  };

  // ---------- Idempotency (safe) ----------
  // Hash full params. If anything changes (items, date, urls, email), the key changes.
  const idemKey = crypto.createHash("sha256").update(JSON.stringify(params)).digest("hex");

  try {
    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: `checkout:${idemKey}`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    // Surface useful error text to the client + logs
    const msg = err?.raw?.message || err?.message || "Stripe error";
    console.error("checkout error:", err, {
      mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test",
      firstPrice: line_items[0]?.price,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
