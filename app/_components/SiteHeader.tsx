'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cv } from '@/lib/cv';

const NAV = [
  { href: '/', label: 'About' },
  { href: '/work', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const path = usePathname() ?? '/';
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  return (
    <header className="bg-ink text-on-ink no-print">
      <div className="mx-auto max-w-site px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="font-serif text-xl tracking-tight no-underline" style={{ fontWeight: 560 }}>
          {cv.name.split(' ')[0]}
          <span className="text-accent">.</span>
          cv
        </Link>
        <nav aria-label="Primary" className="flex items-stretch h-full">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={active(n.href) ? 'page' : undefined}
              className={`flex items-center px-4 sm:px-5 text-sm tracking-wide no-underline border-b-2 transition-colors ${
                active(n.href)
                  ? 'border-accent text-white'
                  : 'border-transparent text-on-ink/75 hover:text-white hover:bg-ink-2'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
