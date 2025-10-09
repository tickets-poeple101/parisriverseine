// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
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
  );
}
