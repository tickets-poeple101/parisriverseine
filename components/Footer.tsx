import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Logo" width={24} height={24} />
            <span className="text-sm font-black tracking-tight">PARIS RIVER SEINE</span>
          </div>
          <p className="text-sm text-slate-600">
            Official Seine experiences. Secure checkout, instant confirmation.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {/* replace with your real badges */}
            <Image src="/images/partner-visa.svg" alt="Visa" width={36} height={24} />
            <Image src="/images/partner-mastercard.svg" alt="Mastercard" width={36} height={24} />
            <Image src="/images/partner-amex.svg" alt="Amex" width={36} height={24} />
            <Image src="/images/partner-stripe.svg" alt="Stripe" width={54} height={24} />
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-slate-900">Explore</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/products/test" className="hover:text-slate-900">Tickets</Link></li>
            <li><a href="/#about" className="hover:text-slate-900">About</a></li>
            <li><a href="/#contact" className="hover:text-slate-900">Contact</a></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-slate-900">Support</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/policies/refund" className="hover:text-slate-900">Refund Policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-slate-900">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-slate-900">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-bold text-slate-900">Security</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>🔒 256-bit SSL encryption</li>
            <li>✅ PCI-compliant payments</li>
            <li>🇪🇺 GDPR data protection</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Paris River Seine. All rights reserved.</span>
          <span>VAT/Company info here</span>
        </div>
      </div>
    </footer>
  );
}
