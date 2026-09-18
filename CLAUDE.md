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

## Research archives — the published set, and Whittick's edition (owner 2026-09-18)
`public/uploads/research/<id>/` is the published set built by lawsofexistence.com's
`scripts/sync-archives.mjs` and copied here verbatim (as on kirchner.ink; no builder
here). Since 2026-09-18 the STAC 8/203/38 pages serve **Christopher Whittick's
professional verification transcription** (doc kind `edition`, `PUBLISHED_KINDS` in
`src/lib/research-archive.ts`) in place of the owner's per-leaf transcripts, on his
written agreement of 18 Sep 2026 and the owner's word. Rules as kirchner.ink's charter:
credit reads exactly "Professional verification transcription by Christopher Whittick"
wherever his text shows; his licence is the basis for his text — never print the Open
Government Licence over it (cite the record as "The National Archives, ref. STAC
8/203/38"); the owner's transcripts stay in the library, unserved. Sibling commits are
named in each commit here.

## Analytics — first-party, no third party (owner 2026-09-16)
The site counts its own page views, the same code as kirchner.ink (ink_site
e4b7cf5..a3951ff): `app/_components/Analytics.tsx` posts `{p, r, w}` to the
site's own `/api/hit` (edge function `netlify/edge-functions/hit.js` →
`netlify/lib/analytics-hit.mjs`), one Blobs record per view; the hourly
scheduled function `netlify/functions/analytics-rollup.mjs` folds them into
`day/<day>.json`; the console reads them at `/admin/analytics`. Design, data
model and gates: `docs/ANALYTICS.md`. Rules:
- **Recorded per view**: normalized path, referrer HOST (first load only),
  country, device class, hour (owner's zone, `ANALYTICS_TZ`), and a visitor
  hash of `sha256(daily salt · host · ip · ua)` that dies with the day's salt at
  day close. **Never**: IP, user agent, query strings, fragments, anything under
  `/admin`. **Never counted**: bots, prefetches, `Sec-GPC: 1`, the Privacy
  page's off switch (`localStorage jk-analytics`), localhost.
- The store name follows the deploy context (`analytics`,
  `analytics-branch-deploy`, `analytics-deploy-preview`): test on a branch deploy
  freely, production numbers are production's.
- The roll-up is the only writer of `day/*.json` (lock + etag + `pending_delete`
  guard); the edge function writes raws and the salt only. Do not add a second
  writer.
- The Privacy page states exactly this; a change to what is recorded is a change
  to that page in the same commit.
- Gates: `npm run test:analytics`, `npm run test:edge` (Deno), `npm run test:console`,
  lint, build. The edge and core modules are Web-standard (no `node:` imports) so
  Deno and Node run the same files — keep them that way. A fix here belongs in
  ink_site too; name the sibling commit.

## Stack
Next.js (App Router, `output: 'export'` → `out/`), TypeScript, Tailwind,
self-hosted fonts via next/font. No runtime server, no external scripts.
Gates before "done": `npm run build` (validate-cv → tsc → next build) and
`npm run lint`, both on bare exit code.

## DNS / hosting (2026-09-09)
Domains at Namecheap; DNS and hosting on Netlify (team axiomatic47). Mail for
joseph@kirchner.cv is Zoho (same as the other domains). The www redirect
lives in netlify.toml; kirchner.ink moved to its own Netlify project 2026-09-12.
