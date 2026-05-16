/**
 * GET /convert/:token
 * Serves the Unified Conversion Screen SPA shell.
 * Injects the Stripe publishable key into the page for Payment Elements.
 */
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/_convert.html';
  const res = await fetch(url.toString());
  let html = await res.text();

  // Inject Stripe publishable key into the page
  const pk = context.env.STRIPE_PUBLISHABLE_KEY || '';
  html = html.replace('__STRIPE_PK__', pk);

  return new Response(html, {
    status: res.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' js.stripe.com",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "font-src 'self' fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' api.stripe.com",
        "frame-src js.stripe.com",
        "frame-ancestors 'none'",
      ].join('; ') + ';',
    },
  });
}
