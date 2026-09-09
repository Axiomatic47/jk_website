#!/usr/bin/env node
// validate-cv.mjs — build gate for content/cv.json.
// Hard errors (exit 1): missing name/email, malformed entries, placeholder
// text (TODO, lorem, "Your ...", "[ ]"), links that are not https URLs.
// Warnings: sections still empty — printed so the build log says what the
// site is not yet showing.
import { readFileSync } from 'node:fs';

const cv = JSON.parse(readFileSync(new URL('../content/cv.json', import.meta.url), 'utf8'));
const errors = [];
const warnings = [];

const PLACEHOLDER = /\b(TODO|TBD|lorem|ipsum|placeholder|your (name|title|role|company))\b|\[[^\]]*\]/i;
const walk = (v, path) => {
  if (typeof v === 'string') { if (PLACEHOLDER.test(v)) errors.push(`${path}: placeholder text "${v.slice(0, 60)}"`); }
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== '$comment') walk(x, `${path}.${k}`);
};
walk(cv, 'cv');

if (!cv.name?.trim()) errors.push('cv.name is required');
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cv.email ?? '')) errors.push('cv.email must be an email address');

for (const [i, l] of (cv.links ?? []).entries()) {
  if (!l.label?.trim()) errors.push(`links[${i}].label missing`);
  if (!/^https:\/\//.test(l.url ?? '')) errors.push(`links[${i}].url must start with https://`);
}
for (const [i, e] of (cv.experience ?? []).entries()) {
  for (const k of ['role', 'organization', 'start']) if (!e[k]?.trim()) errors.push(`experience[${i}].${k} missing`);
}
for (const [i, e] of (cv.education ?? []).entries()) {
  if (!e.institution?.trim()) errors.push(`education[${i}].institution missing`);
}
for (const [i, g] of (cv.skills ?? []).entries()) {
  if (!g.group?.trim() || !Array.isArray(g.items) || g.items.length === 0) errors.push(`skills[${i}] needs group + items`);
}
for (const [i, w] of (cv.works ?? []).entries()) {
  if (!w.title?.trim()) errors.push(`works[${i}].title missing`);
  if (w.url && !/^https:\/\//.test(w.url)) errors.push(`works[${i}].url must start with https://`);
}
if (cv.pdf && !/^\/[\w./-]+\.pdf$/.test(cv.pdf)) errors.push('cv.pdf must be a site-relative path to a .pdf under public/');

for (const k of ['headline', 'location', 'summary']) if (!cv[k]?.trim()) warnings.push(`${k} is empty (not rendered)`);
for (const k of ['experience', 'education', 'skills', 'works']) if (!(cv[k]?.length)) warnings.push(`${k} is empty (section not rendered)`);
if (!cv.pdf) warnings.push('pdf is empty (no download link rendered)');

for (const w of warnings) console.warn(`validate-cv: warning: ${w}`);
if (errors.length) { for (const e of errors) console.error(`validate-cv: error: ${e}`); process.exit(1); }
console.log(`validate-cv: ok (${warnings.length} warning${warnings.length === 1 ? '' : 's'})`);
