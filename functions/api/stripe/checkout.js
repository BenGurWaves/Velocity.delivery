/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session with Cash App, Apple Pay, Google Pay support.
 * Body: { plan: "landing"|"full"|"premium", email: string }
 */
import { json, err, corsPreflightResponse, getKV } from '../../_lib/helpers.js';

const PLANS = {
  landing: {
    name: 'Landing Page — Custom single-page website',
    amount: 25000, // $250
  },
  full: {
    name: 'Full Website — Up to 5 pages, blog-ready',
    amount: 50000, // $500
  },
  premium: {
    name: 'Premium — Up to 10 pages, priority build',
    amount: 100000, // $1,000
  },
};

export async function onRequestPost(context) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return err('Stripe not configured.', 500);

  let body;
  try { body = await context.request.json(); } catch { return err('Invalid JSON'); }

  const planKey = (body.plan || '').toLowerCase();
  const email = (body.email || '').trim().toLowerCase();
  if (!planKey || !PLANS[planKey]) return err('Invalid plan. Choose landing, full, or premium.');
  if (!email) return err('Email is required');

  const plan = PLANS[planKey];
  const origin = new URL(context.request.url).origin;

  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('customer_email', email);
  params.append('success_url', origin + '/dashboard.html?payment=success&plan=' + planKey);
  params.append('cancel_url', origin + '/dashboard.html?payment=cancelled');
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][product_data][name]', plan.name);
  params.append('line_items[0][price_data][unit_amount]', String(plan.amount));
  params.append('line_items[0][quantity]', '1');
  params.append('metadata[plan]', planKey);
  params.append('metadata[email]', email);
  params.append('payment_intent_data[metadata][plan]', planKey);
  params.append('payment_intent_data[metadata][email]', email);
  // Enable Cash App Pay, cards, Apple Pay, Google Pay
  params.append('payment_method_types[0]', 'card');
  params.append('payment_method_types[1]', 'cashapp');

  try {
    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(stripeKey + ':'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const session = await resp.json();

    if (session.error) {
      return err('Stripe error: ' + (session.error.message || 'Unknown'), 500);
    }

    const kv = getKV(context.env);
    if (kv) {
      try {
        await kv.put('checkout:' + session.id, JSON.stringify({
          email, plan: planKey, amount: plan.amount,
          created_at: new Date().toISOString(),
        }), { expirationTtl: 86400 * 7 });
      } catch { /* non-critical */ }
    }

    return json({ url: session.url, session_id: session.id });
  } catch (e) {
    return err('Failed to create checkout: ' + e.message, 500);
  }
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}
