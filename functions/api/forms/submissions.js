/**
 * GET /api/forms/submissions — Admin only.
 * Reads form submissions from the manifest (write-efficient design).
 * 
 * Query params:
 *   - site_id: Filter to specific site (optional)
 *   - limit: Max submissions to return (default 100, max 500)
 *   - since: ISO date string to filter submissions after this date
 * 
 * Uses cacheTtl to minimize KV reads.
 */
import { getKV } from '../../_lib/helpers.js';

function isAdmin(request, env) {
  const secret = request.headers.get('X-Admin-Secret') || '';
  return secret && secret === env.ADMIN_SECRET;
}

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function errRes(msg, status = 400) {
  return jsonRes({ error: msg }, status);
}

function optionsRes() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
    },
  });
}

export async function onRequestOptions() { return optionsRes(); }

export async function onRequestGet(context) {
  if (!isAdmin(context.request, context.env)) {
    return errRes('Unauthorized', 401);
  }

  const kv = getKV(context.env);
  if (!kv) return errRes('Storage not configured', 500);

  const url = new URL(context.request.url);
  const siteId = url.searchParams.get('site_id') || '';
  let limit = parseInt(url.searchParams.get('limit') || '100', 10);
  if (limit > 500) limit = 500;
  const since = url.searchParams.get('since');
  const sinceTime = since ? new Date(since).getTime() : 0;

  try {
    // Read from single manifest key with cacheTtl (5 min cache)
    const manifest = await kv.get('admin:submissions_manifest', { 
      type: 'json', 
      cacheTtl: 300 
    });

    if (!manifest) {
      return jsonRes({ submissions: [], total: 0, from_manifest: true });
    }

    let submissions = [];

    if (siteId) {
      // Return site-specific submissions
      submissions = (manifest.by_site && manifest.by_site[siteId]) || [];
    } else {
      // Return global submissions list
      submissions = manifest.submissions || [];
    }

    // Filter by date if requested
    if (sinceTime > 0) {
      submissions = submissions.filter(s => new Date(s.submitted_at).getTime() > sinceTime);
    }

    // Apply limit
    const total = submissions.length;
    submissions = submissions.slice(0, limit);

    return jsonRes({ 
      submissions, 
      total,
      returned: submissions.length,
      site_id: siteId || null,
      from_manifest: true,
      manifest_updated_at: manifest.updated_at || null,
    });
  } catch (e) {
    return errRes('Failed to read submissions: ' + e.message, 500);
  }
}
