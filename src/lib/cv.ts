// src/lib/cv.ts — typed loader for content/cv.json (the one content file).
import raw from '../../content/cv.json';

export interface Link { label: string; url: string }
export interface Experience {
  role: string;
  organization: string;
  location?: string;
  start: string;   // "2019" or "2019-03"
  end?: string;    // omit or "" for present
  summary?: string;
  highlights?: string[];
}
export interface Education {
  degree: string;
  institution: string;
  year?: string;
  detail?: string;
}
export interface SkillGroup { group: string; items: string[] }
export interface Work {
  title: string;
  year?: string;
  venue?: string;
  url?: string;
  note?: string;
}
export interface CV {
  name: string;
  headline: string;
  location: string;
  email: string;
  pdf: string;
  links: Link[];
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: SkillGroup[];
  works: Work[];
}

export const cv: CV = raw as unknown as CV;

export const SITE_ORIGIN = 'https://kirchner.cv';

export function dateRange(e: Experience): string {
  return e.end ? `${e.start} – ${e.end}` : `${e.start} – present`;
}
