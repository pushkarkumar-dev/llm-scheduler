import { query } from '@/lib/db';
import { runTask } from '@/lib/runner';

const MAX_INPUT = 5000;

export async function POST(request, { params }) {
  const { id } = await params;

  const [task] = await query('SELECT id FROM tasks WHERE id=?', [id]);
  if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });

  // Optional run-time addendum. Body may be empty for tasks that don't accept input.
  let input = '';
  try {
    const body = await request.json();
    if (body && typeof body.input === 'string') input = body.input.slice(0, MAX_INPUT);
  } catch {
    // no body — fine, runs with the base prompt
  }

  try {
    const result = await runTask(Number(id), 'manual', { input });
    return Response.json({ ok: true, execId: result.execId, success: result.success, error: result.error ?? null });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
