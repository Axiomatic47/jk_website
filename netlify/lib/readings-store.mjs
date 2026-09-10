// netlify/lib/readings-store.mjs — the private queue behind Open Readings.
//
// One key-value store, three prefixes:
//   pending/<id>     a reader's submission as received (INCLUDES contact — private, like the dashboard)
//   approved/<id>    the published entry in the standard format (NO contact) — folded into
//                    content/readings/<collection>.answers.json by scripts/pull-reading-answers.mjs
//                    at the next build of main
//   decided/<id>     {decision, date, item_id} — what the owner decided and when
//   author-only/<id> the full record of an answer the owner may read but must not publish
//
// On Netlify this is Netlify Blobs (auto-configured in functions; at build time it
// reads NETLIFY_BLOBS_CONTEXT or falls back to SITE_ID + NETLIFY_AUTH_TOKEN). Off
// Netlify it is a directory of JSON files under .cache/readings-store/, so the
// functions and the build step can be exercised locally without an account.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const STORE_NAME = 'open-readings';
const LOCAL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.cache', 'readings-store');

// Where are we? A Netlify FUNCTION (Lambda) must use Blobs — the runtime
// configures it; if that fails the error must surface in the function log, not
// vanish into a read-only local directory. A Netlify BUILD uses Blobs when the
// runtime context or SITE_ID + NETLIFY_AUTH_TOKEN is present, and otherwise
// warns and reads an empty local store so the build still succeeds.
const inFunction = () => Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext);
const inBuild = () => process.env.NETLIFY === 'true' && !inFunction();

async function blobStore() {
  const { getStore } = await import('@netlify/blobs');
  if (process.env.NETLIFY_BLOBS_CONTEXT || globalThis.netlifyBlobsContext) return getStore(STORE_NAME);
  if (process.env.SITE_ID && process.env.NETLIFY_AUTH_TOKEN) return getStore({ name: STORE_NAME, siteID: process.env.SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN });
  return getStore(STORE_NAME); // throws a descriptive error when the environment is not configured
}

/** returns { get(key), set(key, obj), del(key), list(prefix) → keys[] } */
export async function openStore() {
  if (inFunction() || inBuild()) {
    let s;
    try { s = await blobStore(); }
    catch (e) {
      if (inFunction()) throw e;
      console.warn(`readings-store: Netlify Blobs unavailable in this build (${e.message}); using an empty local store.`);
      s = null;
    }
    if (s) return {
      kind: 'blobs',
      async get(key) { return (await s.get(key, { type: 'json' })) ?? null; },
      async set(key, obj) { await s.setJSON(key, obj); },
      async del(key) { await s.delete(key); },
      async list(prefix) { const { blobs } = await s.list({ prefix }); return blobs.map(b => b.key); },
    };
  }
  const file = key => join(LOCAL_DIR, key.replace(/\//g, '__') + '.json');
  return {
    kind: `local:${LOCAL_DIR}`,
    async get(key) { return existsSync(file(key)) ? JSON.parse(readFileSync(file(key), 'utf8')) : null; },
    async set(key, obj) { mkdirSync(LOCAL_DIR, { recursive: true }); writeFileSync(file(key), JSON.stringify(obj, null, 2) + '\n'); },
    async del(key) { rmSync(file(key), { force: true }); },
    async list(prefix) {
      if (!existsSync(LOCAL_DIR)) return [];
      const p = prefix.replace(/\//g, '__');
      return readdirSync(LOCAL_DIR).filter(f => f.startsWith(p) && f.endsWith('.json')).map(f => f.slice(0, -5).replace(/__/g, '/')).sort();
    },
  };
}
