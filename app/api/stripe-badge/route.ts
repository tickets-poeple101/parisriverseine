// app/api/stripe-badge/route.ts
import type { NextRequest } from "next/server";

const BADGE_URL =
  "https://images.stripeassets.com/fzn2n1nzq965/4M6d6BSWzlgsrJx8rdZb0I/733f37ef69b5ca1d3d33e127184f4ce4/Powered_by_Stripe.svg?q=80&w=600";

export async function GET(_req: NextRequest) {
  const res = await fetch(BADGE_URL, {
    // Avoid passing referrer/credentials that some blockers nuke
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    return new Response("Badge unavailable", { status: 502 });
  }

  const body = await res.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
