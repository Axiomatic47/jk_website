# kirchner.cv

Joseph Kirchner's CV and professional site. Static Next.js export deployed by
Netlify from `main`.

- Content: edit `content/cv.json` (the only content file). Empty sections are
  not rendered; the build refuses placeholder text.
- PDF: drop the CV PDF under `public/` and set `"pdf": "/Joseph_Kirchner_CV.pdf"`
  in cv.json to render the download link. The page also prints cleanly
  (File → Print → Save as PDF).
- Develop: `npm install`, `npm run dev`. Gates: `npm run build`, `npm run lint`.
- Realm rules: `CLAUDE.md`.
