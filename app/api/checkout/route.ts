// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/** Map your SKUs (from data/products.json) to Stripe Price IDs */
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
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  let parsed: unknown;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("items" in parsed) ||
    !Array.isArray((parsed as Record<string, unknown>).items)
  ) {
    return NextResponse.json({ error: "Invalid payload: items[] required" }, { status: 400 });
  }

  const { items, date, successUrl, cancelUrl } = parsed as CreateSessionBody;
  if (items.length === 0) return NextResponse.json({ error: "No items" }, { status: 400 });

  // Build Stripe line_items from SKUs → Price IDs
  const line_items = items.map((it) => {
    if (!it || typeof it.sku !== "string") throw new Error("Item missing sku");
    const priceId = PRICE_MAP[it.sku];
    if (!priceId) throw new Error(`No Stripe price mapped for SKU "${it.sku}"`);
    const qty = Number.isFinite(it.quantity) ? Math.max(1, Math.floor(it.quantity)) : 1;
    return { price: priceId, quantity: qty };
  });

  const baseUrlRaw = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrlRaw) return NextResponse.json({ error: "NEXT_PUBLIC_BASE_URL not set" }, { status: 500 });
  const baseUrl = baseUrlRaw.replace(/\/$/, ""); // trim trailing slash

  const success_url = successUrl ?? `${baseUrl}/success`;
  const cancel_url = cancelUrl ?? `${baseUrl}/cancel`;

  const stripe = getStripe();

  // Log mode + first price to catch live/test mismatches quickly
  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items,
        success_url,
        cancel_url,
        metadata: { source: "homepage", ...(date ? { date } : {}) },
      },
      {
        idempotencyKey: `checkout:${JSON.stringify(line_items)}:${date ?? "no-date"}`,
      }
    );

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    // Bubble clear errors to the client so your alert shows something useful
    const msg =
      (err as any)?.raw?.message ||
      (err as Error)?.message ||
      "Stripe error";
    console.error("checkout error:", err, {
      keyMode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "live" : "test",
      firstPrice: line_items[0]?.price,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
