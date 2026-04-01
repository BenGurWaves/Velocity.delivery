import { json, err, corsPreflightResponse, getKV, esc } from '../../_lib/helpers.js';

export async function onRequestOptions(context) {
  return corsPreflightResponse(context.request);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return err('Invalid request body.', 400, request);
  }

  const { business_name, website_url, email, phone } = body;

  if (!business_name || !website_url || !email) {
    return err('Business name, website URL, and email are required.', 400, request);
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return err('Please provide a valid email address.', 400, request);
  }

  // Basic URL validation
  try {
    new URL(website_url);
  } catch {
    return err('Please provide a valid website URL.', 400, request);
  }

  const kv = getKV(env);
  if (!kv) {
    return err('Service temporarily unavailable.', 503, request);
  }

  const audit = {
    business_name: business_name.trim(),
    website_url: website_url.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : null,
    submitted_at: new Date().toISOString(),
    status: 'pending',
  };

  // Save to KV
  await kv.put(`audit:${audit.email}`, JSON.stringify(audit));

  // Send notification email via MailChannels (Cloudflare Workers integration)
  const notifyEmail = env.NOTIFY_EMAIL || 'hello@calyvent.com';
  try {
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: notifyEmail }] }],
        from: { email: 'noreply@calyvent.com', name: 'Velocity Audit' },
        subject: `New Audit Request: ${esc(audit.business_name)}`,
        content: [
          {
            type: 'text/plain',
            value: [
              `New website audit request:`,
              ``,
              `Business: ${audit.business_name}`,
              `URL: ${audit.website_url}`,
              `Email: ${audit.email}`,
              `Phone: ${audit.phone || 'Not provided'}`,
              `Submitted: ${audit.submitted_at}`,
            ].join('\n'),
          },
        ],
      }),
    });
  } catch {
    // Notification failure should not block the response
  }

  return json({ success: true }, 200, {}, request);
}
