// app/policies/privacy/page.tsx
export const metadata = { title: "Privacy Policy • Paris River Seine" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-slate-700 leading-7">
        <p>Last updated: October 9, 2025</p>
        <p>
          This is a placeholder privacy policy. Replace with your real policy text.
        </p>
        <h2 className="text-xl font-semibold mt-8">Information We Collect</h2>
        <p>…</p>
        <h2 className="text-xl font-semibold mt-8">How We Use Information</h2>
        <p>…</p>
        <h2 className="text-xl font-semibold mt-8">Contact</h2>
        <p>Email: support@parisriverseine.com</p>
      </div>
    </main>
  );
}
