#!/usr/bin/env node
// build-cv-pdf.mjs — render content/cv.json to public/cv/Joseph_Kirchner_CV.pdf.
// Runs as part of `npm run build` so the PDF in the viewer and the data on the
// site can never drift. Standard PDF fonts (Times/Helvetica) — no downloads.
import { readFileSync, mkdirSync, createWriteStream } from 'node:fs';
import PDFDocument from 'pdfkit';

const cv = JSON.parse(readFileSync(new URL('../content/cv.json', import.meta.url), 'utf8'));
const outDir = new URL('../public/cv/', import.meta.url);
mkdirSync(outDir, { recursive: true });
const outPath = new URL(cv.pdf.replace(/^\/cv\//, ''), outDir);

const INK = '#1b2540', MUTED = '#5f6673', RULE = '#d8d2c4', ACCENT = '#8a6b3a';
const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 60, bottom: 60, left: 64, right: 64 },
  info: { Title: cv.name, Author: cv.name, Subject: cv.headline || '' },
});
doc.pipe(createWriteStream(outPath));
const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;
const L = doc.page.margins.left;

const range = (e) => (!e.end ? `${e.start} – present` : e.end === e.start ? e.start : `${e.start} – ${e.end}`);
const section = (title) => {
  if (doc.y > doc.page.height - 160) doc.addPage();
  doc.moveDown(1.2);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(title.toUpperCase(), { characterSpacing: 1.4 });
  doc.moveTo(L, doc.y + 4).lineTo(L + W, doc.y + 4).lineWidth(0.6).strokeColor(RULE).stroke();
  doc.moveDown(0.9);
};
const row = (left, render) => {
  const y = doc.y;
  doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(left, L, y, { width: 96 });
  doc.y = y;
  render(L + 108, W - 108);
  doc.moveDown(0.7);
};

// Header
doc.font('Times-Bold').fontSize(26).fillColor(INK).text(cv.name);
if (cv.headline) doc.font('Helvetica').fontSize(11).fillColor(MUTED).text(cv.headline);
const contact = [cv.location, cv.email, ...cv.links.map((l) => l.url.replace(/^https?:\/\//, ''))].filter(Boolean);
doc.moveDown(0.4).font('Helvetica').fontSize(9).fillColor(ACCENT).text(contact.join('   ·   '));

if (cv.summary) { section('Summary'); doc.font('Times-Roman').fontSize(10.5).fillColor(INK).text(cv.summary, { lineGap: 2 }); }

if (cv.experience.length) {
  section('Experience');
  for (const e of cv.experience) {
    if (doc.y > doc.page.height - 140) doc.addPage();
    row(range(e), (x, w) => {
      doc.font('Times-Bold').fontSize(12).fillColor(INK).text(e.role, x, doc.y, { width: w });
      doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).text(`${e.organization}${e.location ? ` · ${e.location}` : ''}`, x, doc.y, { width: w });
      if (e.summary) doc.moveDown(0.3).font('Times-Roman').fontSize(10).fillColor(INK).text(e.summary, x, doc.y, { width: w });
      for (const h of e.highlights ?? []) doc.font('Times-Roman').fontSize(10).fillColor(INK).text(`•  ${h}`, x + 4, doc.y, { width: w - 4, lineGap: 1 });
    });
  }
}
if (cv.education.length) {
  section('Education');
  for (const e of cv.education) row(e.year ?? '', (x, w) => {
    doc.font('Times-Bold').fontSize(12).fillColor(INK).text(e.degree || e.institution, x, doc.y, { width: w });
    const sub = [e.degree ? e.institution : null, e.location].filter(Boolean).join(' · ');
    if (sub) doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).text(sub, x, doc.y, { width: w });
    if (e.detail) doc.font('Times-Roman').fontSize(10).fillColor(INK).text(e.detail, x, doc.y, { width: w });
  });
}
if (cv.works.length) {
  section('Selected Work');
  for (const w0 of cv.works) row(w0.year ?? '', (x, w) => {
    doc.font('Times-Bold').fontSize(11).fillColor(INK).text(w0.title, x, doc.y, { width: w, link: w0.url || undefined });
    if (w0.venue) doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(w0.venue, x, doc.y, { width: w });
  });
}
if (cv.skills.length) {
  section('Skills');
  for (const g of cv.skills) row(g.group, (x, w) => doc.font('Times-Roman').fontSize(10).fillColor(INK).text(g.items.join(' · '), x, doc.y, { width: w }));
}
doc.end();
console.log(`build-cv-pdf: wrote ${decodeURIComponent(outPath.pathname)}`);
