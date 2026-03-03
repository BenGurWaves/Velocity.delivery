/**
 * GET /api/lead-data?email=...
 * Returns previously saved redesign request data for this email.
 * Used by the dashboard to auto-fill the questionnaire.
 */
import { json, err, corsPreflightResponse, getKV } from '../_lib/helpers.js';

export async function onRequestGet(context) {
  const kv = getKV(context.env);
  if (!kv) return json({ data: null });

  const url = new URL(context.request.url);
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();

  if (!email) return err('email parameter required');

  try {
    const data = await kv.get('redesign:' + email, { type: 'json' });
    return json({ data: data || null });
  } catch (_) {
    return json({ data: null });
  }
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}
