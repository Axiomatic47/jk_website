# Commit message for the next signed push — building live

<!-- AUTO-BUILT from agents' integrate entries (one paragraph appended per
     work arc, at commit time: `python3 tools/integrate_note.py "<text>"`).
     Everything below this comment is the message the signed-push card
     serves VERBATIM — edit it here or in the card, both are the same
     text. Paragraphs retire automatically once their work reaches main —
     the entry's commit integrated, or the paragraph's own words already
     signed into a main commit; your own unsigned edits are never
     auto-deleted. -->

kirchner.cv becomes a professional site rather than a text page: a two-column About with portrait card, general-information panel and the CV shown in a PDF.js document viewer ported from lawsofexistence.com and re-skinned in navy and brass; a Work section presenting six published Codified Democratic Order pieces in the same viewer with a card index and per-piece reader pages; a Contact page. The CV PDF is generated at build from cv.json so the viewer and the data cannot drift, and the validator now covers the works list. Gates green; the offscreen render tool cannot paint pdf.js pages (no requestAnimationFrame), proven with a control page.
