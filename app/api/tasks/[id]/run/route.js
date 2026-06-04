import { query } from '@/lib/db';
import { runTask } from '@/lib/runner';

export async function POST(request, { params }) {
  const { id } = await params;

  const [task] = await query('SELECT id FROM tasks WHERE id=?', [id]);
  if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });

  try {
    const result = await runTask(Number(id), 'manual');
    return Response.json({ ok: true, execId: result.execId, success: result.success, error: result.error ?? null });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
