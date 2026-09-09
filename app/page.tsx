import { cv, dateRange } from '@/lib/cv';
import Link from 'next/link';
import { Section } from './_components/Section';

export default function Home() {
  const hasContact = cv.email || cv.links.length || cv.pdf;
  return (
    <main id="main-content" className="mx-auto max-w-page px-6 py-14 sm:py-20">
      <header className="mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight" style={{ fontWeight: 560 }}>
          {cv.name}
        </h1>
        {cv.headline && <p className="mt-3 text-lg text-muted">{cv.headline}</p>}
        {hasContact && (
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {cv.location && <li className="text-muted">{cv.location}</li>}
            {cv.email && (
              <li>
                <a href={`mailto:${cv.email}`} className="underline">
                  {cv.email}
                </a>
              </li>
            )}
            {cv.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} className="underline" rel="me noopener">
                  {l.label}
                </a>
              </li>
            ))}
            {cv.pdf && (
              <li className="no-print">
                <a href={cv.pdf} className="underline text-accent">
                  Download CV (PDF)
                </a>
              </li>
            )}
          </ul>
        )}
      </header>

      {cv.summary && (
        <Section title="Summary">
          <p className="font-serif text-lg leading-relaxed">{cv.summary}</p>
        </Section>
      )}

      {cv.experience.length > 0 && (
        <Section title="Experience">
          <ol className="space-y-8">
            {cv.experience.map((e) => (
              <li key={`${e.organization}-${e.role}-${e.start}`} className="grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-1">
                <div className="text-sm text-muted tabular-nums">{dateRange(e)}</div>
                <div>
                  <h3 className="font-serif text-xl" style={{ fontWeight: 560 }}>
                    {e.role}
                  </h3>
                  <p className="text-muted">
                    {e.organization}
                    {e.location ? ` · ${e.location}` : ''}
                  </p>
                  {e.summary && <p className="mt-2 leading-relaxed">{e.summary}</p>}
                  {e.highlights && e.highlights.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 space-y-1 leading-relaxed">
                      {e.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {cv.education.length > 0 && (
        <Section title="Education">
          <ul className="space-y-5">
            {cv.education.map((e) => (
              <li key={`${e.institution}-${e.degree}`} className="grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-1">
                <div className="text-sm text-muted tabular-nums">{e.year ?? ''}</div>
                <div>
                  <h3 className="font-serif text-xl" style={{ fontWeight: 560 }}>
                    {e.degree}
                  </h3>
                  <p className="text-muted">{e.institution}</p>
                  {e.detail && <p className="mt-1 leading-relaxed">{e.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {cv.works.length > 0 && (
        <Section title="Selected Work">
          <ul className="space-y-4">
            {cv.works.map((w) => (
              <li key={w.title} className="grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-1">
                <div className="text-sm text-muted tabular-nums">{w.year ?? ''}</div>
                <div>
                  <h3 className="font-serif text-lg" style={{ fontWeight: 560 }}>
                    {w.url ? (
                      <a href={w.url} className="underline">
                        {w.title}
                      </a>
                    ) : (
                      w.title
                    )}
                  </h3>
                  {w.venue && <p className="text-muted text-sm">{w.venue}</p>}
                  {w.note && <p className="mt-1 leading-relaxed">{w.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {cv.skills.length > 0 && (
        <Section title="Skills">
          <dl className="space-y-3">
            {cv.skills.map((g) => (
              <div key={g.group} className="grid sm:grid-cols-[9rem_1fr] gap-x-6 gap-y-1">
                <dt className="text-sm text-muted">{g.group}</dt>
                <dd>{g.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <footer className="mt-16 pt-6 border-t border-rule text-sm text-muted flex flex-wrap justify-between gap-2">
        <span>© {new Date().getFullYear()} {cv.name}</span>
        <Link href="/" className="underline">
          kirchner.cv
        </Link>
      </footer>
    </main>
  );
}
