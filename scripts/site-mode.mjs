#!/usr/bin/env node
// scripts/site-mode.mjs — the site's mode (site-mode.json at the repo root: "live" or "construction").
//   node scripts/site-mode.mjs           # print the mode
//   node scripts/site-mode.mjs --prune   # the build's last step: in construction mode, trim out/ to the
//                                        # construction page and what it needs; in live mode, nothing
// In construction mode next.config.ts has already routed only the *.construction.* files, so out/ holds
// index.html, 404.html (both the construction page), their RSC payloads, _next/ and the whole of
// public/. The prune keeps an ALLOW-LIST — the page's own files, _next/ (its script and
// style) and __forms/ (the readings form Netlify detects at deploy; nothing links it) — removes
// everything else (the resume and CV PDFs, the works, the uploads, pdf.js, the OG images, the
// portrait, the live robots.txt): an "under construction" site serves the one page, not its library —
// and that page is the two words alone (owner: "Nothing should be viewable - only UNDER CONSTRUCTION").
// HIDDEN FROM SEARCH (owner 2026-10-14): it writes robots.txt (crawling ALLOWED, no sitemap line —
// a blocked crawler cannot read a noindex and leaves the address listed) and _headers
// (X-Robots-Tag: noindex, nofollow on every response, beside the layout's meta), and no sitemap.
// It then asserts the result and exits 1 on anything short of it — a half-pruned out/ never deploys.
import { readFileSync, writeFileSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'out');
const fail = (m) => { console.error(`site-mode: ${m}`); process.exit(1); };

const mode = JSON.parse(readFileSync(join(ROOT, 'site-mode.json'), 'utf8')).mode;
if (mode !== 'live' && mode !== 'construction') fail(`site-mode.json: mode must be "live" or "construction", not ${JSON.stringify(mode)}`);
if (!process.argv.includes('--prune')) { console.log(`site mode: ${mode}`); process.exit(0); }
if (mode === 'live') { console.log('site mode: live — out/ is the whole site, untouched'); process.exit(0); }

if (!existsSync(OUT)) fail('out/ missing — run next build first');
const KEEP_FILES = new Set(['index.html', '404.html']);
const KEEP_DIRS = new Set(['_next', '__forms']);
const isRootPayload = (name) => /^(__next.*|index)\.txt$/.test(name); // the home route's RSC payloads
const removed = [], kept = [];
for (const name of readdirSync(OUT).sort()) {
  const p = join(OUT, name);
  const dir = statSync(p).isDirectory();
  const keep = dir ? KEEP_DIRS.has(name) : (KEEP_FILES.has(name) || isRootPayload(name));
  if (keep) { kept.push(dir ? `${name}/` : name); continue; }
  rmSync(p, { recursive: true, force: true });
  removed.push(dir ? `${name}/` : name);
}

// hidden from search: the crawl allowed (so the noindex is read), no sitemap, the header on every response
writeFileSync(join(OUT, 'robots.txt'), '# construction mode (scripts/site-mode.mjs): the one page is noindex; crawling stays allowed so that is read\nUser-agent: *\nAllow: /\n');
writeFileSync(join(OUT, '_headers'), '# construction mode (scripts/site-mode.mjs): hidden from search on the owner\'s word, 2026-10-14\n/*\n  X-Robots-Tag: noindex, nofollow\n');

// the result: the two pages are the construction page, the form file is there, nothing else answers
for (const f of ['index.html', '404.html', 'robots.txt', '_headers', '__forms/open-reading.html']) if (!existsSync(join(OUT, f))) fail(`${f} missing after the prune`);
if (existsSync(join(OUT, 'sitemap.xml'))) fail('sitemap.xml present — a hidden page lists no sitemap');
for (const f of ['index.html', '404.html']) {
  const html = readFileSync(join(OUT, f), 'utf8');
  if (!/UNDER CONSTRUCTION/.test(html)) fail(`${f} is not the construction page`);
  if (!/name="robots" content="noindex, nofollow"/.test(html)) fail(`${f} is not noindex, nofollow`);
  // nothing viewable but the two words (owner 2026-10-14): not the name, not the email, not a telephone
  if (/Joseph Kirchner|@kirchner\.cv/.test(html)) fail(`${f} carries the name or the email`);
  if (/\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/.test(html)) fail(`${f} carries a telephone number`);
}
const robots = readFileSync(join(OUT, 'robots.txt'), 'utf8');
if (/Sitemap:|Disallow: \/\s*$/m.test(robots)) fail('robots.txt names a sitemap or blocks the crawl (a blocked crawler cannot read the noindex)');
if (!/X-Robots-Tag: noindex, nofollow/.test(readFileSync(join(OUT, '_headers'), 'utf8'))) fail('_headers lacks the noindex header');
const htmlElsewhere = [];
const walk = (d, rel) => { for (const n of readdirSync(d)) { const p = join(d, n), r = rel ? `${rel}/${n}` : n; if (statSync(p).isDirectory()) walk(p, r); else if (/\.html$/.test(n) && !r.startsWith('__forms/') && r !== 'index.html' && r !== '404.html') htmlElsewhere.push(r); } };
walk(OUT, '');
if (htmlElsewhere.length) fail(`pages other than the construction page remain: ${htmlElsewhere.join(', ')}`);
console.log(`site mode: construction — out/ pruned to the construction page. kept: ${kept.join(', ')}; removed: ${removed.join(', ') || 'nothing'}`);
