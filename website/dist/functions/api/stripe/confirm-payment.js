/**
 * POST /api/stripe/confirm-payment
 * Called after successful inline Stripe payment.
 * Records MSA acceptance, marks lead as paid, sends receipt email.
 */
import { getSupabase, jsonRes, errRes, optionsRes } from '../../_lib/supabase.js';

export async function onRequestOptions() { return optionsRes(); }

export async function onRequestPost(context) {
  const sb = getSupabase(context.env);
  if (!sb) return errRes('Service unavailable', 503);

  let body;
  try { body = await context.request.json(); } catch { return errRes('Invalid JSON'); }
  const { token, payment_intent_id } = body;
  if (!token) return errRes('token required');

  const rows = await sb.select('velocity_leads', `token=eq.${token}&select=id,is_paid,client_email,client_name,full_data,quote_amount,stripe_payment_intent_id`);
  if (!rows.length) return errRes('Not found', 404);
  const lead = rows[0];

  if (lead.is_paid) return errRes('Already paid');

  // Verify the PaymentIntent is actually succeeded via Stripe API
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (stripeKey && payment_intent_id) {
    const r = await fetch(`https://api.stripe.com/v1/payment_intents/${payment_intent_id}`, {
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
    if (r.ok) {
      const intent = await r.json();
      if (intent.status !== 'succeeded') {
        return errRes('Payment not yet confirmed. Status: ' + intent.status, 400);
      }
    }
  }

  const clientIp = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = new Date().toISOString();

  // Update the lead
  await sb.update('velocity_leads', `token=eq.${token}`, {
    is_paid: true,
    status: 'accepted',
    msa_accepted_at: now,
    msa_accepted_ip: clientIp,
    stripe_payment_intent_id: payment_intent_id || lead.stripe_payment_intent_id,
  });

  // Send receipt email via Resend
  if (context.env.RESEND_API_KEY && lead.client_email) {
    const p1 = (lead.full_data && lead.full_data.phase1) || {};
    const name = lead.client_name || p1.full_name || 'there';
    const amount = lead.quote_amount
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.quote_amount / 100)
      : '';
    const base = context.env.SITE_URL || 'https://velocity.calyvent.com';
    const dashUrl = `${base}/dashboard/${token}`;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: context.env.RESEND_FROM_EMAIL
            ? `Velocity <${context.env.RESEND_FROM_EMAIL}>`
            : 'Velocity <client@calyvent.com>',
          to: [lead.client_email],
          subject: 'Agreement executed — project confirmed.',
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#0D0C09;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0C09">
<tr><td align="center" style="padding:52px 24px 64px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
<tr><td style="padding:0 0 44px">
  <span style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:400;color:#DEC8B5;letter-spacing:-.025em">Velocity<span style="color:#C49C7B">.</span></span>
</td></tr>
<tr><td style="background:rgba(222,200,181,.08);height:1px;padding:0;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:40px 0 0">
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:30px;color:#DEC8B5;letter-spacing:-.035em;margin:0 0 22px;line-height:1.12">Confirmed,<br>${name}.</h1>
  <p style="font-size:13px;color:#8a8680;line-height:1.95;margin:0 0 18px">Your payment of <strong style="color:#DEC8B5;font-weight:400">${amount}</strong> has been received and the Master Services Agreement has been executed.</p>
  <p style="font-size:13px;color:#8a8680;line-height:1.95;margin:0 0 18px">Your project is booked. We will be in touch within 24 hours to align on next steps and begin the production sprint.</p>
  <table cellpadding="0" cellspacing="0" style="margin:32px 0"><tr><td style="background:#DEC8B5">
    <a href="${dashUrl}" style="display:block;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#0D0C09;text-decoration:none;padding:13px 30px;font-weight:500">View Dashboard &rarr;</a>
  </td></tr></table>
  <p style="font-size:12px;color:#565250;line-height:1.75;margin:0">Questions? Reply to this email or write to <a href="mailto:client@calyvent.com" style="color:#C49C7B;text-decoration:none">client@calyvent.com</a></p>
</td></tr>
<tr><td style="background:rgba(222,200,181,.05);height:1px;padding:0;font-size:0;line-height:0;margin-top:40px">&nbsp;</td></tr>
<tr><td style="padding:24px 0 0">
  <p style="font-size:11px;color:#3a3835;letter-spacing:.05em;margin:0;line-height:1.8">Velocity by Calyvent &mdash; velocity.calyvent.com</p>
  <p style="font-size:11px;color:#3a3835;letter-spacing:.04em;margin:8px 0 0;line-height:1.8">&copy; 2026 Calyvent. All rights reserved.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
        }),
      });
    } catch (_) {}
  }

  // Notify admin
  if (context.env.RESEND_API_KEY) {
    const p1 = (lead.full_data && lead.full_data.phase1) || {};
    const nm = lead.client_name || p1.full_name || 'Unknown';
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Velocity System <client@calyvent.com>',
          to: ['atelier@calyvent.com'],
          subject: `Payment received: ${nm}`,
          text: `${nm} has executed the MSA and paid ${lead.quote_amount ? '$' + (lead.quote_amount / 100).toFixed(2) : 'unknown amount'}. Dashboard: ${(context.env.SITE_URL || 'https://velocity.calyvent.com')}/coffee/admin/`,
        }),
      });
    } catch (_) {}
  }

  return jsonRes({ success: true });
}
