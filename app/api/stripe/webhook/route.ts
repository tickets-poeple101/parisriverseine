// app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Use a REAL Stripe API version. Latest stable as of 2023-10-16 is safe.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: Request) {
  const hdrs = headers();
  const sig = hdrs.get("stripe-signature");
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whsec) {
    console.error("❌ Missing Stripe signature or secret.");
    return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });
  }

  // Raw body required for signature verification
  const rawBody = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown signature error";
    console.error("❌ Stripe signature verification failed:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;

      // 1) Retrieve session (for metadata, customer, etc.)
      const full = await stripe.checkout.sessions.retrieve(session.id);

      // 2) Fetch ALL line items (not capped at 10) with expanded price.product
      const lineItemsResp = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
        expand: ["data.price.product"],
      });
      const stripeLineItems = lineItemsResp.data;

      // 3) Pull selected date and original items payload from metadata
      const selectedDate = full.metadata?.date ?? null;

      let itemsFromMeta: Array<{ sku: string; quantity: number; date?: string }> = [];
      try {
        itemsFromMeta = full.metadata?.items_json ? JSON.parse(full.metadata.items_json) : [];
      } catch {
        // bad JSON? fine; we fallback to selectedDate
      }

      // 4) Build the forward payload with per-item date + SKU
      const lineItems = stripeLineItems.map((li, idx) => {
        const price = li.price;
        const product =
          typeof price?.product === "string" ? undefined : (price?.product as Stripe.Product | undefined);

        // Prefer per-item date if present in items_json; otherwise fallback to session-level date
        const dateForThisItem =
          (Array.isArray(itemsFromMeta) && itemsFromMeta[idx]?.date) || selectedDate || null;

        // Prefer the original app SKU from items_json; fallback to any price/product metadata if available
        const originalSku = Array.isArray(itemsFromMeta) ? itemsFromMeta[idx]?.sku ?? null : null;

        return {
          quantity: li.quantity ?? 1,
          priceId: price?.id ?? null,
          productId: typeof price?.product === "string" ? price?.product : product?.id ?? null,
          productName: product?.name ?? null,
          sku: originalSku ?? price?.metadata?.sku ?? product?.metadata?.sku ?? price?.nickname ?? price?.id ?? null,
          unitAmount: price?.unit_amount ?? null,
          currency: price?.currency ?? null,
          date: dateForThisItem, // ← critical: per-line-item date
        };
      });

      const payload = {
        sessionId: full.id,
        paymentStatus: full.payment_status,
        amountTotal: full.amount_total,
        currency: full.currency,
        customerDetails: full.customer_details,
        customerEmail: full.customer_details?.email ?? full.customer_email ?? null,
        metadata: full.metadata, // still include raw metadata for reference
        selectedDate,            // convenience copy
        lineItems,               // ← each item now has .date and .sku
        created: full.created,
        mode: full.mode,
        livemode: full.livemode,
      };

      // 5) Forward to n8n (use Authorization: Bearer consistently)
      const n8nUrl = process.env.N8N_WEBHOOK_URL!;
      const n8nSecret = process.env.N8N_SHARED_SECRET!;
      const n8nResponse = await fetch(n8nUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${n8nSecret}`,
        },
        body: JSON.stringify(payload),
      });

      if (!n8nResponse.ok) {
        const msg = await n8nResponse.text().catch(() => "n8n failed");
        console.error("❌ n8n forward failed:", n8nResponse.status, msg);
      } else {
        console.log("✅ n8n forward successful:", n8nResponse.status);
      }
    } catch (e: any) {
      console.error("⚠️ Webhook processing error:", e?.message || e);
      // Always return 200 so Stripe doesn’t retry indefinitely
    }
  } else {
    console.log("ℹ️ Unhandled Stripe event type:", event.type);
  }

  // Always return 200 so Stripe stops retrying
  return new NextResponse("ok", { status: 200 });
}
