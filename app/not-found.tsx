import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page Not Found', robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-page px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.14em] text-muted" style={{ fontWeight: 600 }}>
        404
      </p>
      <h1 className="font-serif text-4xl mt-3" style={{ fontWeight: 560 }}>
        Page Not Found
      </h1>
      <p className="mt-4 text-muted">There is nothing at this address.</p>
      <Link href="/" className="mt-8 inline-block underline text-accent">
        Back to the CV
      </Link>
    </main>
  );
}
