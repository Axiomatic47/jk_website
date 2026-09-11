#!/usr/bin/env python3
"""build-resume-docx.py — the owner's resume and references sheet as Word files.

Every public fact comes from the site's single content source, content/cv.json,
so the document, the site, and the site's PDF say the same thing. The phone,
the display name, and the references come from a PRIVATE file kept OUTSIDE
the repository (default ~/.config/kirchner-cv/private.json) and are never
written anywhere but the two .docx outputs, which *.docx in .gitignore keeps
out of git. Word is the renderer: this script never opens Word and never
produces a PDF (the site's PDF is scripts/build-cv-pdf.mjs at build time).

Usage
  python3 scripts/build-resume-docx.py                 # content/cv.json → repo root
  python3 scripts/build-resume-docx.py --content other.json --out-dir /some/dir
  python3 scripts/build-resume-docx.py --private ~/.config/kirchner-cv/private.json

Requires python-docx (pip install python-docx); Homebrew's python3 has it.

private.json shape
  {"display_name": "...", "phone": "...", "location": "...", "website": "...",
   "references": [{"name", "organization", "phone", "phone_kind"}, ...]}
Every key is optional; a missing key leaves that line out.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from docx import Document
    from docx.enum.style import WD_STYLE_TYPE
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
    from docx.opc.constants import RELATIONSHIP_TYPE as RT
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.shared import Inches, Pt, RGBColor
except ImportError:  # pragma: no cover
    sys.exit("build-resume-docx: python-docx is not installed (pip install python-docx)")

REPO = Path(__file__).resolve().parent.parent
DEFAULT_CONTENT = REPO / "content" / "cv.json"
DEFAULT_PRIVATE = Path.home() / ".config" / "kirchner-cv" / "private.json"

# Palette and type: the site's "navy & brass" (tailwind.config.ts) in the two
# families every Word install has — Georgia for the voice, Calibri for the
# labels. Design constants, not content: nothing below is a fact about the owner.
INK, MUTED, RULE, ACCENT = "1B2540", "5F6673", "D8D2C4", "8A6B3A"
SERIF, SANS = "Georgia", "Calibri"
PAGE_W, PAGE_H = 8.5, 11.0
MARGIN_X, MARGIN_TOP, MARGIN_BOTTOM = 0.85, 0.7, 0.7
TEXT_W = PAGE_W - 2 * MARGIN_X
SKILL_LABEL_W = 1.55


# ---------------------------------------------------------------- helpers ---
def _rgb(hex6: str) -> RGBColor:
    return RGBColor.from_string(hex6)


def _set_font(font, name: str) -> None:
    """Name every script slot and drop theme attributes so Word cannot swap
    the face for the document theme's."""
    font.name = name
    rPr = font._element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    for attr in ("asciiTheme", "hAnsiTheme", "eastAsiaTheme", "cstheme"):
        rFonts.attrib.pop(qn(f"w:{attr}"), None)
    for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
        rFonts.set(qn(f"w:{attr}"), name)


# Word reads pPr/rPr children in schema order and reports a file that breaks
# it as unreadable; every raw element goes in before its successors.
_RPR_AFTER_SPACING = ("w:w", "w:kern", "w:position", "w:sz", "w:szCs", "w:highlight", "w:u",
                      "w:effect", "w:bdr", "w:shd", "w:fitText", "w:vertAlign", "w:rtl", "w:cs",
                      "w:em", "w:lang", "w:eastAsianLayout", "w:specVanish", "w:oMath")
_RPR_AFTER_LANG = ("w:eastAsianLayout", "w:specVanish", "w:oMath")
_PPR_AFTER_PBDR = ("w:shd", "w:tabs", "w:suppressAutoHyphens", "w:kinsoku", "w:wordWrap",
                   "w:overflowPunct", "w:topLinePunct", "w:autoSpaceDE", "w:autoSpaceDN", "w:bidi",
                   "w:adjustRightInd", "w:snapToGrid", "w:spacing", "w:ind", "w:contextualSpacing",
                   "w:mirrorIndents", "w:suppressOverlap", "w:jc", "w:textDirection",
                   "w:textAlignment", "w:textboxTightWrap", "w:outlineLvl", "w:divId", "w:cnfStyle",
                   "w:rPr", "w:sectPr", "w:pPrChange")


def _letter_spacing(style, twentieths: int) -> None:
    rPr = style.element.get_or_add_rPr()
    sp = OxmlElement("w:spacing")
    sp.set(qn("w:val"), str(twentieths))
    rPr.insert_element_before(sp, *_RPR_AFTER_SPACING)


def _bottom_rule(style, color: str, eighths: int = 6) -> None:
    pPr = style.element.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(eighths))
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    pBdr.append(bottom)
    pPr.insert_element_before(pBdr, *_PPR_AFTER_PBDR)


def _native_word(doc) -> None:
    """Declare Word 2013+ layout so the file opens without the Compatibility
    Mode banner (python-docx's template predates it)."""
    settings = doc.settings.element
    compat = settings.find(qn("w:compat"))
    if compat is None:
        compat = OxmlElement("w:compat")
        settings.append(compat)
    for cs in compat.findall(qn("w:compatSetting")):
        if cs.get(qn("w:name")) == "compatibilityMode":
            compat.remove(cs)
    cs = OxmlElement("w:compatSetting")
    cs.set(qn("w:name"), "compatibilityMode")
    cs.set(qn("w:uri"), "http://schemas.microsoft.com/office/word")
    cs.set(qn("w:val"), "15")
    compat.append(cs)


def _add_page_field(paragraph) -> None:
    fld = OxmlElement("w:fldSimple")
    fld.set(qn("w:instr"), " PAGE ")
    r = OxmlElement("w:r")
    t = OxmlElement("w:t")
    t.text = "1"
    r.append(t)
    fld.append(r)
    paragraph._p.append(fld)


def _add_hyperlink(paragraph, url: str, text: str, *, size: float, color: str, font: str):
    """A real external hyperlink (Word: ctrl-click), coloured, not underlined."""
    r_id = paragraph.part.relate_to(url, RT.HYPERLINK, is_external=True)
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), r_id)
    r = OxmlElement("w:r")
    rPr = OxmlElement("w:rPr")
    rFonts = OxmlElement("w:rFonts")
    for attr in ("ascii", "hAnsi", "eastAsia", "cs"):
        rFonts.set(qn(f"w:{attr}"), font)
    rPr.append(rFonts)
    c = OxmlElement("w:color")
    c.set(qn("w:val"), color)
    rPr.append(c)
    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), str(int(round(size * 2))))
    rPr.append(sz)
    r.append(rPr)
    t = OxmlElement("w:t")
    t.text = text
    t.set(qn("xml:space"), "preserve")
    r.append(t)
    link.append(r)
    paragraph._p.append(link)


def date_range(e: dict) -> str:
    start, end = (e.get("start") or "").strip(), (e.get("end") or "").strip()
    if not end:
        return f"{start} – Present"
    if end == start:
        return start
    return f"{start} – {end}"


def _cap_present(year: str) -> str:
    """cv.json writes '2016 – present' (the site's lower case); the page says Present."""
    return (year or "").replace(" – present", " – Present")


def _short_url(url: str) -> str:
    return url.replace("https://", "").replace("http://", "").rstrip("/")


# ----------------------------------------------------------------- styles ---
def _para_style(doc, name: str, *, base: str = "Normal", font: str, size: float,
                color: str = INK, bold: bool = False, italic: bool = False,
                before: float = 0, after: float = 0, keep_next: bool = False,
                all_caps: bool = False):
    st = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    st.base_style = doc.styles[base]
    st.quick_style = True
    st.hidden = False
    _set_font(st.font, font)
    st.font.size = Pt(size)
    st.font.color.rgb = _rgb(color)
    if bold:
        st.font.bold = True
    if italic:
        st.font.italic = True
    if all_caps:
        st.font.all_caps = True
    pf = st.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = 1.0
    pf.keep_with_next = keep_next
    return st


def _char_style(doc, name: str, *, font: str, size: float, color: str = INK,
                bold: bool = False, italic: bool = False):
    st = doc.styles.add_style(name, WD_STYLE_TYPE.CHARACTER)
    st.quick_style = True
    _set_font(st.font, font)
    st.font.size = Pt(size)
    st.font.color.rgb = _rgb(color)
    # explicit on both counts: a character style must be able to turn the
    # paragraph style's bold OFF (the dates beside a bold role line)
    st.font.bold = bold
    st.font.italic = italic
    return st


def _define_styles(doc) -> None:
    normal = doc.styles["Normal"]
    _set_font(normal.font, SANS)
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = _rgb(INK)
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.line_spacing = 1.0
    rPr = normal.element.get_or_add_rPr()
    lang = OxmlElement("w:lang")
    lang.set(qn("w:val"), "en-US")
    rPr.insert_element_before(lang, *_RPR_AFTER_LANG)

    _para_style(doc, "CV Name", font=SERIF, size=24, bold=True, after=2)
    _para_style(doc, "CV Headline", font=SANS, size=11, color=MUTED, after=3)
    _para_style(doc, "CV Contact", font=SANS, size=9.5, color=ACCENT, after=0)
    sec = _para_style(doc, "CV Section", font=SANS, size=8.5, color=MUTED, bold=True,
                      before=13, after=6, keep_next=True, all_caps=True)
    _letter_spacing(sec, 28)
    _bottom_rule(sec, RULE)
    _para_style(doc, "CV Body", font=SERIF, size=10.5, after=4)
    role = _para_style(doc, "CV Role", font=SERIF, size=11.5, bold=True, before=7, after=0,
                       keep_next=True)
    role.paragraph_format.tab_stops.add_tab_stop(Inches(TEXT_W), WD_TAB_ALIGNMENT.RIGHT)
    _para_style(doc, "CV Org", font=SANS, size=9.5, color=MUTED, after=2, keep_next=True)
    _para_style(doc, "CV Entry Summary", font=SERIF, size=10.5, after=2, keep_next=True)
    bullet = _para_style(doc, "CV Bullet", base="List Bullet", font=SERIF, size=10.5, after=1)
    bullet.paragraph_format.left_indent = Inches(0.22)
    bullet.paragraph_format.first_line_indent = Inches(-0.14)
    skill = _para_style(doc, "CV Skill", font=SERIF, size=10.5, after=3)
    skill.paragraph_format.left_indent = Inches(SKILL_LABEL_W)
    skill.paragraph_format.first_line_indent = Inches(-SKILL_LABEL_W)
    skill.paragraph_format.tab_stops.add_tab_stop(Inches(SKILL_LABEL_W), WD_TAB_ALIGNMENT.LEFT)
    _para_style(doc, "CV Footer", font=SANS, size=8.5, color=MUTED)

    _char_style(doc, "CV Dates", font=SANS, size=9.5, color=MUTED)
    _char_style(doc, "CV Skill Label", font=SANS, size=9.5, color=MUTED)


# ------------------------------------------------------------------- page ---
def _page(doc, name: str) -> None:
    s = doc.sections[0]
    s.page_width, s.page_height = Inches(PAGE_W), Inches(PAGE_H)
    s.left_margin = s.right_margin = Inches(MARGIN_X)
    s.top_margin, s.bottom_margin = Inches(MARGIN_TOP), Inches(MARGIN_BOTTOM)
    s.header_distance = s.footer_distance = Inches(0.4)
    # The running footer appears from page two on; page one stays clean.
    s.different_first_page_header_footer = True
    s.first_page_footer.paragraphs[0].text = ""
    fp = s.footer.paragraphs[0]
    fp.style = doc.styles["CV Footer"]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fp.add_run(f"{name} · Page ")
    _add_page_field(fp)


def _properties(doc, cv: dict, title: str) -> None:
    cp = doc.core_properties
    cp.title = title
    cp.author = cv["name"]
    cp.last_modified_by = cv["name"]
    cp.subject = cv.get("headline", "")
    cp.keywords = ", ".join(i for g in cv.get("skills", []) for i in g.get("items", []))
    cp.comments = ""
    cp.category = ""
    cp.revision = 1
    now = datetime.now(timezone.utc).replace(microsecond=0)
    cp.created = cp.modified = now


# ----------------------------------------------------------------- blocks ---
def _header(doc, cv: dict, priv: dict) -> None:
    p = doc.add_paragraph(priv.get("display_name") or cv["name"], style="CV Name")
    p.paragraph_format.space_before = Pt(0)
    if cv.get("headline"):
        doc.add_paragraph(cv["headline"], style="CV Headline")
    c = doc.add_paragraph(style="CV Contact")
    parts: list[tuple[str, str | None]] = []
    loc = priv.get("location") or cv.get("location")
    if loc:
        parts.append((loc, None))
    if priv.get("phone"):
        parts.append((priv["phone"], None))
    if cv.get("email"):
        parts.append((cv["email"], f"mailto:{cv['email']}"))
    if priv.get("website"):
        parts.append((priv["website"], f"https://{priv['website']}/"))
    for link in cv.get("links", []):
        parts.append((_short_url(link["url"]), link["url"]))
    for i, (text, url) in enumerate(parts):
        if i:
            c.add_run("   ·   ")
        if url:
            _add_hyperlink(c, url, text, size=9.5, color=ACCENT, font=SANS)
        else:
            c.add_run(text)


def _section(doc, title: str) -> None:
    doc.add_paragraph(title, style="CV Section")


def _entry_head(doc, title: str, right: str, sub: str, *, italic: bool = False) -> None:
    p = doc.add_paragraph(style="CV Role")
    r = p.add_run(title)
    r.italic = italic
    if right:
        p.add_run().add_tab()
        p.add_run(right, style="CV Dates")
    if sub:
        doc.add_paragraph(sub, style="CV Org")


def _experience(doc, cv: dict) -> None:
    if not cv.get("experience"):
        return
    _section(doc, "Experience")
    for e in cv["experience"]:
        sub = " · ".join(x for x in (e.get("organization"), e.get("location")) if x)
        _entry_head(doc, e["role"], date_range(e), sub)
        if e.get("summary"):
            doc.add_paragraph(e["summary"], style="CV Entry Summary")
        highlights = e.get("highlights") or []
        for i, h in enumerate(highlights):
            b = doc.add_paragraph(h, style="CV Bullet")
            # direct indents: a list level's own indent outranks the style's
            b.paragraph_format.left_indent = Inches(0.22)
            b.paragraph_format.first_line_indent = Inches(-0.14)
            last = i == len(highlights) - 1
            # an entry moves between pages as one block, never leaving a bullet behind
            b.paragraph_format.keep_with_next = not last
            if last:
                b.paragraph_format.space_after = Pt(3)


def _education(doc, cv: dict) -> None:
    if not cv.get("education"):
        return
    _section(doc, "Education")
    for e in cv["education"]:
        title = e.get("degree") or e["institution"]
        sub_parts = [e["institution"] if e.get("degree") else None, e.get("location")]
        _entry_head(doc, title, _cap_present(e.get("year", "")), " · ".join(x for x in sub_parts if x))
        if e.get("detail"):
            doc.add_paragraph(e["detail"], style="CV Entry Summary")


def _works(doc, cv: dict) -> None:
    if not cv.get("works"):
        return
    _section(doc, "Selected Work")
    for w in cv["works"]:
        _entry_head(doc, w["title"], w.get("year", ""), "", italic=True)
        line = [x for x in (w.get("venue"),) if x]
        if line or w.get("url"):
            p = doc.add_paragraph(style="CV Org")
            if line:
                p.add_run(" · ".join(line))
            if w.get("url"):
                if line:
                    p.add_run(" · ")
                _add_hyperlink(p, w["url"], _short_url(w["url"]), size=9.5, color=ACCENT, font=SANS)


def _skills(doc, cv: dict) -> None:
    if not cv.get("skills"):
        return
    _section(doc, "Skills")
    for g in cv["skills"]:
        p = doc.add_paragraph(style="CV Skill")
        p.add_run(g["group"], style="CV Skill Label")
        p.add_run().add_tab()
        p.add_run(" · ".join(g["items"]))


def _references(doc, refs: list[dict]) -> None:
    _section(doc, "References")
    for r in refs:
        sub = r.get("organization", "")
        right = " ".join(x for x in (r.get("phone_kind"), r.get("phone")) if x)
        _entry_head(doc, r["name"], right, sub)


# ---------------------------------------------------------------- outputs ---
def build_resume(cv: dict, priv: dict) -> "Document":
    doc = Document()
    _define_styles(doc)
    _page(doc, cv["name"])
    _properties(doc, cv, f"{cv['name']} Resume")
    _native_word(doc)
    _header(doc, cv, priv)
    if cv.get("summary"):
        _section(doc, "Summary")
        doc.add_paragraph(cv["summary"], style="CV Body")
    _skills(doc, cv)          # keywords first: the reader and the parser both scan the top
    _experience(doc, cv)
    _education(doc, cv)
    _works(doc, cv)
    return doc


def build_references(cv: dict, priv: dict) -> "Document | None":
    refs = priv.get("references") or []
    if not refs:
        return None
    doc = Document()
    _define_styles(doc)
    _page(doc, cv["name"])
    _properties(doc, cv, f"{cv['name']} References")
    _native_word(doc)
    _header(doc, cv, priv)
    _references(doc, refs)
    return doc


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--content", type=Path, default=DEFAULT_CONTENT)
    ap.add_argument("--private", type=Path, default=DEFAULT_PRIVATE)
    ap.add_argument("--out-dir", type=Path, default=REPO)
    a = ap.parse_args(argv)

    cv = json.loads(a.content.read_text(encoding="utf-8"))
    priv: dict = {}
    if a.private.exists():
        priv = json.loads(a.private.read_text(encoding="utf-8"))
    else:
        print(f"build-resume-docx: no private file at {a.private}; "
              "building without phone or references", file=sys.stderr)
    a.out_dir.mkdir(parents=True, exist_ok=True)
    stem = cv["name"].replace(" ", "_")

    out = a.out_dir / f"{stem}_Resume.docx"
    build_resume(cv, priv).save(str(out))
    print(f"build-resume-docx: wrote {out}")
    refs = build_references(cv, priv)
    if refs is not None:
        out2 = a.out_dir / f"{stem}_References.docx"
        refs.save(str(out2))
        print(f"build-resume-docx: wrote {out2}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
