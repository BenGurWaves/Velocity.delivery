/**
 * POST /api/stripe/create-intent
 * Creates a Stripe PaymentIntent for inline Payment Elements.
 * Returns { client_secret } for frontend mounting.
 */
import { getSupabase, jsonRes, errRes, optionsRes } from '../../_lib/supabase.js';

export async function onRequestOptions() { return optionsRes(); }

export async function onRequestPost(context) {
  const sb = getSupabase(context.env);
  if (!sb) return errRes('Service unavailable', 503);
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return errRes('Service unavailable', 503);

  let body;
  try { body = await context.request.json(); } catch { return errRes('Invalid JSON'); }
  const { token } = body;
  if (!token) return errRes('token required');

  const rows = await sb.select('velocity_leads', `token=eq.${token}&select=id,quote_amount,is_paid,client_email,status,scope_accepted`);
  if (!rows.length) return errRes('Not found', 404);
  const lead = rows[0];

  if (lead.is_paid) return errRes('Already paid');
  if (!lead.quote_amount || lead.quote_amount <= 0) return errRes('No quote set yet');
  if (lead.status === 'declined') return errRes('Project declined');

  // Create PaymentIntent via Stripe API
  const params = new URLSearchParams({
    'amount': String(lead.quote_amount),
    'currency': 'usd',
    'automatic_payment_methods[enabled]': 'true',
    'description': 'Velocity — Website Design & Development',
    'metadata[lead_token]': token,
    'metadata[lead_id]': lead.id,
  });
  if (lead.client_email) {
    params.set('receipt_email', lead.client_email);
  }

  const r = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!r.ok) {
    const e = await r.json();
    return errRes(e.error?.message || 'Stripe error', 500);
  }

  const intent = await r.json();

  // Store the PaymentIntent ID on the lead
  await sb.update('velocity_leads', `token=eq.${token}`, {
    stripe_payment_intent_id: intent.id,
  });

  return jsonRes({
    client_secret: intent.client_secret,
  });
}
