import { UnderConstruction } from './_components/UnderConstruction';

// Every other address in construction mode: the same page, served by Netlify as the 404 page
// (out/404.html) — a bookmarked /work or /resume/… lands here with a 404 status, not on nothing.
// No metadata of its own: the construction layout's noindex, nofollow is the one robots tag.

export default function NotFound() {
  return <UnderConstruction />;
}
