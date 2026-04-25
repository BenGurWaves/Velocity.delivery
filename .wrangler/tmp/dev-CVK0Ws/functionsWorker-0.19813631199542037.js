var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-gY7xYl/functionsWorker-0.19813631199542037.mjs
var __defProp2 = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, "__export");
var security_exports = {};
__export(security_exports, {
  checkAdminAuth: /* @__PURE__ */ __name(() => checkAdminAuth, "checkAdminAuth"),
  rateLimit: /* @__PURE__ */ __name(() => rateLimit, "rateLimit"),
  safeUrl: /* @__PURE__ */ __name(() => safeUrl, "safeUrl"),
  secureErr: /* @__PURE__ */ __name(() => secureErr, "secureErr"),
  secureHeaders: /* @__PURE__ */ __name(() => secureHeaders, "secureHeaders"),
  secureJson: /* @__PURE__ */ __name(() => secureJson, "secureJson"),
  secureOptions: /* @__PURE__ */ __name(() => secureOptions, "secureOptions"),
  timingSafeEqual: /* @__PURE__ */ __name(() => timingSafeEqual, "timingSafeEqual"),
  validateLength: /* @__PURE__ */ __name(() => validateLength, "validateLength")
});
async function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const enc = new TextEncoder();
  const aKey = await crypto.subtle.importKey("raw", enc.encode(a), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bKey = await crypto.subtle.importKey("raw", enc.encode(b), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  const aSig = new Uint8Array(await crypto.subtle.sign("HMAC", aKey, nonce));
  const bSig = new Uint8Array(await crypto.subtle.sign("HMAC", bKey, nonce));
  if (aSig.length !== bSig.length) return false;
  let diff = 0;
  for (let i = 0; i < aSig.length; i++) diff |= aSig[i] ^ bSig[i];
  return diff === 0;
}
__name(timingSafeEqual, "timingSafeEqual");
async function checkAdminAuth(request, env) {
  const provided = request.headers.get("X-Admin-Secret") || "";
  if (!provided || !env.ADMIN_SECRET) return { ok: false, locked: false };
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const lockKey = `lock:admin:${ip}`;
  const failKey = `fails:admin:${ip}`;
  const kv = env.DATA || env.LEADS;
  const match2 = await timingSafeEqual(provided, env.ADMIN_SECRET);
  if (!match2 && kv) {
    try {
      const locked = await kv.get(lockKey).catch(() => null);
      if (locked) return { ok: false, locked: true, retryAfter: 900 };
      const fails = parseInt(await kv.get(failKey).catch(() => "0") || "0", 10) + 1;
      if (fails >= 5) {
        await kv.put(lockKey, "1", { expirationTtl: 900 });
        await kv.delete(failKey);
        return { ok: false, locked: true, retryAfter: 900 };
      }
      await kv.put(failKey, String(fails), { expirationTtl: 300 });
    } catch (_) {
    }
    return { ok: false, locked: false };
  }
  return { ok: match2, locked: false };
}
__name(checkAdminAuth, "checkAdminAuth");
async function rateLimit(kv, key, maxRequests, windowSeconds) {
  return { allowed: true };
}
__name(rateLimit, "rateLimit");
function validateLength(key, value) {
  if (typeof value !== "string") return value;
  const limit = INPUT_LIMITS[key];
  if (limit && value.length > limit) throw `${key} exceeds maximum length of ${limit} characters`;
  return value.trim();
}
__name(validateLength, "validateLength");
function safeUrl(url) {
  if (!url) return null;
  const s = url.trim();
  if (!s) return null;
  const withProto = /^https?:\/\//i.test(s) ? s : "https://" + s;
  try {
    const u = new URL(withProto);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return withProto;
  } catch (_) {
    return null;
  }
}
__name(safeUrl, "safeUrl");
function secureHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
    ...extra
  };
}
__name(secureHeaders, "secureHeaders");
function secureJson(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: secureHeaders() });
}
__name(secureJson, "secureJson");
function secureErr(message, status = 400) {
  const safe = status >= 500 ? "An internal error occurred." : message;
  return secureJson({ error: safe }, status);
}
__name(secureErr, "secureErr");
function secureOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(secureOptions, "secureOptions");
var INPUT_LIMITS;
var init_security = __esm({
  "_lib/security.js"() {
    init_functionsRoutes_0_8101214893995591();
    INPUT_LIMITS = {
      client_email: 255,
      client_name: 255,
      admin_comment: 2e3,
      site_link: 500,
      scope_text: 5e3
    };
    __name2(timingSafeEqual, "timingSafeEqual");
    __name2(checkAdminAuth, "checkAdminAuth");
    __name2(rateLimit, "rateLimit");
    __name2(validateLength, "validateLength");
    __name2(safeUrl, "safeUrl");
    __name2(secureHeaders, "secureHeaders");
    __name2(secureJson, "secureJson");
    __name2(secureErr, "secureErr");
    __name2(secureOptions, "secureOptions");
  }
});
async function onRequestOptions() {
  return secureOptions();
}
__name(onRequestOptions, "onRequestOptions");
async function onRequestPost(context) {
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const kv = context.env.DATA || context.env.LEADS;
  const rl = await rateLimit(kv, `ratelimit:tmptoken:${ip}`, 20, 60);
  if (!rl.allowed) return secureErr("Too many requests", 429);
  const auth = await checkAdminAuth(context.request, context.env);
  if (auth.locked) return secureErr("Too many failed attempts. Try again in 15 minutes.", 429);
  if (!auth.ok) return secureErr("Unauthorized", 401);
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  if (kv) {
    await kv.put(`view_token:${token}`, "1", { expirationTtl: 300 });
  }
  return secureJson({ token, expires_in: 300 });
}
__name(onRequestPost, "onRequestPost");
var init_temp_token = __esm({
  "api/admin/temp-token.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_security();
    __name2(onRequestOptions, "onRequestOptions");
    __name2(onRequestPost, "onRequestPost");
  }
});
function getSupabase(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  const headers = {
    "Content-Type": "application/json",
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Prefer": "return=representation"
  };
  return {
    async select(table, filters = "") {
      const r = await fetch(`${url}/rest/v1/${table}?${filters}`, { headers });
      if (!r.ok) {
        const e = await r.text().catch(() => "");
        throw new Error(e.includes("message") ? JSON.parse(e).message || "Database error" : "Database error");
      }
      return r.json();
    },
    async insert(table, data) {
      const r = await fetch(`${url}/rest/v1/${table}`, { method: "POST", headers, body: JSON.stringify(data) });
      if (!r.ok) {
        const e = await r.text().catch(() => "");
        throw new Error(e.includes("message") ? JSON.parse(e).message || "Database error" : "Database error");
      }
      return r.json();
    },
    async update(table, filters, data) {
      const r = await fetch(`${url}/rest/v1/${table}?${filters}`, { method: "PATCH", headers, body: JSON.stringify(data) });
      if (!r.ok) {
        const e = await r.text().catch(() => "");
        throw new Error(e.includes("message") ? JSON.parse(e).message || "Database error" : "Database error");
      }
      return r.json();
    }
  };
}
__name(getSupabase, "getSupabase");
function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
__name(jsonRes, "jsonRes");
function errRes2(msg, status = 400) {
  return jsonRes({ error: msg }, status);
}
__name(errRes2, "errRes2");
function optionsRes() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Secret"
    }
  });
}
__name(optionsRes, "optionsRes");
var init_supabase = __esm({
  "_lib/supabase.js"() {
    init_functionsRoutes_0_8101214893995591();
    __name2(getSupabase, "getSupabase");
    __name2(jsonRes, "jsonRes");
    __name2(errRes2, "errRes");
    __name2(optionsRes, "optionsRes");
  }
});
function emailShell(innerHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
</head>
<body style="margin:0;padding:0;background:#0D0C09;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0D0C09">
<tr><td align="center" style="padding:52px 24px 64px">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px">

<!-- Wordmark -->
<tr><td style="padding:0 0 44px">
  <span style="font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:400;color:#DEC8B5;letter-spacing:-.025em">Velocity<span style="color:#C49C7B">.</span></span>
</td></tr>

<!-- Rule -->
<tr><td style="background:rgba(222,200,181,.08);height:1px;padding:0;font-size:0;line-height:0">&nbsp;</td></tr>

<!-- Body -->
<tr><td style="padding:40px 0 0">
${innerHtml}
</td></tr>

<!-- Footer rule -->
<tr><td style="background:rgba(222,200,181,.05);height:1px;padding:0;font-size:0;line-height:0;margin-top:40px">&nbsp;</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 0 0">
  <p style="font-size:11px;color:#3a3835;letter-spacing:.05em;margin:0;line-height:1.8">Velocity by Calyvent &mdash; velocity.calyvent.com</p>
  <p style="font-size:11px;color:#3a3835;letter-spacing:.04em;margin:8px 0 0;line-height:1.8">&copy; 2026 Calyvent. All rights reserved.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
__name(emailShell, "emailShell");
function ctaButton(label, url) {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:32px 0">
<tr><td style="background:#DEC8B5">
  <a href="${url}" style="display:block;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#0D0C09;text-decoration:none;padding:13px 30px;font-weight:500">${label} &rarr;</a>
</td></tr>
</table>`;
}
__name(ctaButton, "ctaButton");
function h1(text) {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:30px;color:#DEC8B5;letter-spacing:-.035em;margin:0 0 22px;line-height:1.12">${text}</h1>`;
}
__name(h1, "h1");
function p(text, style = "") {
  return `<p style="font-size:13px;color:#8a8680;line-height:1.95;margin:0 0 18px;${style}">${text}</p>`;
}
__name(p, "p");
function small(text) {
  return `<p style="font-size:12px;color:#565250;line-height:1.8;margin:0 0 8px">${text}</p>`;
}
__name(small, "small");
async function onRequestOptions2() {
  return secureOptions();
}
__name(onRequestOptions2, "onRequestOptions2");
async function onRequestPatch(context) {
  const auth = await checkAdminAuth(context.request, context.env);
  if (auth.locked) return secureErr("Too many failed attempts. Try again in 15 minutes.", 429);
  if (!auth.ok) return secureErr("Unauthorized", 401);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return errRes("Invalid JSON");
  }
  const { token, quote_amount, status, admin_comment, site_link, scope_text, scope_sent_at } = body;
  if (!token) return errRes("token required");
  const patch = {};
  let prevStatus = null;
  const rows = await sb.select("velocity_leads", `token=eq.${token}&select=status,client_email,client_name,full_data,site_link`);
  if (!rows.length) return errRes("Not found", 404);
  const lead = rows[0];
  prevStatus = lead.status;
  if (quote_amount !== void 0) {
    const amt = parseInt(quote_amount, 10);
    if (isNaN(amt) || amt < 0) return errRes("Invalid quote_amount");
    patch.quote_amount = amt;
  }
  if (status !== void 0) {
    if (!VALID_STATUSES.includes(status)) return errRes("Invalid status");
    patch.status = status;
    if (["in_progress", "completed", "declined"].includes(status)) {
      patch.is_locked = true;
    }
  }
  if (admin_comment !== void 0 || body.admin_comment_link !== void 0) {
    if (admin_comment !== void 0) {
      patch.admin_comment = admin_comment ? { text: admin_comment, created_at: (/* @__PURE__ */ new Date()).toISOString() } : null;
    } else {
      const existing = lead.admin_comment || {};
      if (existing.text) {
        patch.admin_comment = { ...existing };
      }
    }
    if (body.admin_comment_link !== void 0 && patch.admin_comment) {
      patch.admin_comment.link = body.admin_comment_link ? safeUrl(body.admin_comment_link) : null;
    }
  }
  if (scope_text !== void 0) {
    patch.scope_text = scope_text || null;
  }
  if (scope_sent_at !== void 0) {
    patch.scope_sent_at = scope_sent_at || null;
  }
  if (site_link !== void 0) {
    patch.site_link = site_link ? safeUrl(site_link) : null;
  }
  if (!Object.keys(patch).length) return errRes("Nothing to update");
  const updated = await sb.update("velocity_leads", `token=eq.${token}`, patch);
  if (status && context.env.SHEETS_WEBHOOK_URL && context.env.ADMIN_SECRET) {
    try {
      context.waitUntil(fetch(new URL(context.request.url).origin + "/api/leads/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Secret": context.env.ADMIN_SECRET },
        body: JSON.stringify({ token })
      }));
    } catch (_) {
    }
  }
  let emailResult = null;
  if (status && status !== prevStatus && context.env.RESEND_API_KEY) {
    const tpl = STATUS_EMAIL[status];
    if (tpl) {
      const p1 = lead.full_data && lead.full_data.phase1 || {};
      const name = lead.client_name || p1.full_name || "there";
      const email = lead.client_email || p1.email;
      const siteLink = patch.site_link || lead.site_link;
      const base = context.env.SITE_URL || "https://velocity.calyvent.com";
      const dashboardUrl = `${base}/dashboard/${token}`;
      const fromAddr = context.env.RESEND_FROM_EMAIL ? `Velocity <${context.env.RESEND_FROM_EMAIL}>` : `Velocity <client@calyvent.com>`;
      if (email) {
        try {
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${context.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: fromAddr,
              to: [email],
              subject: tpl.subject,
              html: tpl.body(name, dashboardUrl, siteLink)
            })
          });
          const emailData = await emailRes.json();
          emailResult = emailRes.ok ? { sent: true, id: emailData.id } : { sent: false, error: emailData.message || emailData.name || JSON.stringify(emailData) };
        } catch (emailErr) {
          emailResult = { sent: false, error: String(emailErr) };
        }
      } else {
        emailResult = { sent: false, error: "No email address on lead" };
      }
    }
  }
  return secureJson({ success: true, lead: Array.isArray(updated) ? updated[0] : updated, email: emailResult });
}
__name(onRequestPatch, "onRequestPatch");
var VALID_STATUSES;
var STATUS_EMAIL;
var init_admin_update = __esm({
  "api/leads/admin-update.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    VALID_STATUSES = ["outreach", "responded", "onboarding_sent", "pending", "scope_sent", "accepted", "paid", "in_progress", "completed", "declined", "archived"];
    __name2(emailShell, "emailShell");
    __name2(ctaButton, "ctaButton");
    __name2(h1, "h1");
    __name2(p, "p");
    __name2(small, "small");
    STATUS_EMAIL = {
      accepted: {
        subject: "Your project has been accepted.",
        body: /* @__PURE__ */ __name2((name, dashUrl) => emailShell(`
      ${h1("Good news,<br>" + name + ".")}
      ${p("Your brief has been reviewed. We\u2019re moving forward.")}
      ${p("A custom quote is waiting for you on your dashboard. Review it at your convenience \u2014 once you\u2019re ready, a single click confirms your project and puts you in queue.")}
      ${ctaButton("Review Quote & Confirm", dashUrl)}
      ${small("Questions? Reply directly to this email.")}
      ${small("You have 24 hours from your original submission to edit your brief if anything needs adjusting.")}
    `), "body")
      },
      in_progress: {
        subject: "Your project is in progress.",
        body: /* @__PURE__ */ __name2((name, dashUrl) => emailShell(`
      ${h1("Work has<br>begun, " + name + ".")}
      ${p("Your project is now in active development. We have everything we need.")}
      ${p("Your brief is locked to keep the scope clean and the work focused. If anything important has changed, reply to this email and we\u2019ll discuss it.")}
      ${p("We\u2019ll be in touch with updates. In the meantime, you can track your project status on your dashboard.")}
      ${ctaButton("View Project Status", dashUrl)}
      ${small("Estimated timeline is based on the deadline you provided in your brief.")}
    `), "body")
      },
      completed: {
        subject: "Your website is live.",
        body: /* @__PURE__ */ __name2((name, dashUrl, siteLink) => emailShell(`
      ${h1("It\u2019s live,<br>" + name + ".")}
      ${p("Your website is complete and live on the web. This is the moment everything was building toward.")}
      ${siteLink ? `${p("Your site is live at:")}
           <table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px">
           <tr><td style="background:rgba(196,156,123,.08);border:1px solid rgba(196,156,123,.18);padding:14px 20px">
             <a href="${siteLink}" style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#C49C7B;text-decoration:none;letter-spacing:-.01em">${siteLink} &#8599;</a>
           </td></tr></table>` : `${p("Log in to your dashboard to access the link to your finished site.")}`}
      ${p("It has been a pleasure. Your dashboard will remain active if you ever need to reference your brief or get back in touch.")}
      ${ctaButton("Open Dashboard", dashUrl)}
      ${small("Thank you for choosing Velocity.")}
    `), "body")
      },
      declined: {
        subject: "An update on your Velocity enquiry.",
        body: /* @__PURE__ */ __name2((name) => emailShell(`
      ${h1("Thank you<br>for reaching out.")}
      ${p("We\u2019ve taken time to carefully review your brief. After consideration, we\u2019ve decided not to move forward with this particular project.")}
      ${p("This is not a reflection on your work or your idea. We take on a deliberately small number of projects at any given time, and we only commit when we\u2019re confident we can give the work the attention it deserves.")}
      ${p("We hope you find the right partner for it. If your circumstances change or you have a future project that might be a better fit, we\u2019re always open to a conversation.")}
      ${small("You\u2019re welcome to reply to this email if you have questions.")}
    `), "body")
      }
    };
    __name2(onRequestOptions2, "onRequestOptions");
    __name2(onRequestPatch, "onRequestPatch");
  }
});
async function onRequestOptions3() {
  return secureOptions();
}
__name(onRequestOptions3, "onRequestOptions3");
async function onRequestPost2(context) {
  const auth = await checkAdminAuth(context.request, context.env);
  if (auth.locked) return secureErr("Too many failed attempts. Try again in 15 minutes.", 429);
  if (!auth.ok) return secureErr("Unauthorized", 401);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return secureErr("Invalid request");
  }
  const client_email = validateLength("client_email", (body.client_email || "").toLowerCase()) || null;
  const client_name = validateLength("client_name", body.client_name || "") || null;
  try {
    const rows = await sb.insert("velocity_leads", { client_email, client_name, status: "onboarding_sent" });
    const lead = Array.isArray(rows) ? rows[0] : rows;
    const base = context.env.SITE_URL || "https://velocity.calyvent.com";
    return secureJson({ id: lead.id, token: lead.token, onboard_url: `${base}/onboard/${lead.token}` });
  } catch (err) {
    return secureErr("Failed to create lead: " + (err.message || err), 500);
  }
}
__name(onRequestPost2, "onRequestPost2");
var init_create = __esm({
  "api/leads/create.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions3, "onRequestOptions");
    __name2(onRequestPost2, "onRequestPost");
  }
});
async function onRequestOptions4() {
  return secureOptions();
}
__name(onRequestOptions4, "onRequestOptions4");
async function onRequestDelete(context) {
  const auth = await checkAdminAuth(context.request, context.env);
  if (auth.locked) return secureErr("Too many failed attempts. Try again in 15 minutes.", 429);
  if (!auth.ok) return secureErr("Unauthorized", 401);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return secureErr("Invalid request");
  }
  const token = (body.token || "").trim();
  if (!token) return secureErr("token required");
  const rows = await sb.select("velocity_leads", `token=eq.${token}&select=id`).catch(() => []);
  if (!rows.length) return secureErr("Not found", 404);
  const url = context.env.SUPABASE_URL;
  const key = context.env.SUPABASE_SERVICE_KEY;
  try {
    const r = await fetch(`${url}/rest/v1/velocity_leads?token=eq.${token}`, {
      method: "DELETE",
      headers: { "apikey": key, "Authorization": `Bearer ${key}` }
    });
    if (!r.ok) return secureErr("Delete failed", 500);
    return secureJson({ success: true });
  } catch (_) {
    return secureErr("Service unavailable", 503);
  }
}
__name(onRequestDelete, "onRequestDelete");
var init_delete = __esm({
  "api/leads/delete.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions4, "onRequestOptions");
    __name2(onRequestDelete, "onRequestDelete");
  }
});
async function onRequestOptions5() {
  return secureOptions();
}
__name(onRequestOptions5, "onRequestOptions5");
async function onRequestGet(context) {
  const auth = await checkAdminAuth(context.request, context.env);
  if (auth.locked) return secureErr("Too many failed attempts. Try again in 15 minutes.", 429);
  if (!auth.ok) return secureErr("Unauthorized", 401);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  const url = new URL(context.request.url);
  const sort = url.searchParams.get("sort") || "due_date";
  const status = url.searchParams.get("status") || "";
  let filter = "order=due_date.asc.nullslast,created_at.desc&limit=500";
  if (sort === "created_at") filter = "order=created_at.desc&limit=500";
  if (sort === "status") filter = "order=status.asc,created_at.desc&limit=500";
  if (status) filter += `&status=eq.${status}`;
  try {
    const rows = await getSupabase(context.env).select("velocity_leads", filter);
    for (const r of rows) {
      const anchor = r.first_submitted_at || r.submitted_at;
      if (!r.is_locked && anchor && Date.now() - new Date(anchor).getTime() > 864e5)
        r.is_locked = true;
    }
    return secureJson(rows);
  } catch (_) {
    return secureErr("Service unavailable", 503);
  }
}
__name(onRequestGet, "onRequestGet");
var init_list = __esm({
  "api/leads/list.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions5, "onRequestOptions");
    __name2(onRequestGet, "onRequestGet");
  }
});
async function onRequestOptions6() {
  return secureOptions();
}
__name(onRequestOptions6, "onRequestOptions6");
async function onRequestPost3(context) {
  const webhookUrl = context.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return secureErr("Sheets integration not configured", 503);
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const kv = context.env.DATA || context.env.LEADS;
  const auth = await checkAdminAuth(context.request, context.env);
  if (!auth.ok) return secureErr("Unauthorized", 401);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return secureErr("Invalid request");
  }
  const { token } = body;
  if (!token) return secureErr("token required");
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  const rows = await sb.select("velocity_leads", `token=eq.${token}&select=*`).catch(() => []);
  if (!rows.length) return secureErr("Not found", 404);
  const lead = rows[0];
  const p1 = lead.full_data && lead.full_data.phase1 || {};
  const p2 = lead.full_data && lead.full_data.phase2 || {};
  const p3 = lead.full_data && lead.full_data.phase3 || {};
  const p4 = lead.full_data && lead.full_data.phase4 || {};
  const p5 = lead.full_data && lead.full_data.phase5 || {};
  const addr = lead.business_address || {};
  const sheetRow = {
    // System
    id: lead.id,
    token: lead.token,
    status: lead.status,
    submitted_at: lead.submitted_at || "",
    created_at: lead.created_at,
    is_paid: lead.is_paid ? "Yes" : "No",
    quote_amount_usd: lead.quote_amount ? (lead.quote_amount / 100).toFixed(2) : "",
    is_locked: lead.is_locked ? "Yes" : "No",
    // Personal info
    full_name: lead.client_name || p1.full_name || "",
    personal_email: lead.personal_email || lead.client_email || p1.email || "",
    personal_phone: lead.personal_phone || p1.phone || "",
    // Business info
    business_type: lead.business_type || p1.business_type || "",
    business_name: lead.business_name || p1.company_name || "",
    business_email: lead.business_email || p1.business_email || "",
    business_phone: lead.business_phone || p1.business_phone || "",
    // Address
    street: addr.street || "",
    city: addr.city || "",
    state_province: addr.state_province || "",
    postal_code: addr.postal_code || "",
    country: addr.country || "",
    // Project
    due_date: lead.due_date || "",
    context: p1.context || "",
    target_audience: p2.target_customer || "",
    inspiration_urls: (p2.inspiration || []).map((i) => i.url).join(", "),
    anti_inspiration_urls: (p2.anti_inspiration || []).map((i) => i.url).join(", "),
    color_background: p3.color_background || "",
    color_secondary: p3.color_secondary || "",
    color_accent: p3.color_accent || "",
    fonts: p3.fonts || "",
    upgrade_permission: lead.upgrade_permission ? "Yes" : "No",
    mottos: p4.mottos || "",
    copyright: p4.copyright || "",
    assets_links: p4.assets_links || "",
    starting_point: p4.starting_point || "",
    existing_url: p4.existing_url || "",
    domain_choice: lead.domain_choice || "",
    domain_name: lead.domain_name || "",
    socials: (p1.socials || []).join(", "),
    additional_notes: p5.additional_notes || "",
    terms_accepted: lead.terms_accepted ? "Yes" : "No",
    terms_accepted_at: lead.terms_accepted_at || "",
    site_link: lead.site_link || ""
  };
  try {
    const r = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sheetRow)
    });
    if (r.ok) {
      await sb.update("velocity_leads", `token=eq.${token}`, {
        sheets_synced_at: (/* @__PURE__ */ new Date()).toISOString()
      }).catch(() => {
      });
      return secureJson({ success: true, synced_at: (/* @__PURE__ */ new Date()).toISOString() });
    } else {
      const err = await r.text().catch(() => "unknown");
      return secureErr(`Sheets webhook failed: ${err}`, 502);
    }
  } catch (e) {
    return secureErr("Could not reach Sheets webhook", 502);
  }
}
__name(onRequestPost3, "onRequestPost3");
var init_sync_sheet = __esm({
  "api/leads/sync-sheet.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions6, "onRequestOptions");
    __name2(onRequestPost3, "onRequestPost");
  }
});
async function onRequestOptions7() {
  return optionsRes();
}
__name(onRequestOptions7, "onRequestOptions7");
async function onRequestPost4(context) {
  const sb = getSupabase(context.env);
  if (!sb) return errRes2("Service unavailable", 503);
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return errRes2("Service unavailable", 503);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return errRes2("Invalid JSON");
  }
  const { token } = body;
  if (!token) return errRes2("token required");
  const rows = await sb.select("velocity_leads", `token=eq.${token}&select=id,quote_amount,is_paid,client_email,status`);
  if (!rows.length) return errRes2("Not found", 404);
  const lead = rows[0];
  if (lead.is_paid) return errRes2("Already paid");
  if (!lead.quote_amount || lead.quote_amount <= 0) return errRes2("No quote set yet");
  if (lead.status === "declined") return errRes2("Project declined");
  const base = context.env.SITE_URL || "https://velocity.calyvent.com";
  const params = new URLSearchParams({
    "payment_method_types[]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(lead.quote_amount),
    "line_items[0][price_data][product_data][name]": "Velocity \u2014 Website Design & Development",
    "line_items[0][price_data][product_data][description]": "Bespoke website by Velocity, a Calyvent studio.",
    "line_items[0][quantity]": "1",
    "mode": "payment",
    "customer_email": lead.client_email || "",
    "success_url": `${base}/dashboard/${token}?paid=1`,
    "cancel_url": `${base}/dashboard/${token}`,
    "metadata[lead_token]": token,
    "metadata[lead_id]": lead.id
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  if (!r.ok) {
    const e = await r.json();
    return errRes2(e.error?.message || "Stripe error", 500);
  }
  const session = await r.json();
  await sb.update("velocity_leads", `token=eq.${token}`, { stripe_session_id: session.id });
  return jsonRes({ url: session.url });
}
__name(onRequestPost4, "onRequestPost4");
var init_checkout = __esm({
  "api/stripe/checkout.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions7, "onRequestOptions");
    __name2(onRequestPost4, "onRequestPost");
  }
});
async function onRequestPost5(context) {
  const sig = context.request.headers.get("stripe-signature");
  const secret = context.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await context.request.text();
  if (secret && sig) {
    const valid = await verifyStripeSignature(rawBody, sig, secret);
    if (!valid) return errRes2("Invalid signature", 400);
  }
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return errRes2("Invalid JSON");
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const token = session.metadata?.lead_token;
    if (token) {
      const sb = getSupabase(context.env);
      if (sb) {
        const rows = await sb.select("velocity_leads", `token=eq.${token}&select=client_email,client_name,full_data,quote_amount`).catch(() => []);
        const lead = rows[0] || {};
        const p1 = lead.full_data && lead.full_data.phase1 || {};
        const email = lead.client_email || p1.email;
        const name = lead.client_name || p1.full_name || "there";
        const amount = lead.quote_amount ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(lead.quote_amount / 100) : "";
        await sb.update("velocity_leads", `token=eq.${token}`, {
          is_paid: true,
          stripe_payment_intent: session.payment_intent || null,
          status: "accepted"
        });
        if (email && context.env.RESEND_API_KEY) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Authorization": `Bearer ${context.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Velocity <client@calyvent.com>",
                to: [email],
                subject: "Payment confirmed",
                html: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#0D0C09;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0C09;min-height:100vh">
<tr><td align="center" style="padding:48px 20px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px">
<tr><td style="padding:0 0 40px">
  <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:400;color:#DEC8B5;letter-spacing:-.02em">Velocity<span style="color:#C49C7B">.</span></span>
  <span style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#565250;margin-left:10px">by Calyvent</span>
</td></tr>
<tr><td style="border-top:1px solid rgba(222,200,181,.08);padding-top:36px">
  <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:30px;color:#DEC8B5;letter-spacing:-.035em;margin:0 0 22px;line-height:1.12">Confirmed,<br>${name}.</h1>
  <p style="font-size:13px;color:#8a8680;line-height:1.95;margin:0 0 18px">Your payment of <strong style="color:#DEC8B5;font-weight:400">${amount}</strong> has been received. Your project is booked and you are in queue.</p>
  <p style="font-size:13px;color:#8a8680;line-height:1.95;margin:0 0 18px">We will be in touch within 24 hours to align on next steps. Your project dashboard is live below.</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 32px"><tr><td style="background:#DEC8B5"><a href="https://velocity.calyvent.com/dashboard/${token}" style="display:block;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#0D0C09;text-decoration:none;padding:13px 30px;font-weight:500">View Dashboard &rarr;</a></td></tr></table>
  <p style="font-size:12px;color:#565250;line-height:1.75;margin:0">Questions? Reply to this email or write to <a href="mailto:client@calyvent.com" style="color:#C49C7B;text-decoration:none">client@calyvent.com</a></p>
</td></tr>
<tr><td style="border-top:1px solid rgba(222,200,181,.06);padding-top:24px;margin-top:40px">
  <p style="font-size:11px;color:#3a3835;letter-spacing:.05em;margin:0;line-height:1.8">Velocity by Calyvent &mdash; velocity.calyvent.com</p>
  <p style="font-size:11px;color:#3a3835;letter-spacing:.04em;margin:8px 0 0;line-height:1.8">&copy; 2026 Calyvent. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`
              })
            });
          } catch (_) {
          }
        }
      }
    }
  }
  return jsonRes({ received: true });
}
__name(onRequestPost5, "onRequestPost5");
async function verifyStripeSignature(payload, header, secret) {
  try {
    const parts = header.split(",");
    const timestamp = parts.find((p2) => p2.startsWith("t=")).split("=")[1];
    const sigHash = parts.find((p2) => p2.startsWith("v1=")).split("=")[1];
    const signed = `${timestamp}.${payload}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const buf = await crypto.subtle.sign("HMAC", key, enc.encode(signed));
    const computed = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return computed === sigHash;
  } catch {
    return false;
  }
}
__name(verifyStripeSignature, "verifyStripeSignature");
var init_webhook = __esm({
  "api/stripe/webhook.js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    __name2(onRequestPost5, "onRequestPost");
    __name2(verifyStripeSignature, "verifyStripeSignature");
  }
});
async function validateViewToken(request, env) {
  const url = new URL(request.url);
  const t = url.searchParams.get("t") || "";
  const hdr = request.headers.get("X-Admin-Secret") || "";
  const kv = env.DATA || env.LEADS;
  if (hdr && env.ADMIN_SECRET) {
    const { timingSafeEqual: timingSafeEqual2 } = await Promise.resolve().then(() => (init_security(), security_exports));
    if (await timingSafeEqual2(hdr, env.ADMIN_SECRET)) return true;
  }
  if (t && kv) {
    const valid = await kv.get(`view_token:${t}`).catch(() => null);
    if (valid) {
      await kv.delete(`view_token:${t}`).catch(() => {
      });
      return true;
    }
  }
  return false;
}
__name(validateViewToken, "validateViewToken");
async function onRequestGet2(context) {
  const ok = await validateViewToken(context.request, context.env);
  if (!ok) {
    return new Response("Unauthorized \u2014 this link has expired or is invalid. Open from the admin panel.", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store"
      }
    });
  }
  const sb = getSupabase(context.env);
  if (!sb) return new Response("Database unavailable", { status: 503 });
  const token = context.params.token;
  const rows = await sb.select("velocity_leads", `token=eq.${token}&select=*`).catch(() => []);
  if (!rows.length) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const lead = rows[0];
  const p1 = lead.full_data && lead.full_data.phase1 || {};
  const p2 = lead.full_data && lead.full_data.phase2 || {};
  const p3 = lead.full_data && lead.full_data.phase3 || {};
  const p4 = lead.full_data && lead.full_data.phase4 || {};
  const p5 = lead.full_data && lead.full_data.phase5 || {};
  const esc = /* @__PURE__ */ __name2((s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), "esc");
  const row = /* @__PURE__ */ __name2((k, v) => v ? `<tr><td style="padding:6px 16px 6px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;font-size:13px;color:#e8ddd3;vertical-align:top">${esc(String(v))}</td></tr>` : "", "row");
  const section = /* @__PURE__ */ __name2((title, rows2) => rows2 ? `<div style="margin:0 0 32px"><div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#C49C7B;margin-bottom:10px">${title}</div><table style="border-collapse:collapse;width:100%">${rows2}</table></div>` : "", "section");
  const insp = (p2.inspiration || []).filter((i) => i.url).map((i) => `<div style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(222,200,181,.07)"><div style="font-size:12px;color:#C49C7B">${esc(i.url)}</div><div style="font-size:12px;color:#888;margin-top:4px">${esc(i.notes || "\u2014")}</div></div>`).join("");
  const anti = (p2.anti_inspiration || []).filter((i) => i.url).map((i) => `<div style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(222,200,181,.07)"><div style="font-size:12px;color:#c08080">${esc(i.url)}</div><div style="font-size:12px;color:#888;margin-top:4px">${esc(i.notes || "\u2014")}</div></div>`).join("");
  const socials = (p1.socials || []).map((s) => `<a href="${esc(s)}" target="_blank" rel="noopener noreferrer" style="color:#C49C7B;font-size:12px;display:block;margin-bottom:4px">${esc(s)}</a>`).join("");
  const domainDisplay = lead.domain_choice === "client_provides" ? "Client connects own domain" : lead.domain_choice === "client_has_needs_setup" ? `Client has domain \u2014 Velocity to configure${lead.domain_name ? " (" + lead.domain_name + ")" : ""}` : lead.domain_choice === "velocity_provides" ? `Velocity to register${lead.domain_name ? " \u2014 " + lead.domain_name : ""}` : lead.domain_choice || "\u2014";
  const aiBrief = `CLIENT: ${lead.client_name || p1.full_name || ""}
COMPANY: ${p1.company_name || ""}
EMAIL: ${lead.client_email || p1.email || ""}
PHONE: ${p1.phone || ""}
DEADLINE: ${lead.due_date || ""}
STATUS: ${lead.status}

BUSINESS CONTEXT:
${p1.context || ""}

WHO IS THIS SITE FOR:
${p2.target_customer || ""}

INSPIRATION:
${(p2.inspiration || []).map((i) => `- ${i.url}${i.notes ? " (" + i.notes + ")" : ""}`).join("\n")}

ANTI-INSPIRATION:
${(p2.anti_inspiration || []).map((i) => `- ${i.url}${i.notes ? " (" + i.notes + ")" : ""}`).join("\n")}

COLORS: Background: ${p3.color_background || ""} / Secondary: ${p3.color_secondary || ""} / Accent: ${p3.color_accent || ""}
ADDITIONAL PALETTE: ${p3.colors_extra || ""}
TYPOGRAPHY: ${p3.fonts || ""}
UPGRADE PERMISSION: ${lead.upgrade_permission ? "YES \u2014 full creative latitude" : "NO \u2014 follow specs"}

MOTTOS/TAGLINES: ${p4.mottos || ""}
COPYRIGHT: ${p4.copyright || ""}
STARTING POINT: ${p4.starting_point || ""} ${p4.existing_url ? "(" + p4.existing_url + ")" : ""}
ASSETS: ${p4.assets_links || ""}
SOCIALS: ${(p1.socials || []).join(", ")}
SOCIAL ICONS ON SITE: ${p1.include_socials ? "Yes" : "No"}
DOMAIN: ${domainDisplay}

ADDITIONAL NOTES: ${p5.additional_notes || ""}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta http-equiv="X-Frame-Options" content="DENY">
<title>Brief \u2014 ${esc(lead.client_name || p1.full_name || "Client")} \u2014 Velocity Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0D0C09;color:#DEC8B5;font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
.topbar{background:rgba(13,12,9,.96);border-bottom:1px solid rgba(222,200,181,.07);padding:14px 40px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
.brand{font-family:'Instrument Serif',Georgia,serif;font-size:1rem;color:#DEC8B5}.brand em{font-style:normal;color:#C49C7B}
.close-btn{font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:#565250;background:none;border:none;cursor:pointer;transition:color .2s}.close-btn:hover{color:#DEC8B5}
.wrap{max-width:820px;margin:0 auto;padding:48px 40px 80px}
.hero{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(2.5rem,5vw,4.5rem);font-weight:400;letter-spacing:-.04em;line-height:1;color:#DEC8B5;margin-bottom:8px}
.sub{font-size:.72rem;color:#565250;letter-spacing:.1em;margin-bottom:40px}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:48px}
.badge{display:inline-flex;font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;padding:.28rem .7rem;border:1px solid}
.ai-block{background:rgba(196,156,123,.05);border:1px solid rgba(196,156,123,.15);padding:20px;margin-bottom:40px;position:relative}
.ai-label{font-size:.58rem;letter-spacing:.18em;text-transform:uppercase;color:#C49C7B;margin-bottom:12px}
.ai-text{font-size:.75rem;color:#8a8680;line-height:1.85;white-space:pre-wrap;font-family:'Inter',sans-serif}
.copy-btn{position:absolute;top:14px;right:14px;font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:#C49C7B;border:1px solid rgba(196,156,123,.25);padding:.28rem .7rem;background:transparent;cursor:pointer;transition:border-color .2s}
.copy-btn:hover{border-color:#C49C7B}
</style>
</head>
<body>
<div class="topbar">
  <span class="brand">Velocity<em>.</em> <span style="font-family:Inter,sans-serif;font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;color:#565250;margin-left:.6rem">Admin \u2014 Brief View</span></span>
  <button class="close-btn" onclick="window.close()">&#x2715; Close</button>
</div>
<div class="wrap">
  <div class="hero">${esc(lead.client_name || p1.full_name || "Unnamed")}<span style="color:#C49C7B">.</span></div>
  <div class="sub">${esc(lead.client_email || p1.email || "")}${lead.submitted_at ? " &mdash; " + new Date(lead.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : " &mdash; Not yet submitted"}</div>
  <div class="badges">
    <span class="badge" style="color:#C49C7B;border-color:rgba(196,156,123,.3)">${lead.status || "pending"}</span>
    ${lead.is_paid ? '<span class="badge" style="color:#8fc98f;border-color:rgba(143,201,143,.3)">Paid</span>' : ""}
    ${lead.upgrade_permission ? '<span class="badge" style="color:#C49C7B;border-color:rgba(196,156,123,.2)">Upgrade Approved</span>' : ""}
    ${lead.quote_amount ? `<span class="badge" style="color:#DEC8B5;border-color:rgba(222,200,181,.13)">${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(lead.quote_amount / 100)}</span>` : ""}
  </div>
  <div class="ai-block">
    <div class="ai-label">AI Build Brief \u2014 Copy &amp; Paste</div>
    <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('aibf').textContent);this.textContent='Copied \u2713';setTimeout(()=>this.textContent='Copy',2000)">Copy</button>
    <pre class="ai-text" id="aibf">${esc(aiBrief)}</pre>
  </div>
  ${section("Identity", row("Full Name", lead.client_name || p1.full_name) + row("Company", p1.company_name) + row("Email", lead.client_email || p1.email) + row("Phone", p1.phone) + row("Deadline", lead.due_date) + row("Submitted", lead.submitted_at ? new Date(lead.submitted_at).toLocaleString() : ""))}
  ${p1.context ? section("Business Context", `<tr><td colspan="2" style="font-size:13px;color:#e8ddd3;line-height:1.8;padding:6px 0;white-space:pre-wrap">${esc(p1.context)}</td></tr>`) : ""}
  ${p2.target_customer ? section("Who Is This Site For", `<tr><td colspan="2" style="font-size:13px;color:#e8ddd3;line-height:1.8;padding:6px 0;white-space:pre-wrap">${esc(p2.target_customer)}</td></tr>`) : ""}
  ${insp ? `<div style="margin:0 0 32px"><div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#C49C7B;margin-bottom:10px">Inspiration</div>${insp}</div>` : ""}
  ${anti ? `<div style="margin:0 0 32px"><div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#C49C7B;margin-bottom:10px">Anti-Inspiration</div>${anti}</div>` : ""}
  ${section("Visual DNA", row("Background", p3.color_background) + row("Secondary", p3.color_secondary) + row("Accent", p3.color_accent) + row("Additional Palette", p3.colors_extra) + row("Typography", p3.fonts) + row("Upgrade Permission", lead.upgrade_permission ? "Yes \u2014 full creative latitude" : "No \u2014 follow specs"))}
  ${section("Logistics", row("Mottos/Taglines", p4.mottos) + row("Copyright", p4.copyright) + row("Starting Point", p4.starting_point) + row("Existing URL", p4.existing_url) + row("Assets", p4.assets_links))}
  ${socials ? section("Socials", `<tr><td colspan="2" style="padding:6px 0">${socials}${row("Show Icons", p1.include_socials ? "Yes" : "No")}</td></tr>`) : ""}
  ${section("Domain", row("Setup", domainDisplay))}
  ${p5.additional_notes ? section("Additional Notes", `<tr><td colspan="2" style="font-size:13px;color:#e8ddd3;line-height:1.8;padding:6px 0;white-space:pre-wrap">${esc(p5.additional_notes)}</td></tr>`) : ""}
  ${lead.site_link ? `<div style="margin:0 0 32px"><div style="font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#C49C7B;margin-bottom:10px">Finished Site</div><a href="${esc(lead.site_link)}" target="_blank" rel="noopener noreferrer" style="color:#C49C7B;font-size:14px">${esc(lead.site_link)}</a></div>` : ""}
</div>
</body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer"
    }
  });
}
__name(onRequestGet2, "onRequestGet2");
var init_token = __esm({
  "admin/client/[token].js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(validateViewToken, "validateViewToken");
    __name2(onRequestGet2, "onRequestGet");
  }
});
async function onRequestOptions8() {
  return optionsRes();
}
__name(onRequestOptions8, "onRequestOptions8");
async function onRequestGet3(context) {
  const sb = getSupabase(context.env);
  if (!sb) return errRes2("Supabase not configured", 500);
  const token = context.params.token;
  if (!token) return errRes2("Token required", 400);
  let rows;
  try {
    rows = await sb.select("velocity_leads", `token=eq.${token}&select=id,token,status,full_data,submitted_at,first_submitted_at,is_locked,quote_amount,is_paid,upgrade_permission,due_date,client_name,client_email,created_at,admin_comment,site_link,domain_choice,domain_name,email_verified,scope_sent_at,scope_accepted,scope_accepted_at,scope_text`);
  } catch (_) {
    return errRes2("Service unavailable", 503);
  }
  if (!rows.length) return errRes2("Not found", 404);
  const lead = rows[0];
  const anchor = lead.first_submitted_at || lead.submitted_at;
  if (!lead.is_locked && anchor) {
    if (Date.now() - new Date(anchor).getTime() > 864e5) lead.is_locked = true;
  }
  if (lead.admin_comment && lead.admin_comment.created_at) {
    const age = Date.now() - new Date(lead.admin_comment.created_at).getTime();
    if (age > 864e5) lead.admin_comment = null;
  }
  return jsonRes(lead);
}
__name(onRequestGet3, "onRequestGet3");
async function onRequestPatch2(context) {
  const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
  const sb = getSupabase(context.env);
  if (!sb) return errRes2("Supabase not configured", 500);
  const token = context.params.token;
  if (!token) return errRes2("Token required", 400);
  const rows = await sb.select("velocity_leads", `token=eq.${token}&select=id,submitted_at,first_submitted_at,is_locked,status`);
  if (!rows.length) return errRes2("Not found", 404);
  const lead = rows[0];
  const anchor = lead.first_submitted_at || lead.submitted_at;
  if (lead.is_locked) return errRes2("Submission is locked", 403);
  if (anchor && Date.now() - new Date(anchor).getTime() > 864e5) {
    await sb.update("velocity_leads", `token=eq.${token}`, { is_locked: true });
    return errRes2("Submission window has closed", 403);
  }
  if (["in_progress", "completed"].includes(lead.status)) {
    return errRes2("Project is in progress \u2014 contact client@calyvent.com to request changes", 403);
  }
  let body;
  try {
    body = await context.request.json();
  } catch {
    return errRes2("Invalid JSON");
  }
  const allowed = ["full_data", "submitted_at", "due_date", "client_name", "client_email", "upgrade_permission", "domain_choice", "domain_name", "email_verified", "personal_email", "personal_phone", "business_name", "business_type", "business_email", "business_phone", "business_address", "terms_accepted", "terms_accepted_at", "scope_accepted", "scope_accepted_at"];
  const patch = {};
  for (const key of allowed) {
    if (body[key] !== void 0) patch[key] = body[key];
  }
  if (body.submitted_at && !lead.first_submitted_at) {
    patch.first_submitted_at = body.submitted_at;
  }
  if (!Object.keys(patch).length) return errRes2("No valid fields to update");
  const updated = await sb.update("velocity_leads", `token=eq.${token}`, patch);
  if (patch.submitted_at && context.env.SHEETS_WEBHOOK_URL && context.env.ADMIN_SECRET) {
    try {
      context.waitUntil(fetch(new URL(context.request.url).origin + "/api/leads/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Secret": context.env.ADMIN_SECRET },
        body: JSON.stringify({ token })
      }));
    } catch (_) {
    }
  }
  if (patch.submitted_at && context.env.RESEND_API_KEY) {
    try {
      const nm = (patch.client_name || "").replace(/</g, "&lt;");
      const em = patch.client_email || "";
      const au = (context.env.SITE_URL || "https://velocity.calyvent.com") + "/admin";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + context.env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Velocity System <client@calyvent.com>",
          to: ["atelier@calyvent.com"],
          subject: "Brief submitted" + (nm ? ": " + nm : ""),
          text: "A brief was submitted." + (nm ? " Client: " + nm : "") + (em ? " Email: " + em : "") + " Admin: " + au
        })
      });
    } catch (_) {
    }
  }
  return jsonRes({ success: true, lead: Array.isArray(updated) ? updated[0] : updated });
}
__name(onRequestPatch2, "onRequestPatch2");
var init_token2 = __esm({
  "api/leads/[token].js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions8, "onRequestOptions");
    __name2(onRequestGet3, "onRequestGet");
    __name2(onRequestPatch2, "onRequestPatch");
  }
});
async function onRequestOptions9() {
  return secureOptions();
}
__name(onRequestOptions9, "onRequestOptions9");
async function onRequestGet4(context) {
  const t = context.params.token;
  if (!t) return secureErr("Token required", 400);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  const rows = await sb.select("velocity_messages", "lead_token=eq." + t + "&order=created_at.asc").catch(() => []);
  return secureJson(rows);
}
__name(onRequestGet4, "onRequestGet4");
async function onRequestPost6(context) {
  const t = context.params.token;
  if (!t) return secureErr("Token required", 400);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return secureErr("Invalid request");
  }
  const { message } = body;
  if (!message || !message.trim()) return secureErr("Message required");
  if (message.trim().length > 4e3) return secureErr("Message too long");
  const auth = await checkAdminAuth(context.request, context.env);
  const sender = auth.ok ? "admin" : "client";
  const leads = await sb.select("velocity_leads", "token=eq." + t + "&select=id,client_email,client_name,status").catch(() => []);
  if (!leads.length) return secureErr("Not found", 404);
  const lead = leads[0];
  const msg = await sb.insert("velocity_messages", { lead_token: t, sender, body: message.trim() }).catch(() => null);
  if (!msg) return secureErr("Failed to send", 500);
  const base = context.env.SITE_URL || "https://velocity.calyvent.com";
  const adminEmail = "atelier@calyvent.com";
  if (context.env.RESEND_API_KEY) {
    try {
      const to = sender === "admin" ? lead.client_email : adminEmail;
      const subj = sender === "admin" ? "New message from your studio." : "Client message: " + (lead.client_name || lead.client_email || t);
      const link = sender === "admin" ? base + "/dashboard/" + t : base + "/admin";
      const notice = sender === "client" ? message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") : "You have a new message. Visit your dashboard to read and reply.";
      if (to) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: "Bearer " + context.env.RESEND_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Velocity.\u2122 <client@calyvent.com>",
            to: [to],
            subject: subj,
            html: '<div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;padding:48px 28px;background:#0D0C09;color:#DEC8B5"><div style="font-family:Georgia,serif;font-size:17px;margin-bottom:32px">Velocity<span style="color:#C49C7B">.</span></div><h2 style="font-family:Georgia,serif;font-weight:400;font-size:22px;color:#DEC8B5;margin:0 0 16px">New message.</h2><p style="font-size:13px;color:#8a8680;line-height:1.9;margin:0 0 24px">' + notice + '</p><table cellpadding="0" cellspacing="0"><tr><td style="background:#DEC8B5"><a href="' + link + '" style="display:block;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#0D0C09;text-decoration:none;padding:12px 28px">Open now &rarr;</a></td></tr></table><p style="font-size:11px;color:#3a3835;margin-top:32px">Velocity.\u2122 by Calyvent &mdash; velocity.calyvent.com</p></div>'
          })
        });
      }
    } catch (_) {
    }
  }
  return secureJson({ success: true });
}
__name(onRequestPost6, "onRequestPost6");
async function onRequestPatch3(context) {
  const t = context.params.token;
  if (!t) return secureErr("Token required", 400);
  const sb = getSupabase(context.env);
  if (!sb) return secureErr("Service unavailable", 503);
  let body;
  try {
    body = await context.request.json();
  } catch {
    return secureErr("Invalid request");
  }
  const m = body.reader === "admin" ? "client" : "admin";
  await sb.update("velocity_messages", "lead_token=eq." + t + "&sender=eq." + m + "&read_at=is.null", { read_at: (/* @__PURE__ */ new Date()).toISOString() }).catch(() => {
  });
  return secureJson({ success: true });
}
__name(onRequestPatch3, "onRequestPatch3");
var init_token3 = __esm({
  "api/messages/[token].js"() {
    init_functionsRoutes_0_8101214893995591();
    init_supabase();
    init_security();
    __name2(onRequestOptions9, "onRequestOptions");
    __name2(onRequestGet4, "onRequestGet");
    __name2(onRequestPost6, "onRequestPost");
    __name2(onRequestPatch3, "onRequestPatch");
  }
});
async function onRequestGet5(context) {
  const url = new URL(context.request.url);
  url.pathname = "/_dashboard.html";
  const res = await fetch(url.toString());
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, max-age=0, must-revalidate",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' fonts.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none';",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(onRequestGet5, "onRequestGet5");
var init_token4 = __esm({
  "dashboard/[token].js"() {
    init_functionsRoutes_0_8101214893995591();
    __name2(onRequestGet5, "onRequestGet");
  }
});
async function onRequestGet6(context) {
  const url = new URL(context.request.url);
  url.pathname = "/_onboard.html";
  const res = await fetch(url.toString());
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, max-age=0, must-revalidate",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' fonts.googleapis.com static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none';",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(onRequestGet6, "onRequestGet6");
var init_token5 = __esm({
  "onboard/[token].js"() {
    init_functionsRoutes_0_8101214893995591();
    __name2(onRequestGet6, "onRequestGet");
  }
});
async function onRequestGet7(context) {
  const kv = context.env.DATA || context.env.LEADS;
  const projectId = context.params.id;
  if (!kv || !projectId) {
    return new Response("Not found", { status: 404 });
  }
  const html = await kv.get(`preview:${projectId}`, { cacheTtl: 300 });
  if (!html) {
    return new Response("Preview not found", { status: 404 });
  }
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Content-Security-Policy": PREVIEW_CSP,
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY"
    }
  });
}
__name(onRequestGet7, "onRequestGet7");
async function onRequestOptions10() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400"
    }
  });
}
__name(onRequestOptions10, "onRequestOptions10");
var PREVIEW_CSP;
var init_id = __esm({
  "preview/[id].js"() {
    init_functionsRoutes_0_8101214893995591();
    PREVIEW_CSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com",
      "connect-src 'self'",
      "frame-ancestors 'none'"
    ].join("; ");
    __name2(onRequestGet7, "onRequestGet");
    __name2(onRequestOptions10, "onRequestOptions");
  }
});
async function onRequestGet8(context) {
  const url = new URL(context.request.url);
  url.pathname = "/scope/index.html";
  const res = await fetch(url.toString());
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(onRequestGet8, "onRequestGet8");
var init_token6 = __esm({
  "scope/[token].js"() {
    init_functionsRoutes_0_8101214893995591();
    __name2(onRequestGet8, "onRequestGet");
  }
});
var routes;
var init_functionsRoutes_0_8101214893995591 = __esm({
  "../.wrangler/tmp/pages-gY7xYl/functionsRoutes-0.8101214893995591.mjs"() {
    init_temp_token();
    init_temp_token();
    init_admin_update();
    init_admin_update();
    init_create();
    init_create();
    init_delete();
    init_delete();
    init_list();
    init_list();
    init_sync_sheet();
    init_sync_sheet();
    init_checkout();
    init_checkout();
    init_webhook();
    init_token();
    init_token2();
    init_token2();
    init_token2();
    init_token3();
    init_token3();
    init_token3();
    init_token3();
    init_token4();
    init_token5();
    init_id();
    init_id();
    init_token6();
    routes = [
      {
        routePath: "/api/admin/temp-token",
        mountPath: "/api/admin",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions]
      },
      {
        routePath: "/api/admin/temp-token",
        mountPath: "/api/admin",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/leads/admin-update",
        mountPath: "/api/leads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions2]
      },
      {
        routePath: "/api/leads/admin-update",
        mountPath: "/api/leads",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch]
      },
      {
        routePath: "/api/leads/create",
        mountPath: "/api/leads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions3]
      },
      {
        routePath: "/api/leads/create",
        mountPath: "/api/leads",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/leads/delete",
        mountPath: "/api/leads",
        method: "DELETE",
        middlewares: [],
        modules: [onRequestDelete]
      },
      {
        routePath: "/api/leads/delete",
        mountPath: "/api/leads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions4]
      },
      {
        routePath: "/api/leads/list",
        mountPath: "/api/leads",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/leads/list",
        mountPath: "/api/leads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions5]
      },
      {
        routePath: "/api/leads/sync-sheet",
        mountPath: "/api/leads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions6]
      },
      {
        routePath: "/api/leads/sync-sheet",
        mountPath: "/api/leads",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/api/stripe/checkout",
        mountPath: "/api/stripe",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions7]
      },
      {
        routePath: "/api/stripe/checkout",
        mountPath: "/api/stripe",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost4]
      },
      {
        routePath: "/api/stripe/webhook",
        mountPath: "/api/stripe",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost5]
      },
      {
        routePath: "/admin/client/:token",
        mountPath: "/admin/client",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet2]
      },
      {
        routePath: "/api/leads/:token",
        mountPath: "/api/leads",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet3]
      },
      {
        routePath: "/api/leads/:token",
        mountPath: "/api/leads",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions8]
      },
      {
        routePath: "/api/leads/:token",
        mountPath: "/api/leads",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch2]
      },
      {
        routePath: "/api/messages/:token",
        mountPath: "/api/messages",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet4]
      },
      {
        routePath: "/api/messages/:token",
        mountPath: "/api/messages",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions9]
      },
      {
        routePath: "/api/messages/:token",
        mountPath: "/api/messages",
        method: "PATCH",
        middlewares: [],
        modules: [onRequestPatch3]
      },
      {
        routePath: "/api/messages/:token",
        mountPath: "/api/messages",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost6]
      },
      {
        routePath: "/dashboard/:token",
        mountPath: "/dashboard",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet5]
      },
      {
        routePath: "/onboard/:token",
        mountPath: "/onboard",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet6]
      },
      {
        routePath: "/preview/:id",
        mountPath: "/preview",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet7]
      },
      {
        routePath: "/preview/:id",
        mountPath: "/preview",
        method: "OPTIONS",
        middlewares: [],
        modules: [onRequestOptions10]
      },
      {
        routePath: "/scope/:token",
        mountPath: "/scope",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet8]
      }
    ];
  }
});
init_functionsRoutes_0_8101214893995591();
init_functionsRoutes_0_8101214893995591();
init_functionsRoutes_0_8101214893995591();
init_functionsRoutes_0_8101214893995591();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_8101214893995591();
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_8101214893995591();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_8101214893995591();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// ../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// ../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-57WVKh/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// ../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-57WVKh/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.19813631199542037.js.map
