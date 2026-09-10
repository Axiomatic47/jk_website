// netlify/functions/submission-created.mjs — Netlify invokes a function with
// exactly this name for every verified (non-spam) form submission on the site.
//
// EVENT-TRIGGERED functions use the LEGACY handler signature: `handler(event)`
// with `event.body` a JSON string `{ payload: {...} }`. The modern
// `export default (Request) => Response` form is never invoked for events —
// with it, submissions reached the Forms dashboard and nothing else (both sites,
// 2026-09-09). Open-reading answers are queued as pending records in the private
// store; the owner decides on them at /admin/readings. Other forms are ignored.
import { openStore } from '../lib/readings-store.mjs';
import { FORM_NAME, toPending } from '../lib/readings-format.mjs';

export const handler = async (event) => {
  let body;
  try { body = JSON.parse(event?.body || '{}'); } catch { return { statusCode: 400, body: 'bad payload' }; }
  const s = body?.payload;
  if (!s || s.form_name !== FORM_NAME) return { statusCode: 200, body: 'ignored' };
  const store = await openStore();
  const rec = toPending(s);
  if (await store.get(`pending/${rec.id}`) || await store.get(`decided/${rec.id}`)) return { statusCode: 200, body: 'seen' };
  await store.set(`pending/${rec.id}`, rec);
  console.log(`submission-created: queued ${rec.id} → ${rec.collection}/${rec.item_id} (store=${store.kind})`);
  return { statusCode: 200, body: 'queued' };
};
