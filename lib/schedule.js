export function computeNextRun(task, fromDate = new Date()) {
  const { schedule_type, hourly_minute, daily_time, interval_minutes } = task;

  if (schedule_type === 'hourly') {
    const next = new Date(fromDate);
    next.setSeconds(0, 0);
    if (next.getMinutes() >= Number(hourly_minute)) {
      next.setHours(next.getHours() + 1);
    }
    next.setMinutes(Number(hourly_minute));
    return next;
  }

  if (schedule_type === 'daily') {
    const [hh, mm] = daily_time.split(':').map(Number);
    const next = new Date(fromDate);
    next.setSeconds(0, 0);
    next.setHours(hh, mm);
    if (next <= fromDate) next.setDate(next.getDate() + 1);
    return next;
  }

  if (schedule_type === 'adhoc_once') {
    return task.run_count > 0 ? null : new Date(fromDate);
  }

  if (schedule_type === 'adhoc_n_times') {
    if (task.run_count >= Number(task.max_runs)) return null;
    // First run: immediately; subsequent runs: interval_minutes after last run
    if (Number(task.run_count) === 0) return new Date(fromDate);
    return new Date(fromDate.getTime() + Number(interval_minutes) * 60 * 1000);
  }

  return null;
}

const VALID_CATEGORIES = ['production', 'experimental', 'private'];

export function validateTask(data) {
  const errors = {};

  if (!data.name?.trim()) errors.name = 'Name is required.';
  if (!data.prompt?.trim()) errors.prompt = 'Prompt is required.';
  if (!data.schedule_type) errors.schedule_type = 'Schedule type is required.';
  if (data.category && !VALID_CATEGORIES.includes(data.category)) errors.category = 'Invalid category.';

  if (data.schedule_type === 'hourly') {
    const m = parseInt(data.hourly_minute);
    if (isNaN(m) || m < 0 || m > 59)
      errors.hourly_minute = 'Enter a minute value between 0 and 59.';
  }

  if (data.schedule_type === 'daily') {
    if (!data.daily_time) errors.daily_time = 'Time of day is required.';
  }

  if (data.schedule_type === 'adhoc_n_times') {
    const runs     = parseInt(data.max_runs);
    const interval = parseInt(data.interval_minutes);
    if (isNaN(runs) || runs < 1)         errors.max_runs         = 'Must be at least 1 run.';
    if (isNaN(interval) || interval < 1) errors.interval_minutes = 'Must be at least 1 minute.';
  }

  return errors;
}

export function scheduleLabel(task) {
  const m = String(task.hourly_minute ?? 0).padStart(2, '0');
  if (task.schedule_type === 'hourly')
    return `Every hour at :${m}`;
  if (task.schedule_type === 'daily')
    return `Daily at ${task.daily_time?.slice(0, 5) ?? '—'}`;
  if (task.schedule_type === 'adhoc_once')
    return 'Run once (immediately)';
  if (task.schedule_type === 'adhoc_n_times') {
    const interval = Number(task.interval_minutes);
    const intervalLabel = interval >= 60
      ? `${interval / 60}h`
      : `${interval}m`;
    return `${task.max_runs}× every ${intervalLabel}`;
  }
  return task.schedule_type;
}
