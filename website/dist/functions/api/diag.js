export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    secret: context.env.ADMIN_SECRET, 
    supabase: context.env.SUPABASE_URL,
    service_key: context.env.SUPABASE_SERVICE_KEY
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
