"use client";
import React from "react";

export type CredItem = {
  src: string; // logo or photo
  caption?: string;
  show?: boolean; // toggle
};

export function CredibilityGallery({
  title = "Trusted by Industry Leaders",
  subtitle = "We partner with certified organizations and maintain the highest standards of security and professionalism.",
  items,
  showIndicators = true,
  showSecurity = true,
  minWidth = 200,
  aspect = 1.5, // 3:2
  grayscale = 80, // percent
}: {
  title?: string;
  subtitle?: string;
  items: CredItem[]; // up to 8
  showIndicators?: boolean;
  showSecurity?: boolean;
  minWidth?: number;
  aspect?: number; // e.g., 1, 1.5, 2, 0.75
  grayscale?: number;
}) {
  const visible = items.filter((i) => i.show !== false);
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4">
        {(title || subtitle) && (
          <header className="mb-12 text-center">
            {title && <h2 className="mb-3 text-3xl font-semibold tracking-tight text-black">{title}</h2>}
            {subtitle && <p className="mx-auto max-w-3xl text-base text-black/70">{subtitle}</p>}
          </header>
        )}

        {showIndicators && (
          <div className="mb-10 flex flex-wrap items-center justify-center gap-8 text-black">
            <div className="flex items-center gap-3 text-[15px] font-medium"><ShieldIcon className="h-5 w-5"/> Certified Official Partner</div>
            <div className="flex items-center gap-3 text-[15px] font-medium"><StarIcon className="h-5 w-5"/> 25,000+ Satisfied Customers</div>
            <div className="flex items-center gap-3 text-[15px] font-medium"><LockIcon className="h-5 w-5"/> Bank‑Level Security</div>
          </div>
        )}

        <div
          className="mb-12 grid"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
            gap: 16,
          }}
        >
          {visible.map((it, i) => (
            <figure
              key={i}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition will-change-transform hover:-translate-y-0.5"
              style={{ aspectRatio: String(aspect) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.src}
                alt={it.caption || `Logo ${i + 1}`}
                className="h-full w-full object-contain transition"
                style={{ filter: `grayscale(${grayscale}%)` }}
              />
              {it.caption && (
                <figcaption className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70 opacity-0 transition group-hover:opacity-90">
                  <span className="px-4 text-center text-sm font-semibold text-white">{it.caption}</span>
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {showSecurity && (
          <div className="rounded-xl border border-neutral-200 bg-slate-50 p-8">
            <h3 className="mb-6 text-center text-2xl font-semibold text-black">Your Security & Privacy Protected</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <SecurityItem icon={<LockIcon className="h-6 w-6"/>} title="SSL Encryption" desc="256‑bit SSL protects all data transmission and payment processing." />
              <SecurityItem icon={<ShieldIcon className="h-6 w-6"/>} title="PCI Compliance" desc="Industry‑standard card processing with continuous monitoring." />
              <SecurityItem icon={<PrivacyIcon className="h-6 w-6"/>} title="Data Protection" desc="GDPR compliant with strict privacy and retention policies." />
              <SecurityItem icon={<VerifyIcon className="h-6 w-6"/>} title="Verified Payments" desc="Multiple payment gateways with fraud prevention." />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SecurityItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 text-black">{icon}</div>
      <div>
        <div className="text-[16px] font-semibold text-black">{title}</div>
        <p className="text-[14px] text-black/70">{desc}</p>
      </div>
    </div>
  );
}

function LockIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <circle cx="12" cy="16" r="1"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
function StarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
function PrivacyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M14 9V5a3 3 0 0 0-6 0v4"/>
      <rect x="2" y="9" width="20" height="12" rx="2" ry="2"/>
    </svg>
  );
}
function VerifyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 12l2 2 4-4"/>
      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
      <path d="M3 12c1 0 3-1 3-3S4 6 3 6 0 7 0 9s2 3 3 3"/>
    </svg>
  );
}
