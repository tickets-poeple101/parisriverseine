// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Map your SKUs (from your UI) to Stripe Price IDs */
const PRICE_MAP: Record<string, string> = {
  PARISIENS_ADULT: "price_1SFuSsBq3JaiOlPJhMq7H9YM",
  PARISIENS_CHILD: "price_1SFuTDBq3JaiOlPJrLzArpUb",
  MOUCHES_ADULT: "price_1SFuTmBq3JaiOlPJNYtSb4I3",
  MOUCHES_CHILD: "price_1SFuTyBq3JaiOlPJy4lutU4K",
  BIGBUSCOMBO_ADULT: "price_1SFuUZBq3JaiOlPJjrdeFNVL",
  BIGBUSCOMBO_CHILD: "price_1SFuV4Bq3JaiOlPJtSPjwSO9",
};

type Item = { sku: string; quantity: number };
type Body = {
  items: Item[];
  date?: string;
  customerEmail?: string; // optional
};

export async function POST(req: Request) {
  // ---------- Parse & validate ----------
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "items[] required" }, { status: 400 });
  }

  // ---------- Merge duplicates + clamp quantities ----------
  const merged: Record<string, number> = {};
  for (const it of body.items) {
    if (!it || typeof it.sku !== "string") continue;
    const priceId = PRICE_MAP[it.sku];
    if (!priceId) continue; // ignore unknown SKU (anti-tamper)
    const qty = Number.isFinite(it.quantity)
      ? Math.max(1, Math.min(50, Math.floor(it.quantity)))
      : 1;
    merged[priceId] = (merged[priceId] ?? 0) + qty;
  }

  const line_items = Object.entries(merged).map(([price, quantity]) => ({
    price,
    quantity,
    // adjustable_quantity: { enabled: false }, // enable if you want fixed qty in Checkout
  }));

  if (line_items.length === 0) {
    return NextResponse.json({ error: "No valid items" }, { status: 400 });
  }

  // ---------- URLs (server-controlled) ----------
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ error: "NEXT_PUBLIC_BASE_URL not set" }, { status: 500 });
  }

  // ---------- Stripe ----------
  const stripe = getStripe();

  try {
    // IMPORTANT: No idempotency key here → always a new session.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${base}/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?canceled=1`,
      customer_email: body.customerEmail || undefined,
      metadata: { source: "homepage", ...(body.date ? { date: body.date } : {}) },
    });

    const res = NextResponse.json({ url: session.url }, { status: 200 });
    res.headers.set("Cache-Control", "no-store, max-age=0"); // don’t cache this response
    return res;
  } catch (err: unknown) {
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message?: string }).message)
        : "Stripe error";
    console.error("checkout error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Optional: reject GET
export function GET() {
  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
