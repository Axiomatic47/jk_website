// Section — a titled block of the CV. Callers render it only when they have entries.
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={slug(title)} className="mt-12 first:mt-0">
      <h2
        id={slug(title)}
        className="font-sans text-xs uppercase tracking-[0.14em] text-muted border-b border-rule pb-2 mb-6"
        style={{ fontWeight: 600 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
