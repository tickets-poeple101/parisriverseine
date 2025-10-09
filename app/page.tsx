import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2 text-xs text-slate-600 flex items-center justify-between">
          <span>Instant e-ticket delivery • Secure checkout by Stripe</span>
          <a href="mailto:support@parisriverseine.com" className="hover:underline">
            Support
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-sky-500 text-white grid place-items-center font-bold">PR</div>
            <span className="font-semibold tracking-tight">Paris River Seine</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-slate-600">
            <Link href="/products" className="hover:text-slate-900">Cruises</Link>
            <a href="#about" className="hover:text-slate-900">About</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <Link
            href="/products"
            className="rounded-xl bg-sky-500 px-4 py-2 text-white text-sm font-medium hover:bg-sky-600"
          >
            Buy Tickets
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Seine River Cruises &amp; Combos
            </h1>
            <p className="mt-4 text-slate-600">
              Open-date tickets. Instant delivery after payment. No queues, no stress.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-sky-500 px-5 py-3 text-white font-medium hover:bg-sky-600"
              >
                Browse tickets
              </Link>
              <a
                href="#how"
                className="rounded-xl border px-5 py-3 text-slate-700 hover:bg-slate-50"
              >
                How it works
              </a>
            </div>
            <div className="mt-3 text-xs text-slate-500">Official partners • 3D Secure payments</div>
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border bg-slate-100">
            <Image
              src="/images/paris-thumb.jpg"
              alt="Seine River at sunset with cruise boats"
              width={1280}
              height={800}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trust bullets */}
      <section id="how" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border p-5">
            <div className="font-medium">Instant e-tickets</div>
            <p className="text-sm text-slate-600 mt-1">Delivered to your email within seconds.</p>
          </div>
          <div className="rounded-xl border p-5">
            <div className="font-medium">Best sellers</div>
            <p className="text-sm text-slate-600 mt-1">Parisiens, Bateaux Mouches, and Big Bus + Cruise.</p>
          </div>
          <div className="rounded-xl border p-5">
            <div className="font-medium">Secure checkout</div>
            <p className="text-sm text-slate-600 mt-1">Stripe + 3D Secure. Refunds according to policy.</p>
          </div>
        </div>
      </section>

      {/* About / FAQ anchors (optional content so the hash links aren’t dead) */}
      <section id="about" className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-xl font-semibold mb-2">About</h2>
        <p className="text-slate-600 text-sm">
          We sell open-date Seine cruise tickets and popular combo passes. Instant delivery after payment.
        </p>
      </section>
      <section id="faq" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-xl font-semibold mb-2">FAQ</h2>
        <p className="text-slate-600 text-sm">Your e-tickets arrive immediately. Most tickets are valid for 6 months.</p>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600 grid gap-6 md:grid-cols-3">
          <div>
            <div className="font-semibold">Paris River Seine</div>
            <p className="text-slate-500 mt-1">Seine cruises and combo tickets in Paris.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Tickets</div>
            <ul className="space-y-1">
              <li><Link href="/products" className="hover:underline">Parisiens Cruise</Link></li>
              <li><Link href="/products" className="hover:underline">Bateaux Mouches</Link></li>
              <li><Link href="/products" className="hover:underline">Big Bus + Cruise</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Legal</div>
            <ul className="space-y-1">
              <li><Link href="/policies/refund" className="hover:underline">Refund Policy</Link></li>
              <li><Link href="/policies/privacy" className="hover:underline">Privacy</Link></li>
              <li><Link href="/policies/terms" className="hover:underline">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Paris River Seine — Secure checkout by Stripe
        </div>
      </footer>
    </main>
  );
}
