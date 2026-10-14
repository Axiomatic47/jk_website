import { UnderConstruction } from './_components/UnderConstruction';

// The home route in construction mode (site-mode.json; next.config.ts routes only the
// *.construction.* files): the construction page. app/page.tsx is the live site's home.
export default function Home() {
  return <UnderConstruction />;
}
