/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState, useId, useCallback } from 'react';

type SummaryScore = { label: string; value: number }; // 0–5
type Review = {
  id: string;
  name: string;
  country: string;
  initials: string;
  rating: number; // 0–5
  dateLabel: string; // preformatted to avoid hydration issues
  text: string;
};

type GalleryItem =
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster: string; alt: string };

function Stars({
  value,
  size = 24,
  colorClass = 'text-slate-800',
}: {
  value: number;
  size?: number;
  colorClass?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  const uid = useId();

  return (
    <div className={`flex items-center gap-3 ${colorClass}`} aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const diff = rounded - i;
        const commonSvgProps = {
          viewBox: '0 0 20 20',
          'aria-hidden': true as const,
          style: { width: size, height: size },
        };

        if (diff <= 0) {
          return (
            <svg key={i} {...commonSvgProps}>
              <path
                className="text-slate-200"
                fill="currentColor"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.176 0l-2.803 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.93 8.72c-.783-.57-.38-1.81.588-1.81H6.98a1 1 0 00.951-.69l1.118-3.293z"
              />
            </svg>
          );
        }

        if (diff >= 1) {
          return (
            <svg key={i} {...commonSvgProps}>
              <path
                fill="currentColor"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.176 0l-2.803 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.93 8.72c-.783-.57-.38-1.81.588-1.81H6.98a1 1 0 00.951-.69l1.118-3.293z"
              />
            </svg>
          );
        }

        const clipId = `${uid}-half-${i}`;
        return (
          <svg key={i} {...commonSvgProps}>
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width="10" height="20" />
              </clipPath>
            </defs>
            <path
              className="text-slate-200"
              fill="currentColor"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.176 0l-2.803 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.93 8.72c-.783-.57-.38-1.81.588-1.81H6.98a1 1 0 00.951-.69l1.118-3.293z"
            />
            <path
              fill="currentColor"
              clipPath={`url(#${clipId})`}
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.036a1 1 0 00-1.176 0l-2.803 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.93 8.72c-.783-.57-.38-1.81.588-1.81H6.98a1 1 0 00.951-.69l1.118-3.293z"
            />
          </svg>
        );
      })}
    </div>
  );
}

function Meter({ label, value }: SummaryScore) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-slate-700">{label}</div>
      <div className="relative h-2 flex-1 rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <div className="w-12 text-right text-slate-600 text-sm">{value.toFixed(1)}/5</div>
    </div>
  );
}

const AVATAR_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
] as const;
const colorFor = (seed: string) => AVATAR_COLORS[seed.charCodeAt(0) % AVATAR_COLORS.length];

export default function ReviewsSection() {
  const overall = 4.4;
  const reviewCount = 69978;
  const summary: SummaryScore[] = [
    { label: 'Guide', value: 4.2 },
    { label: 'Transportation', value: 4.5 },
    { label: 'Value for money', value: 4.9 },
  ];

  const gallery: GalleryItem[] = [
    { kind: 'video', src: '/reviews/hero.mp4', poster: '/reviews/hero.jpg', alt: 'Cruise highlight video' },
    { kind: 'image', src: '/reviews/1.jpg', alt: 'Seine view 1' },
    { kind: 'image', src: '/reviews/2.jpg', alt: 'Seine view 2' },
    { kind: 'image', src: '/reviews/3.jpg', alt: 'Seine view 3' },
    { kind: 'image', src: '/reviews/4.jpg', alt: 'Seine view 4' },
    { kind: 'image', src: '/reviews/7.jpg', alt: 'Seine view 5' },
    { kind: 'image', src: '/reviews/8.jpg', alt: 'Seine view 6' },
    { kind: 'image', src: '/reviews/10.jpg', alt: 'Seine view 7' },
  ];

  // LIGHTBOX
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const openAt = (i: number) => {
    setIdx(i);
    setOpen(true);
  };

  const next = useCallback(() => {
    setIdx((i) => (i + 1) % gallery.length);
  }, [gallery.length]);

  const prev = useCallback(() => {
    setIdx((i) => (i - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, next, prev]);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <section aria-labelledby="reviews-title" className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center gap-2">
        <h2 id="reviews-title" className="text-2xl font-semibold text-slate-900">Customer reviews</h2>
        <span className="text-slate-400" title="Reviews are from verified bookings.">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 112 10a8 8 0 0116 0zM9 7a1 1 0 112 0 1 1 0 01-2 0zm-1 7a1 1 0 100-2h1V9h2a1 1 0 100-2H9a1 1 0 00-1 1v4H7a1 1 0 100 2h1z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      {/* Collage — edge-to-edge, outer corners only */}
      <div className="isolate overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-inset ring-slate-300">
        <div className="grid grid-cols-4 md:grid-cols-5 md:grid-rows-2 md:auto-rows-[220px] gap-0">
          {/* BIG (video) on the left spans two rows on desktop */}
          <button
            type="button"
            onClick={() => openAt(0)}
            className="relative col-span-4 md:col-span-3 md:row-span-2 aspect-[16/9] md:aspect-auto md:h-full md:min-h-[220px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Play highlight video"
          >
            {gallery[0].kind === 'video' ? (
              <img
                src={gallery[0].poster}
                alt={gallery[0].alt}
                className="block h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <img
                src={gallery[0].src}
                alt={gallery[0].alt}
                className="block h-full w-full object-cover"
                loading="lazy"
              />
            )}
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 text-slate-900 shadow">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>

          {/* Right tiles fill remaining 2×2 cells */}
          {gallery.slice(1, 5).map((g, i) => {
            const keySrc = g.kind === 'image' ? g.src : g.poster;
            const imgSrc = g.kind === 'image' ? g.src : g.poster;
            return (
              <button
                key={keySrc}
                type="button"
                onClick={() => openAt(i + 1)}
                className="relative aspect-[16/9] md:aspect-auto md:h-full md:min-h-[220px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label={g.alt}
              >
                <img src={imgSrc} alt={g.alt} className="block h-full w-full object-cover" loading="lazy" />
                {i === 3 && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-base font-semibold text-white drop-shadow">
                    +More
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview + Reviews */}
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <div className="text-slate-700">Overall rating</div>
          <div className="mt-2 flex items-end gap-2">
            <div className="text-4xl font-semibold text-slate-900 leading-none">{overall.toFixed(1)}</div>
            <div className="pb-1 text-slate-500">/5</div>
          </div>
          <div className="mt-2">
            <Stars value={overall} size={32} colorClass="text-slate-900" />
            <div className="mt-1 text-sm text-slate-500">
              based on {new Intl.NumberFormat('en-US').format(reviewCount)} reviews on GetYourGuide
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {summary.map((s) => (
              <Meter key={s.label} label={s.label} value={s.value} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {[
            {
              id: 'r1',
              name: 'Jocelyn',
              country: 'Canada',
              initials: 'J',
              rating: 4.5,
              dateLabel: 'October 13, 2025 — Verified booking',
              text:
                'The Seine River cruise was a lovely way to see the city! Views were stunning and the guide’s info was perfect. Meeting point was easy to find. Note: there aren’t beverages for purchase on the boat. Still really enjoyed our experience!',
            },
            {
              id: 'r2',
              name: 'Laura',
              country: 'United Kingdom',
              initials: 'L',
              rating: 5,
              dateLabel: 'October 13, 2025 — Verified booking',
              text:
                'One-hour scenic cruise was delightful from start to finish. Gliding past landmarks gave a new appreciation of Paris. Commentary (multiple languages) was just the right amount.',
            },
            {
              id: 'r3',
              name: 'Samuel',
              country: 'United Kingdom',
              initials: 'S',
              rating: 5,
              dateLabel: 'October 12, 2025 — Verified booking',
              text:
                'Very knowledgeable guide. Impressed that she spoke three languages. Incredible views and smooth ride.',
            },
          ].map((r) => (
            <article key={r.id} className="rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${colorFor(
                      r.initials
                    )}`}
                    aria-hidden="true"
                  >
                    {r.initials}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">
                      {r.name} <span className="font-normal text-slate-600">— {r.country}</span>
                    </div>
                    <div className="text-xs text-slate-500">{r.dateLabel}</div>
                  </div>
                </div>
                <Stars value={r.rating} size={20} colorClass="text-slate-900" />
              </div>
              <p className="mt-3 text-slate-700">{r.text}</p>
            </article>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-3 md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* media */}
            <div className="relative max-h-full w-full max-w-5xl">
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-10 right-0 rounded-full bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              {/* arrows */}
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-900 shadow hover:bg-white"
                aria-label="Previous"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 text-slate-900 shadow hover:bg-white"
                aria-label="Next"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              <div className="mx-12">
                {gallery[idx].kind === 'image' ? (
                  <img
                    src={gallery[idx].src}
                    alt={gallery[idx].alt}
                    className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain"
                  />
                ) : (
                  <video
                    src={gallery[idx].src}
                    poster={gallery[idx].poster}
                    controls
                    autoPlay
                    muted
                    playsInline
                    preload="metadata"
                    className="mx-auto max-h-[80vh] w-auto rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-slate-500">© {year} Customer content used for illustration.</div>
    </section>
  );
}
