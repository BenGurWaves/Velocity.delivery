/**
 * POST /api/leads/create — Admin only.
 */
import { getSupabase } from '../../_lib/supabase.js';
import { checkAdminAuth, rateLimit, validateLength, secureJson, secureErr, secureOptions } from '../../_lib/security.js';

export async function onRequestOptions() { return secureOptions(); }

export async function onRequestPost(context) {


  const auth = await checkAdminAuth(context.request, context.env);
  if (auth.locked) return secureErr('Too many failed attempts. Try again in 15 minutes.', 429);
  if (!auth.ok)    return secureErr('Unauthorized', 401);

  const sb = getSupabase(context.env);
  if (!sb) return secureErr('Service unavailable', 503);

  let body;
  try { body = await context.request.json(); } catch { return secureErr('Invalid request'); }

  const client_email = validateLength('client_email', (body.client_email || '').toLowerCase()) || null;
  const client_name  = validateLength('client_name',  body.client_name  || '')                || null;

  // Generate a unique UUID token for this lead
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('');
  const token = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;

  try {
    const rows = await sb.insert('velocity_leads', { client_email, client_name, token, status: 'onboarding_sent' });
    const lead = Array.isArray(rows) && rows.length ? rows[0] : (rows || {});
    const base = context.env.SITE_URL || 'https://velocity.calyvent.com';
    return secureJson({ id: lead.id || null, token: token, onboard_url: `${base}/onboard/${token}` });
  } catch (err) {
    console.error('Create lead error:', err);
    return secureErr('Failed to create lead: ' + (err.message || String(err)), 400);
  }
}
