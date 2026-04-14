/**
 * POST /api/forms/submit
 * Receives contact form submissions from generated websites.
 * Stores in KV and optionally forwards via email (Resend).
 * 
 * WRITE-EFFICIENT DESIGN (Cloudflare KV free tier: 1,000 writes/day):
 * - All KV reads use cacheTtl to minimize repeated fetches
 * - Rate limit only writes when count actually changes
 * - Single manifest key for all submissions (avoids multiple writes)
 * - Batched writes with Promise.all
 * - No ephemeral writes (no session tracking, no view counts)
 *
 * Body: { site_id, name, email, phone?, message }
 * Headers: X-Site-Id (alternative to body.site_id)
 */
import { json, err, getKV, generateId } from '../../_lib/helpers.js';

// HTML-escape user input before injecting into email templates
function esc(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// CORS — allow any origin so client preview sites on their own domains can POST
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Id',
  };
}

function jsonOk(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function jsonErr(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// OPTIONS preflight — required for cross-origin form submissions
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// Cache TTL for KV reads (seconds) - aggressive caching for read efficiency
const CACHE_TTL_SHORT = 60;      // 1 minute for rate limits
const CACHE_TTL_MEDIUM = 300;    // 5 minutes for manifests
const CACHE_TTL_LONG = 3600;     // 1 hour for build data

// Rate-limit: max 5 submissions per IP per 10 minutes
// Uses cacheTtl to avoid repeated KV reads for same IP
async function checkRateLimit(kv, ip) {
  const key = `ratelimit:form:${ip}`;
  // Use cacheTtl to avoid hitting KV on every request from same IP
  const data = await kv.get(key, { type: 'json', cacheTtl: CACHE_TTL_SHORT }).catch(() => null);
  const now = Date.now();
  const recent = ((data && data.timestamps) || []).filter(t => now - t < 600_000);
  if (recent.length >= 5) return { allowed: false, timestamps: recent, shouldWrite: false };
  return { allowed: true, timestamps: recent, shouldWrite: true };
}

export async function onRequestPost(context) {
  const kv = getKV(context.env);
  if (!kv) return jsonErr('Storage not configured', 500);

  let body;
  try { body = await context.request.json(); } catch { return jsonErr('Invalid JSON'); }

  const siteId  = (body.site_id || context.request.headers.get('X-Site-Id') || '').trim();
  const name    = (body.name    || '').trim();
  const email   = (body.email   || '').trim().toLowerCase();
  const phone   = (body.phone   || '').trim();
  const message = (body.message || '').trim();

  if (!name)                                                    return jsonErr('Name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))    return jsonErr('Valid email is required');
  if (!message)                                                 return jsonErr('Message is required');
  if (message.length > 5000)                                   return jsonErr('Message too long (max 5000 characters)');

  // Honeypot — hidden field "website" added by generated forms to catch bots
  if (body.website) return jsonOk({ success: true });

  // Rate limiting with cacheTtl on read
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateCheck = await checkRateLimit(kv, ip);
  if (!rateCheck.allowed) return jsonErr('Too many submissions. Please try again later.', 429);

  // Build submission record
  const submissionId = generateId();
  const submittedAt = new Date().toISOString();
  const submission = {
    id: submissionId,
    site_id: siteId || 'unknown',
    name, email,
    phone: phone || null,
    message,
    ip,
    submitted_at: submittedAt,
  };

  // Prepare writes array - only write what we need to
  const writes = [];
  
  // 1. Rate limit: only write if we're tracking this IP (i.e., count changed)
  if (rateCheck.shouldWrite) {
    const timestamps = [...rateCheck.timestamps, Date.now()];
    writes.push(
      kv.put(`ratelimit:form:${ip}`, JSON.stringify({ timestamps }), { expirationTtl: 600 })
    );
  }
  
  // 2. Store the actual submission (only if we need individual lookup)
  // NOTE: This is disabled to save writes. Submissions are tracked via manifest only.
  // To re-enable individual submission storage, uncomment:
  // writes.push(kv.put(`form:${submissionId}`, JSON.stringify(submission), { expirationTtl: 86400 * 180 }));

  // 3. Single manifest-based write for all submissions
  // Instead of separate keys for each site + global feed, we use one manifest
  // that gets updated atomically. This is 1 write vs 3 writes.
  const manifestKey = 'admin:submissions_manifest';
  try {
    const manifest = await kv.get(manifestKey, { type: 'json', cacheTtl: CACHE_TTL_MEDIUM }) || { 
      submissions: [], 
      by_site: {},
      updated_at: submittedAt 
    };
    
    // Add to global list (keep last 500)
    const newEntry = { id: submissionId, site_id: siteId || 'unknown', name, email, submitted_at: submittedAt };
    manifest.submissions.unshift(newEntry);
    if (manifest.submissions.length > 500) manifest.submissions.length = 500;
    
    // Add to site-specific list (keep last 200 per site)
    const siteKey = siteId || 'unlinked';
    if (!manifest.by_site[siteKey]) manifest.by_site[siteKey] = [];
    manifest.by_site[siteKey].unshift({ id: submissionId, name, email, submitted_at: submittedAt });
    if (manifest.by_site[siteKey].length > 200) manifest.by_site[siteKey].length = 200;
    
    manifest.updated_at = submittedAt;
    writes.push(kv.put(manifestKey, JSON.stringify(manifest), { expirationTtl: 86400 * 365 }));
  } catch (_) {
    // Manifest update failed, but we still want to notify if possible
  }

  // 4. Email notification (uses cached build data with cacheTtl)
  if (siteId && context.env.RESEND_API_KEY) {
    try {
      // Use cacheTtl to avoid repeated KV reads for same site
      const build = await kv.get(`build:${siteId}`, { type: 'json', cacheTtl: CACHE_TTL_LONG });
      if (build?.email) {
        // Escape ALL user inputs before injecting into HTML
        const safeName    = esc(name);
        const safeEmail   = esc(email);
        const safePhone   = esc(phone);
        const safeMessage = esc(message);

        // Fire-and-forget email (don't await, don't fail submission if email fails)
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: context.env.RESEND_FROM || 'Velocity Forms <forms@velocity.calyvent.com>',
            to: build.email,
            subject: `New contact form message from ${safeName}`,
            html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
<h2 style="color:#1a2e1c">New Contact Form Submission</h2>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px 0;color:#666;width:80px"><strong>Name</strong></td><td style="padding:8px 0">${safeName}</td></tr>
<tr><td style="padding:8px 0;color:#666"><strong>Email</strong></td><td style="padding:8px 0"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
${safePhone ? `<tr><td style="padding:8px 0;color:#666"><strong>Phone</strong></td><td style="padding:8px 0">${safePhone}</td></tr>` : ''}
</table>
<div style="margin:20px 0;padding:16px;background:#f5f5f0;border-radius:8px;white-space:pre-wrap">${safeMessage}</div>
<p style="color:#999;font-size:12px">Sent via your Velocity website contact form</p>
</div>`,
          }),
        }).catch(() => {}); // Silently ignore email failures
      }
    } catch (_) {}
  }

  // Execute all writes in parallel (max 2 writes per submission now)
  if (writes.length > 0) {
    await Promise.all(writes);
  }

  return jsonOk({ success: true, submission_id: submissionId });
}
