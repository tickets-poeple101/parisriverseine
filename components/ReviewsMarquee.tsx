"use client";
import React, { useEffect, useMemo, useRef } from "react";

export type Review = {
  name: string;
  location?: string;
  text: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  date?: string; // "2 weeks ago"
  bookingDate?: string; // "March 2024"
  imageUrl?: string; // avatar
};

export function ReviewsMarquee({
  reviews,
  speedSec = 35,
  bgClass = "bg-slate-50",
  cardWidth = 340,
  cardGap = 24,
}: {
  reviews: Review[];
  speedSec?: number; // lower = faster
  bgClass?: string;
  cardWidth?: number; // px
  cardGap?: number; // px
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => reviews.filter(r => r.name && r.text), [reviews]);
  const doubled = useMemo(() => [...list, ...list], [list]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onEnter = () => (el.style.animationPlayState = "paused");
    const onLeave = () => (el.style.animationPlayState = "running");
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (list.length === 0) {
    return (
      <section className={`${bgClass} py-12`}>
        <div className="mx-auto max-w-6xl px-4 text-center text-slate-600">
          <div className="text-lg font-semibold">Customer Reviews Marquee</div>
          <div className="opacity-70">Add customer reviews to display social proof</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${bgClass} py-10 relative overflow-hidden`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[rgba(255,255,255,1)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[rgba(255,255,255,1)] to-transparent" />

      <div
        ref={wrapRef}
        className="flex items-center will-change-transform"
        style={{
          gap: `${cardGap}px`,
          width: "max-content",
          animation: `marquee ${speedSec}s linear infinite`,
        }}
      >
        {doubled.map((r, i) => (
          <article
            key={`${r.name}-${i}`}
            className="relative flex-shrink-0 rounded-xl border bg-white p-5 shadow-sm hover:shadow transition"
            style={{ width: `${cardWidth}px` }}
          >
            <header className="mb-3 flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-white bg-emerald-900 text-white grid place-items-center font-semibold">
                {r.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{r.name?.[0] || "?"}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-slate-900">{r.name}</div>
                {r.location && <div className="truncate text-[13px] text-slate-500">{r.location}</div>}
                {r.bookingDate && <div className="truncate text-[12px] text-slate-500">Booked {r.bookingDate}</div>}
              </div>
            </header>

            <div className="mb-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <svg
                  key={s}
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-amber-500"
                  fill={r.rating && s <= r.rating ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
                </svg>
              ))}
            </div>

            <p className="mb-3 text-[14px] italic leading-relaxed text-slate-700">“{r.text}”</p>

            <footer className="mt-auto flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border-emerald-200">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Verified booking
              </span>
              {r.date && <span className="text-[11px] text-slate-500">{r.date}</span>}
            </footer>
          </article>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
}
