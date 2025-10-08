import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET() {
  // quick probe to verify env + route are working
  return NextResponse.json({
    ok: true,
    mode: (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_") ? "test" : "live",
    keyPrefix: (process.env.STRIPE_SECRET_KEY || "").slice(0, 8),
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  });
}

type InItem = {
  title: string;
  variantTitle?: string;
  unitAmountCents: number;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    console.log("📦 /api/checkout payload:", body);

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "NO_ITEMS" }, { status: 400 });
    }

    const { items, date } = body as { items: InItem[]; date?: string };

    const sanitizeCents = (v: unknown) => {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : NaN;
  }
  return NaN;
};

const sanitizeQty = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

const line_items = items.map((i) => {
  const name = (i.variantTitle ? `${i.title} — ${i.variantTitle}` : i.title).slice(0, 500);
  const amount = sanitizeCents(i.unitAmountCents);
  const qty = sanitizeQty(i.quantity);

  if (!name || !Number.isFinite(amount) || amount <= 0 || qty <= 0) {
    throw new Error("BAD_ITEM_SHAPE");
  }

  return {
    price_data: {
      currency: "eur",
      product_data: { name },
      unit_amount: amount,
    },
    quantity: qty,
  };
});


    console.log("🧾 line_items:", line_items);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  console.error("❌ NEXT_PUBLIC_BASE_URL missing");
  return NextResponse.json({ error: "MISSING_BASE_URL" }, { status: 500 });
}


    const compact = (arr: any[]) =>
  arr.map((li) => ({
    n: li.price_data?.product_data?.name ?? "Item",
    q: li.quantity ?? 1,
    a: li.price_data?.unit_amount ?? 0,
    c: "eur",
  }));

const session = await stripe.checkout.sessions.create({
  mode: "payment",
  // Let Stripe infer methods; keeps you future-proof. Comment-in if you want to force cards only.
  // payment_method_types: ["card"],

  line_items,

  // Stripe will always collect an email in Checkout. You can force address/phone if you want:
  billing_address_collection: "auto",
  phone_number_collection: { enabled: false },

  // Nice-to-haves you can toggle later:
  allow_promotion_codes: false,
  submit_type: "pay",

  // Your redirects
  success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/cancel`,

  // Put ONLY minimal, non-PII metadata (webhook will read this)
  metadata: {
    date: date || "",
    items: JSON.stringify(compact(line_items)).slice(0, 4500), // stay under 5k metadata limit
    src: "web",
  },
});


    console.log("✅ Created checkout session:", session.id);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("💥 CREATE_SESSION_FAILED:", err?.message || err);
    return NextResponse.json(
      { error: "CREATE_SESSION_FAILED", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
