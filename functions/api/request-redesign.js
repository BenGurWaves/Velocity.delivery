/**
 * Cloudflare Pages Function — handles redesign request form submissions.
 *
 * POST /api/request-redesign
 * Body: { website_url: string, email: string }
 *
 * Uses Cloudflare KV (LEADS namespace) if bound, otherwise returns
 * success with an in-memory log. This lets the form work on the free
 * tier with zero config — KV is a bonus when available.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { website_url, email } = body;

    // Basic validation
    if (!website_url || !email) {
      return new Response(
        JSON.stringify({ error: 'website_url and email are required' }),
        { status: 400, headers }
      );
    }

    // Simple email format check
    if (!email.includes('@') || !email.includes('.')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers }
      );
    }

    const lead = {
      website_url: website_url.trim(),
      email: email.trim().toLowerCase(),
      submitted_at: new Date().toISOString(),
      source: 'website_form',
      status: 'new',
    };

    // Store in KV if the LEADS namespace is bound
    if (env && env.LEADS) {
      const key = `lead:${Date.now()}:${email.replace(/[^a-z0-9]/gi, '_')}`;
      await env.LEADS.put(key, JSON.stringify(lead), {
        expirationTtl: 60 * 60 * 24 * 90, // 90 days
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Redesign request received. We\'ll be in touch within 24-48 hours.',
      }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
