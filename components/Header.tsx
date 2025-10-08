"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products/test", label: "Tickets" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* Replace with your logo file */}
          <Image src="/images/logo.svg" alt="Paris River Seine" width={28} height={28} />
          <span className="text-sm font-black tracking-tight">PARIS RIVER SEINE</span>
        </Link>

        {/* Nav */}
        <nav className="hidden gap-6 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium hover:text-slate-900 ${
                  active ? "text-slate-900" : "text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side (CTA) */}
        <div className="flex items-center gap-2">
          <Link
            href="/products/test"
            className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110"
          >
            Book tickets
          </Link>
        </div>
      </div>
    </header>
  );
}
