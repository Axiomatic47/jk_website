import type { Metadata } from 'next';
import { cv, SITE_ORIGIN } from '@/lib/cv';
import { Analytics } from './_components/Analytics';
import './globals.css';

// The root layout while site-mode.json says `construction` (next.config.ts routes only the
// *.construction.* files then; app/layout.tsx is the live site's and stays untouched): the same head
// as the live layout — the theme applied before first paint, the Person record, the page-view beacon —
// with the construction page's own title and description. Indexed on purpose: a search for the name
// should still find the site, and the page says what it is.

const title = `${cv.name} — under construction`;
const description = `${cv.name}'s site is being rebuilt. Email ${cv.email} to get in touch; a full CV with references is available on request.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: title, template: `%s — ${cv.name}` },
  description,
  authors: [{ name: cv.name, url: SITE_ORIGIN }],
  openGraph: { title, description, type: 'profile', url: SITE_ORIGIN, siteName: cv.name },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
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
  // applied before first paint so a dark visitor never sees a light flash; the same rule as
  // ThemeToggle.applyTheme and app/layout.tsx (CSP allows inline script)
  const themeScript = `(function(){try{var t=localStorage.getItem('jk-theme');var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      </body>
    </html>
  );
}
