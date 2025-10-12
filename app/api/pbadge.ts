// app/api/pbadge/route.ts
export const runtime = "nodejs"; // force Node runtime (some CDNs fail on Edge)
export const dynamic = "force-dynamic";

const BADGE_URL =
  "https://images.stripeassets.com/fzn2n1nzq965/4M6d6BSWzlgsrJx8rdZb0I/733f37ef69b5ca1d3d33e127184f4ce4/Powered_by_Stripe.svg?q=80&w=600";

export async function GET() {
  try {
    const upstream = await fetch(BADGE_URL, {
      cache: "no-store",
      headers: {
        // avoid weird referrer/adblock shenanigans
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!upstream.ok) {
      return new Response("Badge unavailable", { status: 502 });
    }

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Badge unavailable", { status: 502 });
  }
}
