export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/_scope.html';
  const res = await fetch(url.toString());
  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
