# REALM CHARTER — jk_website (kirchner.cv, the owner's personal CV site)

Personal professional site for Joseph Kirchner: CV for networking and job
searching, with room for selected academic work. SEPARATE from
lawsofexistence.com (loe_website) — different audience, different repo,
different Netlify project. kirchner.ink redirects here for now.

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

## Stack
Next.js (App Router, `output: 'export'` → `out/`), TypeScript, Tailwind,
self-hosted fonts via next/font. No runtime server, no external scripts.
Gates before "done": `npm run build` (validate-cv → tsc → next build) and
`npm run lint`, both on bare exit code.

## DNS / hosting (2026-09-09)
Domains at Namecheap; DNS and hosting on Netlify (team axiomatic47). Mail for
joseph@kirchner.cv is Zoho (same as the other domains). Redirect rules for
www and kirchner.ink live in netlify.toml.
