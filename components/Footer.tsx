'use client';

// components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const payments = [
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/visa.svg', alt: 'Visa' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/mastercard.svg', alt: 'Mastercard' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/amex.svg', alt: 'American Express' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/apple-pay.svg', alt: 'Apple Pay' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/google-pay.svg', alt: 'Google Pay' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/ideal.svg', alt: 'iDEAL' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/bancontact.svg', alt: 'Bancontact' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/sofort.svg', alt: 'Sofort' },
    { src: 'https://cdn.jsdelivr.net/gh/stripe/stripe-assets/payment-icons/sepa.svg', alt: 'SEPA Direct Debit' },
  ];

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 text-sm text-slate-600 md:grid-cols-[1.5fr_1fr_1.5fr]">
        {/* Brand / Trust */}
        <div>
          <div className="font-semibold text-slate-800">Paris River Seine</div>
          <p className="mt-1 text-slate-500">
            Book authentic Seine River experiences — verified operators, instant confirmation, secure checkout.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">SSL Secure</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">PCI-DSS Compliant</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">3D Secure (SCA)</span>
          </div>
        </div>

        {/* Policies */}
        <div>
          <div className="font-semibold mb-2 text-slate-800">Policies</div>
          <ul className="space-y-1">
            <li><Link href="/policies/refund" className="hover:underline">Refund Policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:underline">Terms & Conditions</Link></li>
            <li><Link href="/policies/cookies" className="hover:underline">Cookies</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        {/* Payment methods */}
        <div aria-labelledby="payments-heading">
          <div id="payments-heading" className="font-semibold mb-3 text-slate-800">Payment methods</div>
          <a
            href="https://stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md border border-slate-200 bg-white p-3"
            aria-label="Powered by Stripe"
          >
            <object
              data="/api/pbadge"
              type="image/svg+xml"
              role="img"
              aria-label="Powered by Stripe"
              className="mx-auto h-8 w-auto"
            >
              <span className="block text-center text-xs text-slate-600">Powered by Stripe</span>
            </object>

          </a>

          <p className="mt-3 text-xs text-slate-500">
            Secure checkout via Stripe — cards, wallets, and EU local methods supported with 3D Secure (SCA).
          </p>
        </div>


      </div>

      <div className="border-t py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Paris River Seine — Secure checkout by Stripe
      </div>
    </footer>
  );
}
