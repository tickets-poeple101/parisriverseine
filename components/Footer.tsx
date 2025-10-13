// components/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';

// Uniform card sizing (prevents hydration mismatches)
const ICON_CARD_H = 'h-8';   // 32px tall thumbnail window
const ICON_CARD_W = 'w-12';  // 48px wide thumbnail window

export default function Footer() {
  // Local assets — scaled per icon to compensate for intrinsic padding
  const paymentIcons = [
    { src: '/images/payment-icons/visa.png', alt: 'Visa', scale: 'scale-[1.25]' },
    { src: '/images/payment-icons/mastercard.png', alt: 'Mastercard', scale: 'scale-[1.25]' },
    { src: '/images/payment-icons/americanexpress.png', alt: 'American Express', scale: 'scale-[1.25]' },
    { src: '/images/payment-icons/maestro.png', alt: 'Maestro', scale: 'scale-[1.25]' },
    { src: '/images/payment-icons/union.svg', alt: 'UnionPay', scale: 'scale-[1.18]' },
    { src: '/images/payment-icons/applepay.svg', alt: 'Apple Pay', scale: 'scale-[1.35]' },
    { src: '/images/payment-icons/googlepay.svg', alt: 'Google Pay', scale: 'scale-[1.35]' },
    { src: '/images/payment-icons/klarna.svg', alt: 'Klarna', scale: 'scale-[1.30]' },
  ] as const;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-10 text-sm text-slate-600 md:grid-cols-[1.4fr_1fr_1.6fr]">

        {/* Brand / Trust */}
        <div>
          <div className="font-semibold text-slate-900">Paris River Seine</div>
          <p className="mt-1 text-slate-500">Book authentic Seine River experiences — instant confirmation, secure checkout.</p>
          <p className="mt-1 text-xs text-slate-500">Reseller of verified operators.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-600">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">SSL secure</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">PCI-DSS compliant</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1">3D Secure (SCA)</span>
          </div>
        </div>

        {/* Policies */}
        <div>
          <div className="font-semibold mb-2 text-slate-900">Policies</div>
          <ul className="space-y-1">
            <li><Link href="/policies/refund" className="hover:underline">Refund Policy</Link></li>
            <li><Link href="/policies/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:underline">Terms & Conditions</Link></li>
          </ul>

        </div>

        {/* Payments */}
        {/* Payments */}
        <div aria-labelledby="payments-heading">
          <div id="payments-heading" className="font-semibold mb-2 text-slate-900">Payment methods</div>

          {/* Inline row: icons + small Stripe badge (no bulky bar) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {[
              // scale values compensate for intrinsic padding so logos “kiss” the edges
              { src: '/images/payment-icons/visa.png', alt: 'Visa', scale: 'scale-[1.25]' },
              { src: '/images/payment-icons/mastercard.png', alt: 'Mastercard', scale: 'scale-[1.25]' },
              { src: '/images/payment-icons/americanexpress.png', alt: 'American Express', scale: 'scale-[1.25]' },
              { src: '/images/payment-icons/maestro.png', alt: 'Maestro', scale: 'scale-[1.25]' },
              { src: '/images/payment-icons/union.svg', alt: 'UnionPay', scale: 'scale-[1.18]' },
              { src: '/images/payment-icons/applepay.svg', alt: 'Apple Pay', scale: 'scale-[1.35]' },
              { src: '/images/payment-icons/googlepay.svg', alt: 'Google Pay', scale: 'scale-[1.35]' },
              { src: '/images/payment-icons/klarna.svg', alt: 'Klarna', scale: 'scale-[1.30]' },
            ].map((p) => (
              <span key={p.alt} className="relative h-6 w-10 overflow-hidden">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="40px"
                  className={`object-contain ${p.scale}`}
                />
              </span>
            ))}

            {/* Powered by Stripe — inline, compact */}
            <a
              href="https://stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Powered by Stripe"
              className="ml-1 inline-flex items-center rounded-md ring-1 ring-slate-300 px-2 py-1 hover:ring-slate-400 transition"
            >
              <Image
                src="/badges/powered-by-stripe.svg"
                alt="Powered by Stripe"
                width={120}
                height={24}
                className="h-5 w-auto"
                priority={false}
              />
            </a>
          </div>
        </div>

      </div>

      <div className="border-t py-4 text-center text-xs text-slate-500">
        © {year} Paris River Seine — Secure checkout by Stripe
      </div>
    </footer>
  );
}
