/**
 * GET /onboard/:token
 * Serves the onboarding SPA shell without any URL redirect.
 * Using a Function bypasses Cloudflare Pages' canonical URL normalization.
 */
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/_onboard.html';
  const res = await fetch(url.toString(), { headers: context.request.headers });
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
