#!/usr/bin/env node
// scripts/site-mode.mjs — the site's mode (site-mode.json at the repo root: "live" or "construction").
//   node scripts/site-mode.mjs           # print the mode
//   node scripts/site-mode.mjs --prune   # the build's last step: in construction mode, trim out/ to the
//                                        # construction page and what it needs; in live mode, nothing
// In construction mode next.config.ts has already routed only the *.construction.* files, so out/ holds
// index.html, 404.html (both the construction page), their RSC payloads, _next/ and the whole of
// public/. The prune keeps an ALLOW-LIST — the page's own files, _next/ (its script and
// style), __forms/ (the readings form Netlify detects at deploy; nothing links it) and robots.txt —
// writes sitemap.xml naming the one page, and removes everything else (the resume and CV PDFs, the works, the uploads, pdf.js,
// the OG images, the portrait): an "under construction" site serves the one page, not its library.
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
const KEEP_FILES = new Set(['index.html', '404.html', 'robots.txt', 'sitemap.xml']);
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

// the sitemap: the one page (written here — a metadata route under the construction extension is one
// Next cannot resolve at build; public/robots.txt names /sitemap.xml and keeps resolving)
const origin = 'https://kirchner.cv';
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${origin}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>weekly</changefreq><priority>1</priority></url>\n</urlset>\n`);

// the result: the two pages are the construction page, the form file is there, nothing else answers
for (const f of ['index.html', '404.html', 'sitemap.xml', 'robots.txt', '__forms/open-reading.html']) if (!existsSync(join(OUT, f))) fail(`${f} missing after the prune`);
for (const f of ['index.html', '404.html']) {
  const html = readFileSync(join(OUT, f), 'utf8');
  if (!/Under construction/.test(html)) fail(`${f} is not the construction page`);
  if (/\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}/.test(html)) fail(`${f} carries a telephone number`);
}
const htmlElsewhere = [];
const walk = (d, rel) => { for (const n of readdirSync(d)) { const p = join(d, n), r = rel ? `${rel}/${n}` : n; if (statSync(p).isDirectory()) walk(p, r); else if (/\.html$/.test(n) && !r.startsWith('__forms/') && r !== 'index.html' && r !== '404.html') htmlElsewhere.push(r); } };
walk(OUT, '');
if (htmlElsewhere.length) fail(`pages other than the construction page remain: ${htmlElsewhere.join(', ')}`);
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
if ((sitemap.match(/<loc>/g) || []).length !== 1) fail('sitemap.xml names more than the one page');
console.log(`site mode: construction — out/ pruned to the construction page. kept: ${kept.join(', ')}; removed: ${removed.join(', ') || 'nothing'}`);
