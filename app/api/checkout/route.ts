// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import rawCatalog from "@/data/products.json" assert { type: "json" };

type Variant = {
  label: string;
  priceCents: number;
  sku: string;
};

type CatalogItem = {
  id: string;               // used as slug
  title: string;
  images: string[];
  variants: Variant[];
  description?: string;
};

const CATALOG = rawCatalog as CatalogItem[];

// ===== FILL THIS IN =====
// Map your SKUs to Stripe Price IDs (from Stripe Dashboard).
const PRICE_MAP: Record<string, string> = {
  // "SKU-ADULT": "price_123",
  // "SKU-CHILD": "price_456",
};

type CreateSessionItem =
  | { sku: string; quantity: number }
  | { variant: string; quantity: number };

type CreateSessionBody = {
  slug: string;
  items: CreateSessionItem[];
  successUrl?: string;
  cancelUrl?: string;
};

export const runtime = "nodejs";

function findProduct(slug: string): CatalogItem | undefined {
  return CATALOG.find((p) => p.id === slug);
}

function skuFromItem(product: CatalogItem, item: CreateSessionItem): string {
  if ("sku" in item) return item.sku;

  const v = product.variants.find(
    (vv) => vv.label.toLowerCase() === item.variant.toLowerCase()
  );
  if (!v) {
    throw new Error(
      `Unknown variant "${("variant" in item && item.variant) || "?"}" for slug "${product.id}"`
    );
  }
  return v.sku;
}

export async function POST(req: Request) {
  const parsed = (await req.json()) as unknown;

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("slug" in parsed) ||
    typeof (parsed as Record<string, unknown>).slug !== "string" ||
    !("items" in parsed) ||
    !Array.isArray((parsed as Record<string, unknown>).items)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { slug, items, successUrl, cancelUrl } = parsed as CreateSessionBody;

  if (!slug || items.length === 0) {
    return NextResponse.json({ error: "Missing slug or items" }, { status: 400 });
  }

  const product = findProduct(slug);
  if (!product) {
    return NextResponse.json({ error: "Unknown product slug" }, { status: 400 });
  }

  const line_items = items.map((it: CreateSessionItem) => {
  const sku = skuFromItem(product, it);
  const priceId = PRICE_MAP[sku];
  if (!priceId) {
    throw new Error(`No Stripe price mapped for SKU "${sku}". Add it to PRICE_MAP.`);
  }
  const qty = Math.max(1, Math.floor(it.quantity));
  return { price: priceId, quantity: qty };
});


  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const success_url = successUrl ?? `${baseUrl}/success`;
  const cancel_url = cancelUrl ?? `${baseUrl}/cancel`;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items,
      success_url,
      cancel_url,
      metadata: { slug },
    },
    {
      idempotencyKey: `checkout:${slug}:${JSON.stringify(line_items)}`,
    }
  );

  return NextResponse.json({ url: session.url }, { status: 200 });
}
