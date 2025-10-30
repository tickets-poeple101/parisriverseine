// app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = getStripe();

export async function POST(req: Request) {
  const hdrs = headers();
  const sig = hdrs.get("stripe-signature");
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !whsec) {
    console.error("Missing Stripe signature or secret.");
    return NextResponse.json(
      { error: "Missing signature/secret" },
      { status: 400 }
    );
  }

  // Must use raw body for signature verification
  const rawBody = Buffer.from(await req.arrayBuffer());

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown signature error";
    console.error("Stripe signature verification failed:", message);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    try {
      const session = event.data.object as Stripe.Checkout.Session;

      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      });

      const lineItems =
        full.line_items?.data.map((li: Stripe.LineItem) => {
          const price = li.price;
          const product =
            typeof price?.product === "string"
              ? undefined
              : (price?.product as Stripe.Product | undefined);

          return {
            quantity: li.quantity ?? 1,
            priceId: price?.id ?? null,
            productId:
              typeof price?.product === "string"
                ? price?.product
                : product?.id ?? null,
            productName: product?.name ?? null,
            sku:
              price?.metadata?.sku ||
              product?.metadata?.sku ||
              price?.nickname ||
              (price?.id ?? null),
            unitAmount: price?.unit_amount ?? null,
            currency: price?.currency ?? null,
          };
        }) ?? [];

      const payload = {
        sessionId: full.id,
        paymentStatus: full.payment_status,
        amountTotal: full.amount_total,
        currency: full.currency,
        customerDetails: full.customer_details,
        metadata: full.metadata,
        customerEmail:
          full.customer_details?.email ?? full.customer_email ?? null,
        selectedDate: full.metadata?.date ?? null,
        lineItems,
        created: full.created,
        mode: full.mode,
        livemode: full.livemode,
      };

      // Forward to n8n
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-shared-secret": process.env.N8N_SHARED_SECRET!,
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
      console.error("Webhook processing error:", e?.message || e);
      // Return 200 to Stripe so it doesn’t keep retrying
    }
  } else {
    console.log("Unhandled Stripe event type:", event.type);
  }

  // Always return 200 so Stripe stops retrying
  return new NextResponse("ok", { status: 200 });
}
