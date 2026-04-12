/**
 * GET  /api/leads/:token  — Fetch lead by token (public, token-gated)
 * PATCH /api/leads/:token — Client submits/saves form data (respects 24h lock)
 */
import { getSupabase, jsonRes, errRes, optionsRes } from '../../_lib/supabase.js';

export async function onRequestOptions() { return optionsRes(); }

export async function onRequestGet(context) {
  const sb = getSupabase(context.env);
  if (!sb) return errRes('Supabase not configured', 500);
  const token = context.params.token;
  if (!token) return errRes('Token required', 400);

  const rows = await sb.select('velocity_leads',
    `token=eq.${token}&select=id,token,status,full_data,submitted_at,is_locked,quote_amount,is_paid,upgrade_permission,due_date,client_name,client_email,created_at`);
  if (!rows.length) return errRes('Not found', 404);

  const lead = rows[0];
  if (!lead.is_locked && lead.submitted_at) {
    if (Date.now() - new Date(lead.submitted_at).getTime() > 86400000) lead.is_locked = true;
  }
  return jsonRes(lead);
}

export async function onRequestPatch(context) {
  const sb = getSupabase(context.env);
  if (!sb) return errRes('Supabase not configured', 500);
  const token = context.params.token;
  if (!token) return errRes('Token required', 400);

  const rows = await sb.select('velocity_leads', `token=eq.${token}&select=id,submitted_at,is_locked`);
  if (!rows.length) return errRes('Not found', 404);
  const lead = rows[0];

  if (lead.is_locked) return errRes('Submission is locked', 403);
  if (lead.submitted_at && Date.now() - new Date(lead.submitted_at).getTime() > 86400000) {
    await sb.update('velocity_leads', `token=eq.${token}`, { is_locked: true });
    return errRes('Submission window has closed', 403);
  }

  let body;
  try { body = await context.request.json(); } catch { return errRes('Invalid JSON'); }

  const allowed = ['full_data', 'submitted_at', 'due_date', 'client_name', 'client_email', 'upgrade_permission'];
  const patch = {};
  for (const key of allowed) { if (body[key] !== undefined) patch[key] = body[key]; }

  if (patch.due_date && new Date(patch.due_date) < new Date(Date.now() + 48 * 3600000 - 60000))
    return errRes('Due date must be at least 48 hours from now');

  if (!Object.keys(patch).length) return errRes('No valid fields to update');

  const updated = await sb.update('velocity_leads', `token=eq.${token}`, patch);
  return jsonRes({ success: true, lead: Array.isArray(updated) ? updated[0] : updated });
}
