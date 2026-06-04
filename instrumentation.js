export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { default: cron } = await import('node-cron');
  const { query } = await import('./lib/db.js');
  const { runTask } = await import('./lib/runner.js');

  let isTicking = false;

  cron.schedule('* * * * *', async () => {
    if (isTicking) return;
    isTicking = true;

    try {
      const dueTasks = await query(
        `SELECT * FROM tasks
         WHERE status = 'active'
           AND next_run_at IS NOT NULL
           AND next_run_at <= NOW()`
      );

      for (const task of dueTasks) {
        try {
          await runTask(task.id, 'schedule');
        } catch (err) {
          console.error(`[scheduler] runTask(${task.id}) threw:`, err.message);
        }
      }
    } catch (err) {
      console.error('[scheduler] tick failed:', err.message);
    } finally {
      isTicking = false;
    }
  });

  console.log('[scheduler] cron tick registered — runs every minute');
}
