"use client";

import TicketSelector, { SelectorProduct } from "@/components/TicketSelector";
import { ReviewsMarquee, Review } from "@/components/ReviewsMarquee";
import { CredibilityGallery, CredItem } from "@/components/CredibilityGallery";
import data from "@/data/products.json";

const products = data as unknown as SelectorProduct[];

const reviews: Review[] = [
  { name: "Sophie Laurent", location: "London, UK", text: "Sunset cruise was magical. Eiffel Tower lighting from the river = wow.", rating: 5, date: "2 weeks ago", bookingDate: "Mar 2024", imageUrl: "/images/avatar1.jpg" },
  { name: "James Mitchell", location: "NY, USA", text: "Anniversary dinner cruise. Great food, amazing views, smooth booking.", rating: 5, date: "1 month ago" },
  { name: "Maria Rodriguez", location: "Barcelona", text: "Commentary was actually useful. Learned a lot. Easy mobile tickets.", rating: 5, date: "3 weeks ago" },
  { name: "David Chen", location: "Toronto", text: "Comfortable boat, spectacular views. Great value.", rating: 5, date: "3 weeks ago" }
];

const partners: CredItem[] = [
  { src: "/images/partner-ta.png", caption: "Tripadvisor Travelers’ Choice", show: true },
  { src: "/images/partner-stripe.svg", caption: "Stripe Secure Payments", show: true },
  { src: "/images/partner-visa.svg", caption: "Visa", show: true },
  { src: "/images/partner-mastercard.svg", caption: "Mastercard", show: true },
  { src: "/images/partner-amex.svg", caption: "American Express", show: false },
  { src: "/images/partner-bus.png", caption: "Big Bus Official Partner", show: true }
];

export default function ProductPage() {
  return (
    <>
      {/* On-screen checkout */}
      <TicketSelector
        products={products}
        selectorTitle="Choose Your Experience"
        selectorSubtitle="Select ticket type and quantity"
        ticketsLeftCopy="12 left at this price"
        ticketsSoldToday={340}
        tripadvisor={{
          rating: 4.8,
          reviews: "13,434",
          year: "2024",
          thumbUrl: "/images/paris-thumb.jpg",
          badgeUrl: "/images/ta-badge.png",
        }}
       onCheckout={async ({ date, items, totalCents }) => {
  // 1) See exactly what TicketSelector is sending
  console.log("RAW items from TicketSelector ⬇️");
  console.table(items);

  // Helpers
  const toCents = (val: unknown) => {
    if (typeof val === "number" && Number.isFinite(val)) return Math.round(val);
    if (typeof val === "string") {
      const n = Number(val.replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(n)) return NaN;
      // if it looks like "17.99", convert to 1799
      return val.includes(".") ? Math.round(n * 100) : Math.round(n);
    }
    return NaN;
    };
  const toQty = (val: unknown) => {
    const n = Number(val ?? 0);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  };

  // 2) Map **permissively** across common field names
  const payload = {
    date,
    items: (items as any[]).map((i) => {
      const title = String(i.title ?? i.name ?? "Ticket");
      const variantTitle = String(i.vtitle ?? i.variantTitle ?? i.variant ?? i.option ?? "");
      const unitAmountCents = toCents(
        i.price ?? i.unitAmountCents ?? i.amount ?? i.unit_amount ?? i.unitPriceCents
      );
      const quantity = toQty(i.qty ?? i.quantity ?? i.qtySelected ?? i.count ?? i.units ?? 0);
      return { title, variantTitle, unitAmountCents, quantity };
    })
    .filter((i) => i.quantity > 0 && Number.isFinite(i.unitAmountCents) && i.unitAmountCents > 0),
  };

  // Debug: show what we’re sending
  console.log("➡️ Payload to /api/checkout", payload);

  if (!payload.items.length) {
    const rawCount = (items as any[]).reduce(
      (n, i) => n + (Number(i.qty ?? i.quantity ?? i.count ?? i.units ?? 0) || 0),
      0
    );
    alert(
      `No valid line items. Raw count seen: ${rawCount}. 
Make sure you actually clicked + on a ticket, then try again.`
    );
    return;
  }

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("Checkout init failed", await res.text());
    alert("Checkout init failed. Check console for details.");
    return;
  }

  const data = await res.json();
  if (data?.url) window.location.href = data.url;
  else alert("No checkout URL returned.");
}}



      />

      {/* Reviews marquee */}
      <div className="mt-12">
        <ReviewsMarquee reviews={reviews} speedSec={35} bgClass="bg-slate-50" />
      </div>

      {/* Credibility block */}
      <div className="mt-12">
        <CredibilityGallery
          title="Trusted. Secure. Official."
          subtitle="Official partners and bank-level security. We protect your data and payments end-to-end."
          items={partners}
          showIndicators
          showSecurity
          minWidth={200}
          aspect={1.5}
          grayscale={80}
        />
      </div>
    </>
  );
}
