/**
 * GET /api/projects — List user's projects
 * POST /api/projects — Create a new project
 */
import { json, err, corsPreflightResponse, getSession, generateId, getKV } from '../../_lib/helpers.js';

export async function onRequestGet(context) {
  const kv = getKV(context.env);
  if (!kv) return err('Storage not configured', 500);

  const session = await getSession(kv, context.request);
  if (!session) return err('Not authenticated', 401);

  const projectIds = (await kv.get('user_projects:' + session.email, { type: 'json' })) || [];
  const projects = [];

  for (const id of projectIds) {
    try {
      const p = await kv.get('project:' + id, { type: 'json' });
      if (p) projects.push(p);
    } catch {}
  }

  projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return json({ projects });
}

export async function onRequestPost(context) {
  const kv = getKV(context.env);
  if (!kv) return err('Storage not configured', 500);

  const session = await getSession(kv, context.request);
  if (!session) return err('Not authenticated', 401);

  let body;
  try { body = await context.request.json(); } catch { return err('Invalid JSON'); }

  const name = (body.name || '').trim();
  if (!name) return err('Project name is required');

  const projectId = generateId();
  const project = {
    id: projectId,
    user_email: session.email,
    name,
    status: 'queued',
    plan: body.plan || 'landing',
    preview_url: null,
    created_at: new Date().toISOString(),
  };
  await kv.put('project:' + projectId, JSON.stringify(project), { expirationTtl: 86400 * 365 });

  const list = (await kv.get('user_projects:' + session.email, { type: 'json' })) || [];
  list.push(projectId);
  await kv.put('user_projects:' + session.email, JSON.stringify(list), { expirationTtl: 86400 * 365 });

  return json({ success: true, project });
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}
