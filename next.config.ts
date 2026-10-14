import type { NextConfig } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The site's mode (site-mode.json at the repo root, flipped by the owner): `live` builds the site;
// `construction` (owner 2026-10-14) routes ONLY the *.construction.* files under app/ — layout, page,
// not-found — so the export is the construction page alone, every other address its 404
// copy; the live route files stay in place, untouched, for the flip back. scripts/site-mode.mjs
// --prune (the build's last step) then trims out/ to what that page needs. The functions, the edge
// function, the readings form's detection file and the DNS zone are outside this switch.
const SITE_MODE = JSON.parse(readFileSync(join(process.cwd(), 'site-mode.json'), 'utf8')).mode as string;
if (SITE_MODE !== 'live' && SITE_MODE !== 'construction') throw new Error(`site-mode.json: mode must be "live" or "construction", not ${JSON.stringify(SITE_MODE)}`);

// Static export: the whole site is plain HTML/CSS/JS under out/, served by
// Netlify with no framework runtime. Redirects and headers live in netlify.toml.
const nextConfig: NextConfig = {
  output: 'export',
  ...(SITE_MODE === 'construction' ? { pageExtensions: ['construction.tsx', 'construction.ts'] } : {}),
  trailingSlash: false,
  images: { unoptimized: true },
  reactStrictMode: true,
  // The Studio's SITES preview (and anyone opening the dev server by address rather than by
  // name) reaches it as 127.0.0.1: Next blocks its own dev resources cross-origin unless the
  // host is listed, and the PDF viewer then never gets its worker (studio-spec finding,
  // 2026-09-15). Dev only; the static export has no dev origin.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // `next dev` otherwise appends a vendor 'agent rules' block to CLAUDE.md on every start — the
  // realm charter is the owner's document, not a build artefact (2026-09-15)
  agentRules: false,
  // dev only: forwarded '[browser]' console lines carry file:line, for the Studio's issue capture
  // (studio-spec ask, 2026-09-15). In Next 16.3 the key lives under `experimental` (16.2 had it at
  // the top level); the successor `logging.browserToTerminal` has no source-location option yet.
  experimental: { browserDebugInfoInTerminal: { showSourceLocation: true } },
};

export default nextConfig;
