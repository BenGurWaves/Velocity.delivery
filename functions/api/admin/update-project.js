/**
 * POST /api/admin/update-project
 * Admin endpoint to update project status, preview URL, name.
 * Body: { project_id, status?, preview_url?, name? }
 * Requires ADMIN_KEY header.
 */
import { json, err, corsPreflightResponse, getKV } from '../../_lib/helpers.js';

export async function onRequestPost(context) {
  const kv = getKV(context.env);
  if (!kv) return err('Storage not configured', 500);

  const adminKey = context.env.ADMIN_KEY;
  const providedKey = context.request.headers.get('X-Admin-Key') || '';
  if (!adminKey || providedKey !== adminKey) return err('Unauthorized', 403);

  let body;
  try { body = await context.request.json(); } catch { return err('Invalid JSON'); }

  const projectId = body.project_id;
  if (!projectId) return err('project_id is required');

  const project = await kv.get('project:' + projectId, { type: 'json' });
  if (!project) return err('Project not found', 404);

  const validStatuses = ['queued', 'in-progress', 'review', 'live'];
  if (body.status) {
    if (!validStatuses.includes(body.status)) return err('Invalid status. Use: ' + validStatuses.join(', '));
    project.status = body.status;
  }
  if (body.preview_url !== undefined) project.preview_url = body.preview_url;
  if (body.name) project.name = body.name;
  project.updated_at = new Date().toISOString();

  await kv.put('project:' + projectId, JSON.stringify(project), { expirationTtl: 86400 * 365 });

  return json({ success: true, project });
}

export async function onRequestOptions() {
  return corsPreflightResponse();
}
