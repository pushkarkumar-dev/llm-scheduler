import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [row] = await query(
      `SELECT e.*, t.name AS task_name
       FROM task_executions e JOIN tasks t ON t.id = e.task_id
       WHERE e.id = ?`,
      [id]
    );
    if (!row) return Response.json({ error: 'Execution not found.' }, { status: 404 });
    return Response.json(row);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const [row] = await query('SELECT id FROM task_executions WHERE id=?', [id]);
    if (!row) return Response.json({ error: 'Execution not found.' }, { status: 404 });
    await query('DELETE FROM task_executions WHERE id=?', [id]);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
