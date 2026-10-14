import type { Metadata } from 'next';
import { SITE_ORIGIN } from '@/lib/cv';
import { Analytics } from './_components/Analytics';
import './globals.css';

// The root layout while site-mode.json says `construction` (next.config.ts routes only the
// *.construction.* files then; app/layout.tsx is the live site's and stays untouched). Nothing
// viewable but the two words (owner 2026-10-14): the title is "Under construction", the description
// the same, no Person record, no author, no site name — the live head's theme script (so the ground
// follows the visitor's choice or system, no light flash) and the page-view beacon are the whole
// head. HIDDEN FROM SEARCH (owner, the same day): noindex, nofollow here, the same as an X-Robots-Tag
// header on every response (out/_headers, written by scripts/site-mode.mjs), and no sitemap;
// robots.txt keeps allowing the crawl so a crawler can read the noindex — a blocked address stays
// listed.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: 'Under construction',
  description: 'Under construction.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </body>
    </html>
  );
}
