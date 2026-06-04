import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const status = searchParams.get('status');
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit  = 25;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (taskId) { conditions.push('e.task_id = ?'); params.push(taskId); }
    if (status)  { conditions.push('e.status = ?');  params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [{ total }] = await query(
      `SELECT COUNT(*) AS total FROM task_executions e ${where}`,
      params
    );

    const rows = await query(
      `SELECT e.*, t.name AS task_name
       FROM task_executions e
       JOIN tasks t ON t.id = e.task_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    return Response.json({ rows, total, page, limit });
  } catch (err) {
    console.error('[GET /api/executions]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
