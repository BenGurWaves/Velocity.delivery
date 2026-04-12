/**
 * POST /api/stripe/webhook — checkout.session.completed → mark lead paid.
 */
import { getSupabase, jsonRes, errRes } from '../../_lib/supabase.js';

export async function onRequestPost(context) {
  const sig     = context.request.headers.get('stripe-signature');
  const secret  = context.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await context.request.text();

  if (secret && sig) {
    const valid = await verifyStripeSignature(rawBody, sig, secret);
    if (!valid) return errRes('Invalid signature', 400);
  }

  let event;
  try { event = JSON.parse(rawBody); } catch { return errRes('Invalid JSON'); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const token = session.metadata?.lead_token;
    if (token) {
      const sb = getSupabase(context.env);
      if (sb) {
        await sb.update('velocity_leads', `token=eq.${token}`, {
          is_paid: true,
          stripe_payment_intent: session.payment_intent || null,
          status: 'accepted',
        });
      }
    }
  }
  return jsonRes({ received: true });
}

async function verifyStripeSignature(payload, header, secret) {
  try {
    const parts     = header.split(',');
    const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1];
    const sigHash   = parts.find(p => p.startsWith('v1=')).split('=')[1];
    const signed    = `${timestamp}.${payload}`;
    const enc       = new TextEncoder();
    const key       = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const buf       = await crypto.subtle.sign('HMAC', key, enc.encode(signed));
    const computed  = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    return computed === sigHash;
  } catch { return false; }
}
