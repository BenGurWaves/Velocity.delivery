/**
 * GET /scope/:token
 * Serves the scope signing page SPA shell.
 */
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/scope/index.html';
  const res = await fetch(url.toString());
  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
