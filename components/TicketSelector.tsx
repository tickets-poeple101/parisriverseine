"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from 'next/image';


/** Types */
export type Variant = {
  label: string; // e.g., "Adult" | "Child"
  priceCents: number; // price per unit in cents
  sku: string;
  compareAtCents?: number;
};

export type SelectorProduct = {
  id: string;
  title: string;
  description?: string;
  images: string[];
  variants: Variant[];

  /** NEW — optional fields to show specific info in the left pane */
  features?: string[];
  durationMinutes?: number;
  startPoint?: string;
  audioLanguages?: string[];
  seasonalDepartures?: string;

  /** Itinerary + map (no API keys needed) */
  startPointLatLng?: { lat: number; lng: number };
  itineraryStops?: Array<{
    title: string;
    time?: string;
    note?: string;
    lat?: number;
    lng?: number;
  }>;
};

export type TripAdvisorProps = {
  rating: number; // 4.8
  reviews: string; // "13,434"
  year: string; // "2024"
  thumbUrl?: string; // small square image
  badgeUrl?: string; // award SVG/PNG
};

export type TicketSelectorProps = {
  slug: string;
  variants: string[];
  products: SelectorProduct[]; // up to 3
  selectorTitle?: string;
  selectorSubtitle?: string;
  ticketsLeftCopy?: string; // e.g., "12 left at this price"
  ticketsSoldToday?: number; // e.g., 340
  addToCartText?: string; // empty/default label
  placeholderTitle?: string;
  placeholderSubtitle?: string;
  facts?: Array<{ icon: string; title: string; body: string; badge?: string }>; // emoji + copy
  tripadvisor?: TripAdvisorProps;
  /** called when user clicks the CTA and date + selection are valid */
  onCheckout?: (payload: {
    date: string;
    items: Array<{ sku: string; qty: number; unitPriceCents: number; title: string; vtitle: string }>; // send to /api/checkout later
    totalCents: number;
  }) => void;
};

export default function TicketSelector({
  products,
  selectorTitle = "Choose Your Experience",
  selectorSubtitle = "Select ticket type and quantity",
  ticketsLeftCopy = "12 left at this price",
  ticketsSoldToday = 340,
  addToCartText = "Book now",
  placeholderTitle = "Select a ticket to view details",
  placeholderSubtitle = "Choose from our available cruise experiences",
  facts = [
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
      title: "100% money‑back guarantee",
      body:
        "If anything comes up before your tour, ask for a full refund by email. We respond within 8 hours.",
    },
  ],
  tripadvisor,
  onCheckout,
}: TicketSelectorProps) {
  // --- State ---
  const [activeIdx, setActiveIdx] = useState<number | null>(null); // which product card is selected
  const [date, setDate] = useState<string>(""); // yyyy-mm-dd
  const [soldToday, setSoldToday] = useState<number>(ticketsSoldToday);

  // Map of variantKey -> qty; key = `${product.id}:${variant.label}`
  const [qty, setQty] = useState<Record<string, number>>({});

  // Select a product by ID and, on mobile, scroll the info pane into view
  function selectProductById(pId: string) {
    const idx = products.findIndex((p) => p.id === pId);
    if (idx !== -1) {
      setActiveIdx(idx);

      // Smooth-scroll the info pane into view on mobile so users see it update
      if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
        const pane = document.querySelector("[data-info-pane-root]");
        if (pane) {
          const y = (pane as HTMLElement).getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }
    }
  }

  useEffect(() => {
    const firstPickedIdx = products.findIndex((p) =>
      p.variants.some((v) => (qty[keyFor(p.id, v.label)] || 0) > 0)
    );
    if (firstPickedIdx !== -1 && firstPickedIdx !== activeIdx) {
      setActiveIdx(firstPickedIdx);
    }
  }, [qty, products, activeIdx]);


  // Derived picks
  const picks = useMemo(() => {
    const items: Array<{
      sku: string;
      qty: number;
      unitPriceCents: number;
      title: string;
      vtitle: string;
    }> = [];

    for (const p of products) {
      for (const v of p.variants) {
        const k = keyFor(p.id, v.label);
        const q = qty[k] || 0;
        if (q > 0) {
          items.push({
            sku: v.sku,
            qty: q,
            unitPriceCents: v.priceCents,
            title: p.title,
            vtitle: v.label,
          });
        }
      }
    }
    return items;
  }, [products, qty]);

  const totalCents = useMemo(
    () => picks.reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0),
    [picks]
  );

  const canCheckout = picks.length > 0 && !!date;

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setSoldToday((s) => s + 1);
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  function bump(pId: string, vLabel: string, delta: 1 | -1) {
    const k = keyFor(pId, vLabel);
    setQty((prev) => {
      const next = { ...prev };
      next[k] = Math.max(0, (next[k] || 0) + delta);
      return next;
    });

    // NEW: ensure the left pane shows this product
    selectProductById(pId);
  }


  function setQtyDirect(pId: string, vLabel: string, nextVal: number) {
    const k = keyFor(pId, vLabel);
    setQty((prev) => ({ ...prev, [k]: Math.max(0, Math.min(10, nextVal || 0)) }));

    // NEW: ensure the left pane shows this product
    selectProductById(pId);
  }


  function handleCheckout() {
    if (!canCheckout) return;
    onCheckout?.({ date, items: picks, totalCents });
  }

  const activeProduct = activeIdx == null ? null : products[activeIdx];

  return (
    <section className="[--ink:#0b1220] [--muted:#6b7280] [--line:#e6eaf1] [--accent:#1f6fff] [--good:#0a8d52]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_.95fr] lg:gap-8 max-w-[1140px] mx-auto">
        {/* LEFT — Info + slider */}
        <div
          className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6"
          data-info-pane-root
        >

          {activeProduct ? (
            <InfoPane key={activeProduct.id} p={activeProduct} />
          ) : (
            <EmptyInfoPane tripadvisor={tripadvisor} title={placeholderTitle} subtitle={placeholderSubtitle} facts={facts} />
          )}
        </div>

        {/* RIGHT — Selector/Cart */}
        <aside className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6">
          <header className="mb-3">
            <h3 className="text-[22px] font-black tracking-tight text-[var(--ink)]">{selectorTitle}</h3>
            <p className="text-[13px] text-[var(--muted)]">{selectorSubtitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {ticketsLeftCopy}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-slate-50 px-3 py-1 font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <strong>{soldToday}</strong> purchased today
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full w-[44%] bg-gradient-to-r from-emerald-500 to-emerald-600" />
            </div>
          </header>

          <div className="grid gap-3">
            {products.map((p, idx) => (
              <article
                key={p.id}
                role="button"
                tabIndex={0}
                aria-expanded={activeIdx === idx}
                className={`relative rounded-xl border bg-white p-4 transition hover:shadow-sm hover:ring-1 hover:ring-indigo-100 cursor-pointer group ${activeIdx === idx ? "border-indigo-300 bg-[#fbfdff]" : "border-[var(--line)]"
                  }`}
                onClick={(e) => {
                  const el = e.target as HTMLElement;
                  if (el.closest(".qty-row")) return;
                  setActiveIdx(idx);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveIdx(idx);
                  }
                }}
              >
                {/* optional corner ribbon */}
                {/eiffel/i.test(p.title) && (
                  <span className="pointer-events-none absolute -right-[1px] -bottom-[1px] z-10 inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-[12px] font-black text-slate-700 shadow-sm">
                    ★ Most popular
                  </span>
                )}

                <h4 className="mb-2 text-[16px] font-extrabold text-[var(--ink)]">{p.title}</h4>
                {activeIdx !== idx && (
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-600">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-[2px] text-[11px] font-bold text-indigo-700">
                      Select tickets
                    </span>
                    <span className="opacity-80">
                      <span className="inline md:hidden">Tap</span>
                      <span className="hidden md:inline">Click</span>
                      {" "}to view options
                    </span>
                    <span className="ml-auto text-[18px] text-slate-400 transition-transform group-hover:translate-x-0.5">›</span>
                  </div>
                )}

                <div
                  className={`overflow-hidden transition-all duration-300 ease-out
    ${activeIdx === idx
                      ? "max-h-[700px] opacity-100 translate-y-0 mt-2"
                      : "max-h-0 opacity-0 -translate-y-1"
                    }`}
                  aria-hidden={activeIdx === idx ? "false" : "true"}
                >
                  <div className="grid gap-2">
                    {p.variants.map((v) => {
                      const k = keyFor(p.id, v.label);
                      const q = qty[k] || 0;
                      return (
                        <div
                          key={k}
                          className={`var-row rounded-lg grid grid-cols-[1fr_auto_auto] items-center gap-2 border p-3 ${q > 0 ? "border-indigo-200 bg-[#f7fbff]" : "border-[var(--line)] bg-white"
                            }`}
                        >
                          <div className="flex flex-col">
                            <div className="text-[13px] font-extrabold text-slate-700">{v.label}</div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[14px] font-black text-emerald-600">{money(v.priceCents)}</span>
                              {v.compareAtCents && v.compareAtCents > v.priceCents && (
                                <>
                                  <span className="text-[12px] text-slate-400 line-through">
                                    {money(v.compareAtCents)}
                                  </span>
                                  <span className="ml-1 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-[2px] text-[11px] font-black text-amber-700">
                                    Save {savedPercent(v.priceCents, v.compareAtCents)}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-[12px] text-slate-500">Qty</div>
                          <div className="qty-row flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="Decrease"
                              onClick={() => bump(p.id, v.label, -1)}
                              className="h-8 w-8 rounded-md border bg-slate-50 font-black text-slate-700 hover:bg-indigo-50"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={q}
                              onChange={(e) => setQtyDirect(p.id, v.label, Number(e.target.value))}
                              className="h-8 w-14 rounded-md border text-center font-extrabold"
                            />
                            <button
                              type="button"
                              aria-label="Increase"
                              onClick={() => bump(p.id, v.label, 1)}
                              className="h-8 w-8 rounded-md border bg-slate-50 font-black text-slate-700 hover:bg-indigo-50"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>


              </article>
            ))}
          </div>

          {/* Date selector (required) */}
          <div className={`mt-4 rounded-xl border p-3 ${picks.length > 0 && !date ? "border-indigo-200 bg-[#f7fbff]" : "bg-slate-50"}`}>
            <label htmlFor="date" className="block text-[13px] font-black text-[var(--ink)]">
              Select your date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border px-3 font-bold focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              min={todayISO()}
              required
            />
            {!date && (
              <div className="mt-1 text-[12px] text-slate-500">Choose the day you plan to take the cruise.</div>
            )}
          </div>

          {/* Totals + CTA */}
          <div className="mt-3 flex items-center justify-between text-[16px] font-extrabold">
            <span>Total</span>
            <span className="text-[20px] font-black text-emerald-600">{money(totalCents)}</span>
          </div>
          <button
            type="button"
            disabled={!canCheckout}
            onClick={handleCheckout}
            className={`mt-2 w-full rounded-xl px-4 py-3 text-[15px] font-black text-white shadow-sm ${canCheckout ? "bg-[var(--accent)] hover:brightness-105" : "bg-slate-300"
              }`}
          >
            {canCheckout ? `Book ${qtyCount(picks)} ticket${qtyCount(picks) > 1 ? "s" : ""} now` : addToCartText}
          </button>

          {/* Mini-cart */}
          <div className="mt-3 rounded-xl border border-[var(--line)] bg-[#fafbff] p-3 shadow-sm">
            <div className="mb-2 text-[14px] font-black text-[var(--ink)]">Your selection</div>
            {picks.length === 0 ? (
              <div className="text-[13px] text-slate-500">No items selected yet</div>
            ) : (
              <div className="grid gap-2">
                {picks.map((it) => (
                  <div key={`${it.sku}`} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-lg border bg-white p-2">
                    <div className="flex flex-col">
                      <div className="text-[13px] font-black text-[var(--ink)]">{it.title}</div>
                      <div className="text-[12px] text-slate-600">{it.vtitle} · Qty {it.qty}</div>
                    </div>
                    <div className="text-[13px] font-black text-emerald-600">{money(it.unitPriceCents * it.qty)}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[12px] text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold">{money(totalCents)}</span>
            </div>
          </div>

          <ul className="mt-4 space-y-4">
            {/* Free cancellation */}
            <li className="grid grid-cols-[28px_1fr] items-start gap-3">
              <CheckCircleIcon className="h-7 w-7 text-green-700" />
              <div>
                <div className="font-semibold text-slate-900">Free cancellation</div>
                <p className="text-[16px] leading-7 text-slate-500">
                  Cancel up to <span className="whitespace-nowrap">24 hours</span> in advance for a full refund.
                </p>
              </div>
            </li>

            {/* Reserve now & pay later */}
            <li className="grid grid-cols-[28px_1fr] items-start gap-3">
              <CheckCircleIcon className="h-7 w-7 text-green-700" />
              <div>
                <div className="font-semibold text-slate-900">Instant Confirmation</div>
                <p className="text-[16px] leading-7 text-slate-500">
                  Secure your experience & Save money at the same time{" "}
                </p>
              </div>
            </li>
          </ul>

          {/* Sticky mobile bar */}

          <div className="lg:hidden">
            {qtyCount(picks) > 0 && (
              <div className="sticky bottom-2 z-10 mt-3 flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-white shadow-2xl">
                <div>
                  <strong>{qtyCount(picks)}</strong> selected
                </div>
                <button
                  type="button"
                  disabled={!canCheckout}
                  onClick={handleCheckout}
                  className={`rounded-lg px-3 py-2 text-sm font-black ${canCheckout ? "bg-[var(--accent)]" : "bg-slate-600"
                    }`}
                >
                  {canCheckout ? `Pay ${money(totalCents)}` : "Select a date"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* --- Itinerary under the selector --- */}
      <div className="mt-8 max-w-[1140px] mx-auto">
        <Itinerary p={activeProduct} date={date} />
      </div>
    </section>

  );
}
function EmptyInfoPane({
  tripadvisor,
  title,
  subtitle,
  facts,
}: {
  tripadvisor?: TripAdvisorProps;
  title: string;
  subtitle: string;
  facts: NonNullable<TicketSelectorProps["facts"]>;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* TripAdvisor card */}
      {tripadvisor && (
        <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden rounded-2xl bg-emerald-400 p-4 text-emerald-950 shadow-sm">
          {/* angled wedge accent (hide on mobile to keep it clean) */}
          <div className="absolute -left-16 top-0 bottom-0 w-44 -skew-x-12 bg-emerald-500 hidden md:block" />

          {/* optional small thumbnail */}
          {tripadvisor.thumbUrl ? (
            <div className="relative z-[1] h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-2xl shadow-md mx-auto md:mx-0">
              <Image
                src={tripadvisor.thumbUrl}
                alt="Cruise thumb"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : null}

          {/* MAIN TEXT (centered on mobile, left on desktop) */}
          <div className="relative z-[1] text-center md:text-left">
            <div className="text-4xl font-black leading-none">
              {tripadvisor.rating}
              <small className="ml-1 align-top text-base font-black">/5</small>
            </div>
            <div className="mt-1 text-lg" aria-hidden="true">★ ★ ★ ★ ★</div>
            <div className="text-[12px] font-extrabold uppercase tracking-wide opacity-90">
              BASED ON {tripadvisor.reviews} REVIEWS
            </div>
          </div>

          {/* Right badge (drops below on mobile, centered) */}
          <div className="relative z-[1] w-32 md:w-40 text-center opacity-95 mx-auto md:mx-0">
            {tripadvisor.badgeUrl ? (
              <Image
                src={tripadvisor.badgeUrl}
                alt={`Tripadvisor Travelers' Choice ${tripadvisor.year}`}
                width={160}
                height={48}
                className="mx-auto h-auto w-full"
              />
            ) : (
              <div className="text-sm font-black">
                TRAVELERS’ CHOICE {tripadvisor.year}
              </div>
            )}
          </div>

          {/* WATERMARK — slightly smaller + nudged further right */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-[-4px] md:right-[-2px] flex items-center z-0 translate-x-1 md:translate-x-2"
          >
            <TripadvisorMark
              className="w-[160px] h-[60px] md:w-[290px] md:h-[106px] opacity-[0.12] md:opacity-[0.15] mix-blend-multiply"
              style={{ color: "#064e3b" }}
            />
          </div>
        </div>
      )}




      <div>
        <h3 className="mb-2 text-[28px] font-black tracking-tight text-[var(--ink)]">
          {title}
        </h3>
        <p className="text-[15px] leading-relaxed text-slate-700">{subtitle}</p>
      </div>

      <ul className="grid gap-3">
        {facts.map((f, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-base">
              {f.icon}
            </span>
            <div>
              <div className="font-extrabold text-slate-900">{f.title}</div>
              <div className="text-[14px] leading-relaxed text-slate-600">{f.body}</div>
              {f.badge && (
                <span className="mt-1 inline-block rounded-md bg-slate-200 px-2 py-1 text-[12px] font-extrabold text-slate-900">
                  {f.badge}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TripadvisorMark({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 240 100"
      className={className}
      style={style}
      focusable="false"
      role="img"
      aria-label="Tripadvisor"
    >
      {/* Outer rings */}
      <circle cx="80" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="8" />
      <circle cx="160" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="8" />
      {/* Inner pupils */}
      <circle cx="80" cy="50" r="10" fill="currentColor" />
      <circle cx="160" cy="50" r="10" fill="currentColor" />
      {/* Beak */}
      <path d="M120 34 L108 70 L132 70 Z" fill="currentColor" />
    </svg>
  );
}

function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth={2.6} />
      <path d="M8 12.6l2.8 2.8L16.2 10" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function InfoCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="M12 10v6m0-8h.01" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}



function InfoPane({ p }: { p: SelectorProduct }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);     // lightbox open?
  const [lbIdx, setLbIdx] = useState(0);       // lightbox index

  const img = normLocal(p.images[idx] || p.images[0]);

  // keyboard nav for lightbox
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") setLbIdx((n) => (n + 1) % p.images.length);
      if (e.key === "ArrowLeft") setLbIdx((n) => (n - 1 + p.images.length) % p.images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, p.images.length]);

  function handleImageClick() {
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      // mobile: just go to next image
      setIdx((n) => (n + 1) % p.images.length);
    } else {
      // desktop: open lightbox
      setLbIdx(idx);
      setOpen(true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[22px] md:text-[28px] font-black tracking-tight text-[var(--ink)]">
        {p.title}
      </h2>

      {/* Image area */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-black shadow-sm">
        {img ? (
          <button
            type="button"
            onClick={handleImageClick}
            className="group relative block h-[240px] md:h-[280px] w-full cursor-zoom-in"
            aria-label="Open gallery"
          >
            <Image
              src={img}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
              priority={false}
            />
            {/* desktop hint */}
            <span className="pointer-events-none absolute bottom-2 right-2 hidden rounded-md bg-black/50 px-2 py-1 text-[12px] font-semibold text-white opacity-0 transition group-hover:opacity-100 md:inline">
              Click to enlarge
            </span>
          </button>
        ) : (
          <div className="h-[280px] w-full bg-slate-300" />
        )}

        {/* Prev/Next for the inline slider */}
        {p.images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2">
            <button
              onClick={() => setIdx((n) => (n - 1 + p.images.length) % p.images.length)}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={() => setIdx((n) => (n + 1) % p.images.length)}
              className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* (Optional) small bullets; keep or remove to keep left pane minimal */}
      <ul className="grid gap-2">
        <li className="flex items-center gap-2 text-[14px] text-slate-700 before:inline-block before:h-2 before:w-2 before:rounded before:border before:border-emerald-600 before:bg-emerald-50">
          Flexible schedule — go any time on the selected date
        </li>
        <li className="flex items-center gap-2 text-[14px] text-slate-700 before:inline-block before:h-2 before:w-2 before:rounded before:border before:border-emerald-600 before:bg-emerald-50">
          Mobile e-tickets accepted
        </li>
      </ul>

      {/* ---- Lightbox (desktop only) ---- */}
      {open && (
        <div
          className="fixed inset-0 z-[100] hidden items-center justify-center bg-black/80 p-4 md:flex"
          role="dialog"
          aria-modal="true"
          aria-label={`${p.title} – Gallery`}
          onClick={() => setOpen(false)}
        >
          {/* container prevents image from closing when clicked */}
          <div
            className="relative max-h-[90vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
              <Image
                src={p.images[lbIdx]}
                alt={`${p.title} photo ${lbIdx + 1}`}
                fill
                sizes="80vw"
                className="object-contain"
                priority
              />
            </div>

            {/* controls */}
            {p.images.length > 1 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                <button
                  type="button"
                  className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  aria-label="Previous"
                  onClick={() => setLbIdx((n) => (n - 1 + p.images.length) % p.images.length)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
                  aria-label="Next"
                  onClick={() => setLbIdx((n) => (n + 1) % p.images.length)}
                >
                  ›
                </button>
              </div>
            )}

            {/* close */}
            <button
              type="button"
              className="absolute right-2 top-2 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Itinerary({ p, date }: { p: SelectorProduct | null; date: string }) {

  const boxRef = useRef<HTMLDivElement>(null);
  const [progressOn, setProgressOn] = useState(false);

  // When the box comes into view (and when product changes), animate the progress bar
  useEffect(() => {
    setProgressOn(false);
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => setProgressOn(true));
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [p?.id]);


  // If nothing selected, show a gentle nudge.
  if (!p) {
    return (
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <div className="text-[15px] text-slate-700">
          Select a ticket above to see the departure map and itinerary.
        </div>
      </div>
    );
  }

  const hasMap = !!p.startPointLatLng;
  const mapUrl = hasMap
    ? buildOsmEmbed(p.startPointLatLng!.lat, p.startPointLatLng!.lng)
    : null;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-5">
      <header className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[20px] md:text-[22px] font-black text-[var(--ink)]">
            Destinations
          </h3>
          <span className="rounded-full border border-[var(--line)] bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Based on your selected tickets
          </span>
        </div>
        <p className="mt-1 text-[13px] text-slate-600">
          {date ? <>Planned for <strong>{date}</strong>.</> : <>Choose a date above to finalize your plan.</>}
        </p>
      </header>

      {/* Map + Stops (side-by-side on desktop) */}
      <div className="grid gap-4 md:grid-cols-[1.25fr_1fr]">

        {/* Map card — simpler, minimal chrome */}
        <div className="rounded-xl border border-[var(--line)] overflow-hidden bg-white">
          <div className="w-full aspect-[4/3] md:aspect-[16/9]">
            {hasMap ? (
              <iframe
                title={`${p.title} — departure location`}
                aria-label="Interactive map"
                src={mapUrl!}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            ) : (
              <div className="p-4 text-[14px] text-slate-600">
                Add <code>startPointLatLng</code> to this product to show the map.
              </div>
            )}
          </div>

          {hasMap && (
            <>
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-t border-[var(--line)] bg-white/70 px-4 py-3 text-[12px]">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800">Departure:</span>{" "}
                  {p.startPoint || "See marker"}
                </div>
                <a
                  href={openStreetMapLink(p.startPointLatLng!.lat, p.startPointLatLng!.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
                >
                  Open in OSM
                </a>
              </div>

              {/* Info note lives INSIDE the map card so the grid stays 2-up */}
              <div className="px-4 pb-4 pt-3 flex items-start gap-2 text-slate-500">
                <InfoCircleIcon className="h-5 w-5 text-slate-400" />
                <p className="text-[13px] leading-5">
                  For reference only. Itineraries are subject to change.
                </p>
              </div>
            </>
          )}

        </div>

        {/* Stops with a single animated connector between pins */}
        <div ref={boxRef} className="rounded-xl border border-[var(--line)] bg-white p-4 md:p-5">
          <div className="mb-2 text-[14px] font-black text-[var(--ink)]">Stops</div>

          {p.itineraryStops?.length ? (
            <div className="relative pl-8">
              {/* Static track */}
              <div className="relative">
                {/* Static track */}
                <div className="absolute left-4 top-2 bottom-2 w-[3px] bg-slate-300" aria-hidden="true" />

                {/* Animated fill (runs when this card is in view) */}
                <div
                  className="absolute left-4 top-2 w-[3px] bg-emerald-500 transition-[height] duration-[5000ms] ease-out"
                  style={{ height: progressOn ? "calc(100% - 1rem)" : "0%" }}
                  aria-hidden="true"
                />


                <ol className="space-y-3">
                  {p.itineraryStops.map((s, i) => (
                    <li
                      key={i}
                      className={`grid grid-cols-[32px_1fr] items-start gap-3 transition-all duration-700 ${progressOn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                        }`}
                      style={{ transitionDelay: `${i * 120}ms` }}
                    >
                      {/* Pin sits in the narrow left column */}
                      <span className="relative z-10 mt-[2px] justify-self-center grid h-8 w-8 place-items-center rounded-full bg-white ring-2 ring-slate-300">
                        <PinIcon className="h-5 w-5 text-emerald-600" />
                      </span>


                      {/* Text sits in the right column */}
                      <div>
                        <div className="text-[14px] font-semibold text-slate-900">{s.title}</div>
                        <div className="text-[12px] text-slate-600">
                          {s.time ? <span className="mr-2">{s.time}</span> : null}
                          {s.note}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          ) : (
            <div className="text-[13px] text-slate-600">No detailed stops provided for this experience.</div>
          )}
        </div>
      </div>


    </section>
  );
}


/*** Helpers ***/
function keyFor(pid: string, v: string) {
  return `${pid}:${v}`;
}

function qtyCount(items: { qty: number }[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

function money(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((cents || 0) / 100);
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function savedPercent(nowCents: number, compareAtCents?: number) {
  if (!compareAtCents || compareAtCents <= nowCents) return null;
  return Math.round(((compareAtCents - nowCents) / compareAtCents) * 100);
}

function normLocal(src?: string): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("http")) return src;           // allow remote URLs
  return src.startsWith("/") ? src : `/${src}`;     // force leading slash for /public
}


function buildOsmEmbed(lat: number, lng: number, zoom = 19) {
  const d = 0.0012; // tighter bbox (~130–150m)
  const left = (lng - d).toFixed(6);
  const right = (lng + d).toFixed(6);
  const top = (lat + d).toFixed(6);
  const bottom = (lat - d).toFixed(6);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik&marker=${lat},${lng}`;
}

function openStreetMapLink(lat: number, lng: number, zoom = 19) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
}



