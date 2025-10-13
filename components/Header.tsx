"use client";

import Link from "next/link";
import Image from "next/image";

/** Tweak these */
const SUPPORT_EMAIL = "tickets@parisriverseinecruises.com";
const TICKETS_HREF = "/#tickets";
const LOGO_SIZE = 48; // 👈 make the logo bigger/smaller by changing this (36–48 is nice)

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3" aria-label="Paris River Seine – Home">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={48}             // adjust size here (e.g. 40–48)
            height={48}
            className="shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
            priority
          />

          <span className="text-base md:text-lg font-extrabold tracking-tight leading-none">
            Paris River Seine
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Policies (matches secondary button style, with lightweight dropdown) */}
          <details className="relative">
            <summary
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
              aria-haspopup="menu"
            >
              Policies
            </summary>
            <div
              className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
              role="menu"
              aria-label="Policies"
            >
              <Link href="/policies/refund" className="block rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
                Refund Policy
              </Link>
              <Link href="/policies/privacy" className="block rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
                Privacy Policy
              </Link>
              <Link href="/policies/terms" className="block rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50" role="menuitem">
                Terms &amp; Conditions
              </Link>
            </div>
          </details>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Contact
          </a>
          <Link
            href={TICKETS_HREF}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Book tickets
          </Link>
        </div>


      </div>
    </header>
  );
}
