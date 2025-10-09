"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from 'next/image';


/** Types */
export type Variant = {
  label: string; // e.g., "Adult" | "Child"
  priceCents: number; // price per unit in cents
  sku: string;
};

export type SelectorProduct = {
  id: string; // slug/id (e.g., "parisiens-cruise")
  title: string;
  description?: string;
  images: string[]; // URLs (public/ or remote)
  variants: Variant[]; // usually [Adult, Child]
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

  // --- Handlers ---
  function bump(pId: string, vLabel: string, delta: 1 | -1) {
    const k = keyFor(pId, vLabel);
    setQty((prev) => {
      const next = { ...prev };
      next[k] = Math.max(0, (next[k] || 0) + delta);
      return next;
    });
  }

  function setQtyDirect(pId: string, vLabel: string, nextVal: number) {
    const k = keyFor(pId, vLabel);
    setQty((prev) => ({ ...prev, [k]: Math.max(0, Math.min(10, nextVal || 0)) }));
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
        <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm p-6">
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
                className={`relative rounded-xl border bg-white p-4 transition hover:shadow-sm ${
                  activeIdx === idx ? "border-indigo-300 bg-[#fbfdff]" : "border-[var(--line)]"
                }`}
                onClick={(e) => {
                  // ignore clicks coming from qty controls
                  const el = e.target as HTMLElement;
                  if (el.closest(".qty-row")) return;
                  setActiveIdx(idx);
                }}
              >
                {/* optional corner ribbon */}
                {/eiffel/i.test(p.title) && (
                  <span className="pointer-events-none absolute -right-[1px] -bottom-[1px] z-10 inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-[12px] font-black text-slate-700 shadow-sm">
                    ★ Most popular
                  </span>
                )}

                <h4 className="mb-2 text-[16px] font-extrabold text-[var(--ink)]">{p.title}</h4>

                {/* Variants (Adult/Child) */}
                <div className="grid gap-2">
                  {p.variants.map((v) => {
                    const k = keyFor(p.id, v.label);
                    const q = qty[k] || 0;
                    return (
                      <div
                        key={k}
                        className={`var-row rounded-lg grid grid-cols-[1fr_auto_auto] items-center gap-2 border p-3 ${
                          q > 0 ? "border-indigo-200 bg-[#f7fbff]" : "border-[var(--line)] bg-white"
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="text-[13px] font-extrabold text-slate-700">{v.label}</div>
                          <div className="text-[14px] font-black text-emerald-600">{money(v.priceCents)}</div>
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
            className={`mt-2 w-full rounded-xl px-4 py-3 text-[15px] font-black text-white shadow-sm ${
              canCheckout ? "bg-[var(--accent)] hover:brightness-105" : "bg-slate-300"
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
                  className={`rounded-lg px-3 py-2 text-sm font-black ${
                    canCheckout ? "bg-[var(--accent)]" : "bg-slate-600"
                  }`}
                >
                  {canCheckout ? `Pay ${money(totalCents)}` : "Select a date"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

/*** Subcomponents ***/
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
        <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden rounded-2xl bg-emerald-400 p-4 text-emerald-950 shadow-sm">
          <div className="absolute -left-16 top-0 bottom-0 w-44 -skew-x-12 bg-emerald-500" />
          {tripadvisor.thumbUrl && (
  <div className="relative z-[1] h-20 w-20 overflow-hidden rounded-2xl shadow-md">
    <Image
      src={tripadvisor.thumbUrl}
      alt="Cruise thumb"
      fill
      sizes="80px"
      className="object-cover"
    />
  </div>
)}

          <div className="relative z-[1]">
            <div className="text-4xl font-black leading-none">{tripadvisor.rating}<small className="ml-1 align-top text-base font-black">/5</small></div>
            <div className="mt-1 text-lg" aria-hidden="true">★ ★ ★ ★ ★</div>
            <div className="text-[12px] font-extrabold uppercase tracking-wide opacity-90">BASED ON {tripadvisor.reviews} REVIEWS</div>
          </div>
          <div className="relative z-[1] w-40 text-center opacity-95">
            {tripadvisor.badgeUrl ? (
  <Image
    src={tripadvisor.badgeUrl}
    alt={`Tripadvisor Travelers' Choice ${tripadvisor.year}`}
    width={160}
    height={48}
    className="mx-auto h-auto w-full"
  />
) : (
  <div className="text-sm font-black">TRAVELERS’ CHOICE {tripadvisor.year}</div>
)}

          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-[28px] font-black tracking-tight text-[var(--ink)]">{title}</h3>
        <p className="text-[15px] leading-relaxed text-slate-700">{subtitle}</p>
      </div>

      <ul className="grid gap-3">
        {facts.map((f, i) => (
          <li key={i} className="grid grid-cols-[auto_1fr] items-start gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-base">{f.icon}</span>
            <div>
              <div className="font-extrabold text-slate-900">{f.title}</div>
              <div className="text-[14px] leading-relaxed text-slate-600">{f.body}</div>
              {f.badge && (
                <span className="mt-1 inline-block rounded-md bg-slate-200 px-2 py-1 text-[12px] font-extrabold text-slate-900">{f.badge}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoPane({ p }: { p: SelectorProduct }) {
  const [idx, setIdx] = useState(0);
  const img = p.images[idx] || p.images[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Price row could be computed if you pass compareAt in props; keep simple here */}
      <h2 className="text-[28px] font-black tracking-tight text-[var(--ink)]">{p.title}</h2>

      {/* Simple slider */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-black shadow-sm">
        {img ? (
  <div className="relative h-[280px] w-full">
    <Image
      src={img}
      alt={p.title}
      fill
      sizes="(max-width: 768px) 100vw, 560px"
      className="object-cover"
      priority={false}
    />
  </div>
) : (
  <div className="h-[280px] w-full bg-slate-300" />
)}

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

      {p.description && (
        <div className="text-[15px] leading-relaxed text-slate-700" dangerouslySetInnerHTML={{ __html: p.description }} />
      )}

      {/* bullets */}
      <ul className="grid gap-2">
        <li className="flex items-center gap-2 text-[14px] text-slate-700 before:inline-block before:h-2 before:w-2 before:rounded before:border before:border-emerald-600 before:bg-emerald-50">
          Flexible schedule — go any time on the selected date
        </li>
        <li className="flex items-center gap-2 text-[14px] text-slate-700 before:inline-block before:h-2 before:w-2 before:rounded before:border before:border-emerald-600 before:bg-emerald-50">
          Mobile e‑tickets accepted
        </li>
      </ul>
    </div>
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
