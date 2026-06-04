import { query } from './db.js';
import { callLLM } from './llm.js';
import { computeNextRun } from './schedule.js';

export async function runTask(taskId, trigger = 'schedule') {
  const [task] = await query('SELECT * FROM tasks WHERE id=?', [taskId]);
  if (!task) throw new Error(`Task ${taskId} not found.`);

  const startedAt = new Date();

  const execResult = await query(
    `INSERT INTO task_executions (task_id, status, \`trigger\`, prompt_sent, started_at)
     VALUES (?, 'running', ?, ?, ?)`,
    [taskId, trigger, task.prompt, startedAt]
  );
  const execId = execResult.insertId;

  let success = false;
  let response = null;
  let error = null;

  try {
    response = await callLLM({ prompt: task.prompt, model: task.model || null });
    success = true;
  } catch (err) {
    error = err.message;
  }

  const finishedAt = new Date();
  const durationMs = finishedAt - startedAt;

  await query(
    `UPDATE task_executions
     SET status=?, response=?, error=?, finished_at=?, duration_ms=?
     WHERE id=?`,
    [success ? 'success' : 'failed', response, error, finishedAt, durationMs, execId]
  );

  // Manual runs never affect scheduling state — always allowed, never completes the task.
  // Only the scheduler tick advances scheduling state.
  if (trigger === 'manual') {
    await query('UPDATE tasks SET run_count = run_count + 1 WHERE id=?', [taskId]);
    return { execId, success, error };
  }

  // Scheduled run: recompute status and next_run_at per schedule rules.
  const newRunCount = task.run_count + 1;
  let newStatus = task.status;
  let nextRunAt = null;

  if (task.schedule_type === 'adhoc_once') {
    newStatus = 'completed';
  } else if (task.schedule_type === 'adhoc_n_times') {
    if (newRunCount >= task.max_runs) {
      newStatus = 'completed';
    } else {
      nextRunAt = computeNextRun({ ...task, run_count: newRunCount }, new Date());
    }
  } else {
    nextRunAt = computeNextRun(task, new Date());
  }

  await query(
    'UPDATE tasks SET run_count=?, status=?, next_run_at=? WHERE id=?',
    [newRunCount, newStatus, nextRunAt, taskId]
  );

  return { execId, success, error };
}
