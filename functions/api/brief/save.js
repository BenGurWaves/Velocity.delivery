/**
 * POST /api/brief/save
 * Saves the client's project brief to KV before checkout.
 * Body: { business_name, business_desc, current_url, style, brand_colors, inspiration, pages, features, notes, plan }
 */
import { json, err, corsPreflightResponse, getSession, getKV } from '../../_lib/helpers.js';

export async function onRequestPost(context) {
  const kv = getKV(context.env);
  if (!kv) return err('Storage not configured', 500);

  const session = await getSession(kv, context.request);
  if (!session) return err('Not authenticated', 401);

  let body;
  try { body = await context.request.json(); } catch { return err('Invalid JSON'); }

  const brief = {
    business_name: (body.business_name || '').trim(),
    business_desc: (body.business_desc || '').trim(),
    current_url: (body.current_url || '').trim(),
    style: (body.style || '').trim(),
    brand_colors: (body.brand_colors || '').trim(),
    inspiration: (body.inspiration || '').trim(),
    pages: (body.pages || '').trim(),
    features: (body.features || '').trim(),
    notes: (body.notes || '').trim(),
    plan: (body.plan || 'full').trim(),
    email: session.email,
    created_at: new Date().toISOString(),
  };

  await kv.put('brief:' + session.email, JSON.stringify(brief), { expirationTtl: 86400 * 90 });

  return json({ success: true });
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}
