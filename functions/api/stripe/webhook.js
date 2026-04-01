/**
 * POST /api/stripe/webhook
 * Handles Stripe payment confirmations.
 * Updates user plan, creates project with brief, sends detailed notification.
 */
import { getKV, generateId } from '../../_lib/helpers.js';

export async function onRequestPost(context) {
  const kv = getKV(context.env);
  const webhookSecret = context.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await context.request.text();

  let event;
  try { event = JSON.parse(rawBody); } catch { return new Response('Invalid payload', { status: 400 }); }

  if (!webhookSecret) return new Response('Webhook not configured', { status: 500 });
  const sig = context.request.headers.get('stripe-signature') || '';
  const verified = await verifyStripeSignature(rawBody, sig, webhookSecret);
  if (!verified) return new Response('Invalid signature', { status: 400 });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = (session.customer_email || session.metadata?.email || '').toLowerCase();
    const plan = session.metadata?.plan || 'landing';

    if (email && kv) {
      // Pull the brief the client submitted during onboarding
      let brief = null;
      try {
        brief = await kv.get('brief:' + email, { type: 'json' });
      } catch {}

      // Update user plan
      try {
        const userData = await kv.get('user:' + email, { type: 'json' });
        if (userData) {
          userData.plan = plan;
          userData.paid_at = new Date().toISOString();
          userData.stripe_session = session.id;
          await kv.put('user:' + email, JSON.stringify(userData), { expirationTtl: 86400 * 365 });
        }
      } catch {}

      // Create project with brief attached
      let projectId = null;
      try {
        const planNames = { landing: 'Landing Page', full: 'Full Website', premium: 'Premium Website' };
        projectId = generateId();
        const project = {
          id: projectId,
          user_email: email,
          name: brief?.business_name || planNames[plan] || 'Website Project',
          status: 'queued',
          plan,
          preview_url: null,
          brief: brief || null,
          created_at: new Date().toISOString(),
        };
        await kv.put('project:' + projectId, JSON.stringify(project), { expirationTtl: 86400 * 365 });

        const list = (await kv.get('user_projects:' + email, { type: 'json' })) || [];
        list.push(projectId);
        await kv.put('user_projects:' + email, JSON.stringify(list), { expirationTtl: 86400 * 365 });
      } catch {}

      // Send emails
      const resendKey = context.env.RESEND_API_KEY;
      if (resendKey) {
        const fromEmail = context.env.FROM_EMAIL || 'hello@calyvent.com';
        const planNames = { landing: 'Landing Page', full: 'Full Website', premium: 'Premium' };
        const planPrices = { landing: '$250', full: '$500', premium: '$1,000' };

        // Client confirmation
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Velocity <' + fromEmail + '>',
              to: [email],
              subject: 'Payment confirmed — your website is being built',
              html: buildClientEmail(planNames[plan] || plan, planPrices[plan] || '', brief),
            }),
          });
        } catch {}

        // YOUR notification with full brief
        const notifyEmail = context.env.NOTIFY_EMAIL;
        if (notifyEmail) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'Velocity <' + fromEmail + '>',
                to: [notifyEmail],
                subject: 'NEW ORDER: ' + (brief?.business_name || email) + ' — ' + (planNames[plan] || plan) + ' — ' + (planPrices[plan] || ''),
                html: buildAdminEmail(email, planNames[plan] || plan, planPrices[plan] || '', brief, projectId),
              }),
            });
          } catch {}
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function verifyStripeSignature(payload, sigHeader, secret) {
  try {
    const parts = {};
    sigHeader.split(',').forEach(p => { const [k, v] = p.split('='); parts[k] = v; });
    const timestamp = parts.t;
    const sig = parts.v1;
    if (!timestamp || !sig) return false;
    const signedPayload = timestamp + '.' + payload;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, enc.encode(signedPayload));
    const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
    return expected === sig;
  } catch { return false; }
}

function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildClientEmail(planName, price, brief) {
  const bizName = brief?.business_name ? esc(brief.business_name) : 'your new website';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FDFBF9;font-family:-apple-system,system-ui,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:48px 28px;">
  <div style="margin-bottom:28px;">
    <div style="font-size:20px;color:#412F23;font-weight:600;">Velocity<span style="color:#C69F7F;">.</span></div>
    <div style="font-size:10px;color:#848074;">by Calyvent</div>
  </div>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:20px;margin-bottom:24px;text-align:center;">
    <h1 style="font-size:20px;color:#166534;margin:0 0 4px;">Payment Confirmed</h1>
    <p style="font-size:14px;color:#545048;margin:0;">${esc(planName)} &mdash; ${esc(price)}</p>
  </div>
  <p style="font-size:15px;color:#545048;line-height:1.7;margin:0 0 20px;">
    We've received your brief for <strong style="color:#412F23;">${bizName}</strong> and we're starting work now. Here's what happens next:
  </p>
  <div style="background:#F5F0EB;border:1px solid #E0CAB8;padding:20px;margin-bottom:24px;">
    <table style="width:100%;font-size:13px;color:#545048;line-height:2;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#412F23;font-weight:600;">Day 1&ndash;2</td><td style="padding:4px 0;">We review your brief and create the design</td></tr>
      <tr style="border-top:1px solid #E0CAB8;"><td style="padding:4px 0;color:#412F23;font-weight:600;">Day 3&ndash;5</td><td style="padding:4px 0;">We build, optimize, and test everything</td></tr>
      <tr style="border-top:1px solid #E0CAB8;"><td style="padding:4px 0;color:#412F23;font-weight:600;">Day 5&ndash;7</td><td style="padding:4px 0;">Your preview goes live in your dashboard</td></tr>
    </table>
  </div>
  <p style="font-size:14px;color:#545048;line-height:1.7;margin:0 0 20px;">
    When your site is ready for review, you'll see a <strong style="color:#412F23;">View Preview</strong> link in your dashboard. Click it to see your live site and request any changes.
  </p>
  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://velocity.calyvent.com/dashboard" style="display:inline-block;background:#573E2E;color:#FDFBF9;font-size:14px;font-weight:600;padding:12px 28px;text-decoration:none;">Open Dashboard</a>
  </div>
  <div style="border-top:1px solid #E0CAB8;padding-top:20px;text-align:center;">
    <p style="font-size:12px;color:#848074;margin:0;">Questions? Reply to this email.</p>
    <p style="font-size:11px;color:#848074;margin:4px 0 0;">&copy; 2026 Velocity&trade; by Calyvent</p>
  </div>
</div>
</body></html>`;
}

function buildAdminEmail(email, planName, price, brief, projectId) {
  const rows = [
    ['Customer', email],
    ['Plan', planName + ' — ' + price],
    ['Project ID', projectId || 'N/A'],
    ['Business Name', brief?.business_name || '—'],
    ['Description', brief?.business_desc || '—'],
    ['Current Website', brief?.current_url || 'None'],
    ['Design Style', brief?.style || '—'],
    ['Brand Colors', brief?.brand_colors || 'Designer\'s choice'],
    ['Inspiration', brief?.inspiration || '—'],
    ['Pages Needed', brief?.pages || '—'],
    ['Features', brief?.features || '—'],
    ['Notes', brief?.notes || '—'],
  ];

  const tableRows = rows.map(([label, value]) =>
    `<tr style="border-bottom:1px solid #E0CAB8;">
      <td style="padding:10px 12px 10px 0;color:#848074;font-weight:600;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
      <td style="padding:10px 0;color:#412F23;">${esc(value)}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FDFBF9;font-family:-apple-system,system-ui,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:48px 28px;">
  <div style="margin-bottom:28px;">
    <div style="font-size:20px;color:#412F23;font-weight:600;">Velocity<span style="color:#C69F7F;">.</span></div>
    <div style="font-size:10px;color:#848074;">New Order Notification</div>
  </div>
  <div style="background:#fef3c7;border:1px solid #fde68a;padding:16px 20px;margin-bottom:24px;">
    <h1 style="font-size:18px;color:#92400e;margin:0 0 4px;">New Order Received</h1>
    <p style="font-size:14px;color:#78716c;margin:0;">${esc(brief?.business_name || email)} &mdash; ${esc(planName)} &mdash; ${esc(price)}</p>
  </div>
  <h2 style="font-size:16px;color:#412F23;margin:0 0 12px;">Client Brief</h2>
  <div style="background:#F5F0EB;border:1px solid #E0CAB8;padding:20px;margin-bottom:24px;">
    <table style="width:100%;font-size:13px;line-height:1.6;border-collapse:collapse;">
      ${tableRows}
    </table>
  </div>
  <p style="font-size:13px;color:#848074;">
    Update this project via CLI:<br>
    <code style="background:#F5F0EB;padding:4px 8px;font-size:12px;">curl -X POST https://velocity.calyvent.com/api/admin/update-project -H "Content-Type: application/json" -H "X-Admin-Key: YOUR_KEY" -d '{"project_id":"${projectId || ''}","status":"in-progress"}'</code>
  </p>
</div>
</body></html>`;
}
