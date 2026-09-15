# REALM CHARTER — jk_website (kirchner.cv, the owner's personal CV site)

Personal professional site for Joseph Kirchner: CV for networking and job
searching, with room for selected academic work. SEPARATE from
lawsofexistence.com (loe_website) — different audience, different repo,
different Netlify project. kirchner.ink is its own site (ink_site, cloned
from this repo 2026-09-12; shared code — a fix here belongs there too).

## Branch law (mirrors midesk BRANCHING.md §11)
- Agents work on and push `device/<host>` (this Mac: `device/macbook`).
- `main` is the production deploy (Netlify builds it). The OWNER moves main.
- R6: no force-push, no history rewrite, no trunk deletion.

## Content law
- `content/cv.json` is the ONLY content file. Pages render from it; a section
  with no entries is not rendered. Never hand-write CV facts into components.
- Every fact in cv.json comes from the owner. Agents never invent roles,
  dates, degrees, or skills; `scripts/validate-cv.mjs` refuses placeholder
  text at build time and lists empty sections in the build log.
- The site is public. Nothing from the litigation record, evidence trees, or
  research_library working files goes here unless the owner says so.
- **References are never published** (owner 2026-09-10). No reference names,
  phone numbers, street address, or any contact beyond `cv.email` in cv.json,
  works.json, or any page. The site invites people to request the full CV
  with references by e-mail; the resume and references sheet are Word files
  the owner sends by hand (`npm run build:resume`, private data from
  `~/.config/kirchner-cv/private.json`, never inside a repo). The validator
  refuses these keys and phone-shaped strings at build time.

## Home page and dark mode (owner 2026-09-15, as kirchner.ink)
The home page is the CV viewer beside the portrait + General information
card (`HomeLayout`, `InfoCard`); no headline, name, summary or availability
badge is rendered — the resume PDF carries them. The viewer's bar (zoom,
Download, Open in new tab) sits under the document; its corner grip widens
it and the card drops below. `ArchivesShelf` puts the two manuscript archives
and the Prynne epigraph beneath. Dark mode: Tailwind `darkMode: ['class']`;
every colour token is an RGB triple variable in `app/globals.css` (`:root`
light, `.dark` dark). Header/footer/info card use the `chrome` tokens (navy
in both modes); `ink` is the foreground and flips. The header `ThemeToggle`
cycles light / dark / system, remembered in localStorage `jk-theme`; the
inline script in `app/layout.tsx` applies the class before first paint.
Check a change in both modes.

## Stack
Next.js (App Router, `output: 'export'` → `out/`), TypeScript, Tailwind,
self-hosted fonts via next/font. No runtime server, no external scripts.
Gates before "done": `npm run build` (validate-cv → tsc → next build) and
`npm run lint`, both on bare exit code.

## DNS / hosting (2026-09-09)
Domains at Namecheap; DNS and hosting on Netlify (team axiomatic47). Mail for
joseph@kirchner.cv is Zoho (same as the other domains). The www redirect
lives in netlify.toml; kirchner.ink moved to its own Netlify project 2026-09-12.
