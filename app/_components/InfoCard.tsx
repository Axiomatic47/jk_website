import Link from 'next/link';
import { cv } from '@/lib/cv';
import { Portrait } from './Portrait';

/** The portrait + "General information" card (mirrors kirchner.ink,
 *  owner 2026-09-14). Words, not icons, label the rows; the slot under the
 *  rows carries one contextual link. A link to a file (`download`) renders a
 *  plain anchor; a route renders a Next link. */
export function InfoCard({ link }: { link?: { href: string; label: string; download?: boolean } }) {
  const linkClass = 'text-accent underline underline-offset-4 hover:text-white';
  return (
    <aside className="lg:sticky lg:top-8 space-y-0 rounded-lg overflow-hidden shadow-card border border-rule">
      <Portrait />
      <div className="bg-ink text-on-ink p-6">
        <h2 className="font-serif text-2xl mb-4" style={{ fontWeight: 560 }}>General information</h2>
        <dl className="space-y-3 text-sm">
          <div><dt className="inline text-on-ink/60">Name: </dt><dd className="inline">{cv.name}</dd></div>
          {cv.location && (
            <div><dt className="inline text-on-ink/60">Location: </dt><dd className="inline">{cv.location}</dd></div>
          )}
          <div><dt className="inline text-on-ink/60">Email: </dt><dd className="inline"><a href={`mailto:${cv.email}`} className="hover:text-white">{cv.email}</a></dd></div>
          {cv.links.map((l) => (
            <div key={l.url}><dt className="sr-only">Link</dt><dd className="inline"><a href={l.url} rel="me noopener" className="hover:text-white">{l.label}</a></dd></div>
          ))}
        </dl>
        {link && (
          <p className="mt-6 text-sm">
            {link.download
              ? <a href={link.href} download className={linkClass}>{link.label}</a>
              : <Link href={link.href} className={linkClass}>{link.label}</Link>}
          </p>
        )}
      </div>
    </aside>
  );
}
