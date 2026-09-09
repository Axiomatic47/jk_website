import type { Metadata } from 'next';
import { cv, SITE_ORIGIN } from '@/lib/cv';
import './globals.css';

// Typography is a system font stack (Tailwind `font-serif` / `font-sans`, see
// tailwind.config.ts): no font download at build or at runtime, so the build
// is reproducible offline and the CSP needs no font hosts. Swap to
// next/font/local with licensed files if a specific face is wanted later.

const description = cv.headline
  ? `${cv.name} — ${cv.headline}`
  : `${cv.name}: curriculum vitae and selected work.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: cv.name, template: `%s — ${cv.name}` },
  description,
  alternates: { canonical: '/' },
  authors: [{ name: cv.name, url: SITE_ORIGIN }],
  openGraph: { title: cv.name, description, type: 'profile', url: SITE_ORIGIN, siteName: cv.name },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: cv.name,
    url: SITE_ORIGIN,
    email: `mailto:${cv.email}`,
    ...(cv.headline ? { jobTitle: cv.headline } : {}),
    ...(cv.links.length ? { sameAs: cv.links.map((l) => l.url) } : {}),
  };
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          // JSON-LD Person record for search engines; built from cv.json only.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
        />
      </body>
    </html>
  );
}
