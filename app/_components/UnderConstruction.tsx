/** The one page the site shows in construction mode (owner 2026-10-14, twice: "open up to an 'under
 *  construction' page only", then "Nothing should be viewable - only UNDER CONSTRUCTION"): the two
 *  words, centred, in the site's serif on the site's ground — no monogram, no theme toggle, no name,
 *  no headline, no email, no footer, no links. The ground follows the visitor's stored theme or the
 *  system (the construction layout's script). Rendered by app/page.construction.tsx and, for every
 *  other address, app/not-found.construction.tsx; scripts/site-mode.mjs asserts the page carries
 *  neither the name nor the email. */
export function UnderConstruction() {
  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-5 text-center">
      <h1 className="font-serif text-2xl sm:text-4xl tracking-[0.18em] text-ink" style={{ fontWeight: 620 }}>UNDER CONSTRUCTION</h1>
    </main>
  );
}
