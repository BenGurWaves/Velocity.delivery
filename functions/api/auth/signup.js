/**
 * POST /api/auth/signup
 * Body: { email, password, website_url? }
 * Creates user, session, optionally a first project, and sends welcome email.
 */
import { json, err, corsPreflightResponse, hashPassword, generateId, createSession, sessionCookie, getKV, esc } from '../../_lib/helpers.js';

export async function onRequestPost(context) {
  const kv = getKV(context.env);
  if (!kv) return err('Storage not configured', 500);

  let body;
  try {
    body = await context.request.json();
  } catch {
    return err('Invalid JSON');
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();
  const websiteUrl = (body.website_url || '').trim();

  if (!email || !password) return err('Email and password are required');
  if (password.length < 8) return err('Password must be at least 8 characters');
  if (!email.includes('@') || !email.includes('.')) return err('Invalid email address');

  // Check if user already exists
  const existing = await kv.get(`user:${email}`, { type: 'json' });
  if (existing) return err('An account with this email already exists. Please log in.', 409);

  // Hash password
  const salt = generateId();
  const passwordHash = await hashPassword(password, salt);

  // Create user
  const user = {
    email,
    password_hash: passwordHash,
    salt,
    plan: 'free',
    created_at: new Date().toISOString(),
  };
  await kv.put(`user:${email}`, JSON.stringify(user), { expirationTtl: 86400 * 365 });

  // Track signup in the signups log for admin visibility
  try {
    const signups = (await kv.get('admin:signups', { type: 'json' })) || [];
    signups.unshift({ email, website_url: websiteUrl || null, created_at: user.created_at });
    // Keep last 500 signups
    if (signups.length > 500) signups.length = 500;
    await kv.put('admin:signups', JSON.stringify(signups), { expirationTtl: 86400 * 365 });
  } catch (_) {}

  // Create session
  const sessionId = await createSession(kv, email);

  // If website URL provided, create a project
  let projectId = null;
  if (websiteUrl) {
    projectId = generateId();
    const project = {
      id: projectId,
      user_email: email,
      website_url: websiteUrl,
      status: 'queued',
      progress: 0,
      created_at: new Date().toISOString(),
    };
    await kv.put(`project:${projectId}`, JSON.stringify(project), { expirationTtl: 86400 * 365 });

    // Add to user's project list
    const list = (await kv.get(`user_projects:${email}`, { type: 'json' })) || [];
    list.push(projectId);
    await kv.put(`user_projects:${email}`, JSON.stringify(list), { expirationTtl: 86400 * 365 });
  }

  // ── Send welcome email via Resend ──────────────────────────
  const resendKey = context.env && context.env.RESEND_API_KEY;
  if (resendKey) {
    const fromEmail = (context.env.FROM_EMAIL || 'hello@calyvent.com');
    const notifyEmail = context.env.NOTIFY_EMAIL || null;

    // 1. Welcome email to the customer
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + resendKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Velocity <' + fromEmail + '>',
          to: [email],
          subject: 'Welcome to Velocity — your account is ready',
          html: buildWelcomeEmail(email),
        }),
      });
    } catch (_) {
      // Don't block sign-up if email fails
    }

    // 2. Notify agency owner about new sign-up
    if (notifyEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + resendKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Velocity Leads <' + fromEmail + '>',
            to: [notifyEmail],
            subject: 'New sign-up: ' + email + (websiteUrl ? ' — ' + websiteUrl : ''),
            html: buildSignupNotification(email, websiteUrl),
          }),
        });
      } catch (_) {}
    }
  }

  return json(
    { success: true, email, project_id: projectId },
    200,
    { 'Set-Cookie': sessionCookie(sessionId) }
  );
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}

// ── Email Templates ───────────────────────────────────────────

function buildWelcomeEmail(email) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FDFBF9;font-family:-apple-system,system-ui,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:48px 28px;">
  <div style="margin-bottom:28px;">
    <div style="font-size:20px;color:#412F23;font-weight:600;">Velocity<span style="color:#C69F7F;">.</span></div>
    <div style="font-size:10px;color:#848074;">by Calyvent</div>
  </div>
  <h1 style="font-size:22px;color:#412F23;font-weight:400;margin:0 0 8px;font-family:Georgia,serif;">Welcome to Velocity.</h1>
  <p style="font-size:15px;color:#545048;line-height:1.7;margin:0 0 24px;">
    Your account is ready. Choose a plan and tell us about your project &mdash; we'll take it from there.
  </p>
  <div style="background:#F5F0EB;border:1px solid #E0CAB8;padding:20px;margin-bottom:24px;">
    <table style="width:100%;font-size:13px;color:#545048;line-height:2;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#412F23;font-weight:600;">Step 1</td><td style="padding:4px 0;">Pick a plan that fits your needs</td></tr>
      <tr style="border-top:1px solid #E0CAB8;"><td style="padding:4px 0;color:#412F23;font-weight:600;">Step 2</td><td style="padding:4px 0;">Fill out a short questionnaire about your business</td></tr>
      <tr style="border-top:1px solid #E0CAB8;"><td style="padding:4px 0;color:#412F23;font-weight:600;">Step 3</td><td style="padding:4px 0;">We design, build, and deploy your site</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://velocity.calyvent.com/dashboard" style="display:inline-block;background:#573E2E;color:#FDFBF9;font-size:14px;font-weight:600;padding:12px 28px;text-decoration:none;">Go to Dashboard</a>
  </div>
  <div style="border-top:1px solid #E0CAB8;padding-top:20px;text-align:center;">
    <p style="font-size:12px;color:#848074;margin:0;">Questions? Reply to this email.</p>
    <p style="font-size:11px;color:#848074;margin:4px 0 0;">&copy; 2026 Velocity&trade; by Calyvent</p>
  </div>
</div>
</body></html>`.trim();
}

function buildSignupNotification(email, websiteUrl) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#12100e;font-family:-apple-system,system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 28px;">
    <div style="margin-bottom:28px;"><div style="font-size:22px;color:#e8ddd3;font-family:Georgia,serif;">Velocity<span style="color:#c8956a;">.</span></div><a href="https://calyvent.com" style="font-size:10px;color:#6d6560;font-family:-apple-system,system-ui,sans-serif;text-decoration:none;">by Calyvent</a></div>

    <div style="background:rgba(200,149,106,0.12);border:1px solid rgba(200,149,106,0.25);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <h1 style="font-size:20px;color:#c8956a;font-weight:700;margin:0 0 4px;">New Account Created</h1>
      <p style="font-size:13px;color:#a89f94;margin:0;">A customer just signed up on the dashboard.</p>
    </div>

    <div style="background:#1a1815;border:1px solid #2e2a24;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;font-size:14px;color:#a89f94;line-height:1.8;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 16px 8px 0;color:#6d6560;font-weight:600;">Email</td>
          <td style="padding:8px 0;"><a href="mailto:${esc(email)}" style="color:#c8956a;">${esc(email)}</a></td>
        </tr>
        ${websiteUrl ? `<tr style="border-top:1px solid #2e2a24;">
          <td style="padding:8px 16px 8px 0;color:#6d6560;font-weight:600;">Website</td>
          <td style="padding:8px 0;"><a href="${esc(websiteUrl)}" style="color:#c8956a;word-break:break-all;">${esc(websiteUrl)}</a></td>
        </tr>` : ''}
        <tr style="border-top:1px solid #2e2a24;">
          <td style="padding:8px 16px 8px 0;color:#6d6560;font-weight:600;">Signed up</td>
          <td style="padding:8px 0;color:#e8ddd3;">${new Date().toISOString()}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="mailto:${esc(email)}" style="display:inline-block;background:#c8956a;color:#12100e;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">
        Reply to customer
      </a>
    </div>

    <div style="border-top:1px solid #2e2a24;margin-top:28px;padding-top:20px;text-align:center;">
      <p style="font-size:12px;color:#6d6560;margin:0;">Velocity Internal &mdash; New account sign-up notification.</p>
    </div>
  </div>
</body>
</html>`.trim();
}
