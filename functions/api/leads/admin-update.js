/**
 * PATCH /api/leads/admin-update — Admin only. Set quote_amount and/or status.
 */
import { getSupabase, isAdmin, jsonRes, errRes, optionsRes } from '../../_lib/supabase.js';

const VALID_STATUSES = ['pending','accepted','in_progress','declined','completed'];

export async function onRequestOptions() { return optionsRes(); }

export async function onRequestPatch(context) {
  if (!isAdmin(context.request, context.env)) return errRes('Unauthorized', 401);
  const sb = getSupabase(context.env);
  if (!sb) return errRes('Supabase not configured', 500);

  let body;
  try { body = await context.request.json(); } catch { return errRes('Invalid JSON'); }

  const { token, quote_amount, status } = body;
  if (!token) return errRes('token required');

  const patch = {};
  if (quote_amount !== undefined) {
    const amt = parseInt(quote_amount, 10);
    if (isNaN(amt) || amt < 0) return errRes('Invalid quote_amount');
    patch.quote_amount = amt;
  }
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) return errRes('Invalid status');
    patch.status = status;
  }
  if (!Object.keys(patch).length) return errRes('Nothing to update');

  const updated = await sb.update('velocity_leads', `token=eq.${token}`, patch);
  return jsonRes({ success: true, lead: Array.isArray(updated) ? updated[0] : updated });
}
