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

type Item = { sku: string; quantity: number; date?: string };
type Body = {
  items: Item[];
  date?: string;            // optional session-level date
  customerEmail?: string;   // optional
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

  // ---------- Normalize + merge duplicates + clamp quantities ----------
  // Key by PRICE_ID (not SKU) so duplicates merge even if SKUs repeat.
  const mergedByPrice: Record<string, number> = {};
  for (const raw of body.items) {
    if (!raw || typeof raw.sku !== "string") continue;

    // Be tolerant: uppercase, swap hyphens for underscores, trim
    const normSku = raw.sku.toUpperCase().replace(/-/g, "_").trim();
    const priceId = PRICE_MAP[normSku];
    if (!priceId) {
      // ignore unknown SKU (anti-tamper / stale UI)
      continue;
    }

    const qtyRaw =
      typeof raw.quantity === "number" ? raw.quantity : parseInt(String(raw.quantity), 10);
    const qty = Number.isFinite(qtyRaw) ? Math.max(1, Math.min(50, Math.floor(qtyRaw))) : 1;


    mergedByPrice[priceId] = (mergedByPrice[priceId] ?? 0) + qty;
  }

  const line_items = Object.entries(mergedByPrice).map(([price, quantity]) => ({
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

  // ---------- Prepare metadata (compact + complete) ----------
  // We persist *per-item* dates if provided; otherwise fall back to body.date
  const itemsForMeta = body.items.map((it) => ({
    sku: it.sku.toUpperCase().replace(/-/g, "_").trim(),
    quantity:
      Number.isFinite(typeof it.quantity === "number" ? it.quantity : parseInt(String(it.quantity), 10))
        ? Math.floor(typeof it.quantity === "number" ? it.quantity : parseInt(String(it.quantity), 10))
        : 1,

    date: it.date ?? body.date ?? null,
  }));

  const stripe = getStripe();

  try {
    // IMPORTANT: No idempotency key → always a new session.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${base}/success?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?canceled=1`,
      customer_email: body.customerEmail || undefined,
      metadata: {
        source: "homepage",
        ...(body.date ? { date: body.date } : {}),
        items_json: JSON.stringify(itemsForMeta),
      },
    });

    const res = NextResponse.json({ url: session.url }, { status: 200 });
    res.headers.set("Cache-Control", "no-store, max-age=0");
    return res;
  } catch (err: unknown) {
    const msg =
      typeof err === "object" && err && "message" in (err as any)
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
