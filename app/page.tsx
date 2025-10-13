
"use client";

import React from "react";
import TicketSelector, {
  SelectorProduct,
  TripAdvisorProps,
} from "@/components/TicketSelector";
import rawCatalog from "@/data/products.json";
import ReviewsSection from "@/components/ReviewsSection";



const CATALOG = rawCatalog as SelectorProduct[];

// TripAdvisor & facts content (mirrors your Liquid copy)
const tripadvisor: TripAdvisorProps = {
  rating: 4.8,
  reviews: "13,434",
  year: "2024",
  // thumbUrl: "/images/ta-thumb.jpg",
  // badgeUrl: "/images/ta-badge.png",
};

const facts = [
  {
    icon: "🕒",
    title: "Duration & Starts",
    body:
      "You don’t have to choose a departure time — book a day and go anytime between 10:00 and 22:00.",
    badge: "The cruise is 1 hour.",
  },
  {
    icon: "🎧",
    title: "Audio guide in 14 languages",
    body:
      "French, English, Hindi, Arabic, German, Italian, Spanish, Portuguese, Russian, Polish, Dutch, Chinese, Japanese, Korean.",
  },
  {
    icon: "📍",
    title: "Location",
    body: "Both cruises depart within 500m of the Eiffel Tower.",
  },
  { icon: "💳", title: "Free cancellation", body: "Cancel up to 24h in advance for a full refund." },
  {
    icon: "💲",
    title: "100% money-back guarantee",
    body:
      "If anything comes up before your tour, ask for a full refund by email. We respond within 8 hours.",
  },
];

export default function Home() {
  // Use up to 3 products on the homepage (keep all fields incl. itinerary/map)
  const products: SelectorProduct[] = CATALOG.slice(0, 3);

  // Called by TicketSelector when user presses “Book now”
  async function handleCheckout(payload: {
    date: string;
    items: Array<{ sku: string; qty: number; unitPriceCents: number; title: string; vtitle: string }>;
    totalCents: number;
  }) {
    const body = {
      items: payload.items.map((i) => ({ sku: i.sku, quantity: i.qty })),
      successUrl: `${location.origin}/success`,
      cancelUrl: `${location.origin}/cancel`,
    };

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "Checkout failed");
      alert(err);
      return;
    }

    const { url } = (await res.json()) as { url: string };
    window.location.href = url;
  }

  return (
    <main className="min-h-screen bg-white py-8">
      <section className="max-w-[1140px] mx-auto px-4">
        <TicketSelector
          slug="homepage"
          variants={[]}             // not used on homepage
          products={products}
          selectorTitle="Choose Your Experience"
          selectorSubtitle="Select ticket type, quantity, and date"
          addToCartText="Book now"
          tripadvisor={tripadvisor}
          facts={facts}
          onCheckout={handleCheckout}
        />
      </section>
      {/* Reviews */}
      <section className="max-w-[1140px] mx-auto px-4">
        <ReviewsSection />
      </section>

    </main>
  );
}
