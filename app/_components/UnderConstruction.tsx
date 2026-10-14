import { Mail } from 'lucide-react';
import { cv } from '@/lib/cv';
import { Monogram } from './Monogram';
import { ThemeToggle } from './ThemeToggle';

/** The one page the site shows in construction mode (owner 2026-10-14; site-mode.json): the monogram
 *  and the theme toggle in the site's chrome, the name and headline, the word that the site is being
 *  rebuilt, and the email — the one contact this site publishes (charter: no address, no telephone,
 *  no references). No navigation: there is nowhere else to go. Rendered by app/page.construction.tsx
 *  and, for every other address, app/not-found.construction.tsx. The words are the owner's to change. */
export function UnderConstruction() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-chrome text-on-chrome no-print">
        <div className="mx-auto max-w-site px-5 sm:px-8 flex items-center justify-between h-14 sm:h-16">
          <span className="flex items-center h-14 sm:h-16 min-w-11" aria-label={cv.name}>
            <Monogram className="text-on-chrome" />
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main id="main-content" className="flex-grow mx-auto w-full max-w-site px-5 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.14em] text-muted" style={{ fontWeight: 600 }}>Under construction</p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight mt-3" style={{ fontWeight: 620 }}>{cv.name}</h1>
          {cv.headline && <p className="text-muted text-lg mt-3">{cv.headline}</p>}
          <p className="font-serif text-lg leading-relaxed text-ink/90 mt-8">
            This site is being rebuilt. The curriculum vitae and the research pages return when the work is done.
          </p>
          <p className="font-serif text-lg leading-relaxed text-ink/90 mt-4">
            In the meantime, email is the best way to reach me. A full CV with references is available on request.
          </p>
          <p className="mt-8 text-base">
            <a href={`mailto:${cv.email}`} className="inline-flex items-center gap-3 min-h-11 lg:min-h-0 underline">
              <Mail className="h-5 w-5 text-accent" aria-hidden />
              {cv.email}
            </a>
          </p>
        </div>
      </main>
      <footer className="bg-chrome text-on-chrome/80 no-print">
        <div className="mx-auto max-w-site px-5 sm:px-8 py-6 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 sm:gap-3 text-sm">
          <span>© {new Date().getFullYear()} {cv.name}</span>
          <a href={`mailto:${cv.email}`} className="inline-flex items-center min-h-11 lg:min-h-0 px-1.5 hover:text-white no-underline">{cv.email}</a>
        </div>
      </footer>
    </div>
  );
}
