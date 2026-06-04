import { query } from '@/lib/db';
import { validateTask, computeNextRun } from '@/lib/schedule';

async function getTask(id) {
  const [task] = await query('SELECT * FROM tasks WHERE id = ?', [id]);
  return task ?? null;
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });
    return Response.json(task);
  } catch (err) {
    console.error('[GET /api/tasks/[id]]', err);
    return Response.json({ error: 'Failed to fetch task.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });

    const data = await request.json();

    // Handle pause/resume toggle separately
    if (data.action === 'pause') {
      await query('UPDATE tasks SET status=?, next_run_at=NULL WHERE id=?', ['paused', id]);
      return Response.json(await getTask(id));
    }
    if (data.action === 'resume') {
      const nextRun = computeNextRun({ ...task, status: 'active' });
      await query('UPDATE tasks SET status=?, next_run_at=? WHERE id=?', ['active', nextRun, id]);
      return Response.json(await getTask(id));
    }

    const errors = validateTask(data);
    if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

    // Editing a completed task re-activates it with a fresh schedule.
    // run_count resets only for adhoc_n_times so it can run max_runs times again.
    const reactivating = task.status === 'completed';
    const newRunCount  = reactivating && data.schedule_type === 'adhoc_n_times' ? 0 : task.run_count;
    const newStatus    = reactivating ? 'active' : task.status;
    const nextRun      = newStatus === 'paused'
      ? null
      : computeNextRun({ ...data, run_count: newRunCount });

    const acceptsInput = data.accepts_input ? 1 : 0;
    const category = data.category ?? task.category ?? 'experimental';
    await query(
      `UPDATE tasks SET name=?, description=?, prompt=?, model=?, schedule_type=?,
        hourly_minute=?, daily_time=?, interval_minutes=?, max_runs=?, category=?, accepts_input=?, input_label=?, run_count=?, status=?, next_run_at=?
       WHERE id=?`,
      [
        data.name.trim(),
        data.description?.trim() || null,
        data.prompt.trim(),
        data.model?.trim() || null,
        data.schedule_type,
        data.hourly_minute ?? null,
        data.daily_time ?? null,
        data.interval_minutes ?? null,
        data.max_runs ?? null,
        category,
        acceptsInput,
        acceptsInput ? (data.input_label?.trim() || null) : null,
        newRunCount,
        newStatus,
        nextRun,
        id,
      ]
    );

    return Response.json(await getTask(id));
  } catch (err) {
    console.error('[PUT /api/tasks/[id]]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const task = await getTask(id);
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });
    await query('DELETE FROM tasks WHERE id=?', [id]);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/tasks/[id]]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
