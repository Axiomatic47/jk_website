# kirchner.cv

Joseph Kirchner's CV and professional site. Static Next.js export deployed by
Netlify from `main`.

- Content: edit `content/cv.json` (the only content file). Empty sections are
  not rendered; the build refuses placeholder text.
- PDF: drop the CV PDF under `public/` and set `"pdf": "/Joseph_Kirchner_CV.pdf"`
  in cv.json to render the download link. The page also prints cleanly
  (File → Print → Save as PDF).
- Develop: `npm install`, `npm run dev`. Gates: `npm run build`, `npm run lint`.
- Resume (Word): `npm run build:resume` renders cv.json plus a private contact
  file outside the repo (`~/.config/kirchner-cv/private.json`) to
  `Joseph_Kirchner_Resume.docx` and `Joseph_Kirchner_References.docx` in the
  repo root (gitignored). Needs python3 with python-docx. Word is the renderer.
- Realm rules: `CLAUDE.md`.
