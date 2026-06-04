import { query } from '@/lib/db';
import { validateTask, computeNextRun } from '@/lib/schedule';

export async function GET() {
  try {
    const tasks = await query(
      `SELECT t.*,
        (SELECT status FROM task_executions WHERE task_id = t.id ORDER BY created_at DESC LIMIT 1) AS last_exec_status
       FROM tasks t ORDER BY t.created_at DESC`
    );
    return Response.json(tasks);
  } catch (err) {
    console.error('[GET /api/tasks]', err);
    return Response.json({ error: 'Failed to fetch tasks.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const errors = validateTask(data);
    if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

    const nextRun = computeNextRun({ ...data, run_count: 0 });

    const acceptsInput = data.accepts_input ? 1 : 0;
    const category = data.category ?? 'experimental';
    const result = await query(
      `INSERT INTO tasks (name, description, prompt, model, schedule_type,
        hourly_minute, daily_time, interval_minutes, max_runs, category, accepts_input, input_label, next_run_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        nextRun,
      ]
    );

    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return Response.json(task, { status: 201 });
  } catch (err) {
    console.error('[POST /api/tasks]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
