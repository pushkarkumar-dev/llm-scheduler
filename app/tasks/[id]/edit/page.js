import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import TaskForm from '@/components/TaskForm';

export default async function EditTaskPage({ params }) {
  const { id } = await params;
  const [task] = await query('SELECT * FROM tasks WHERE id=?', [id]);
  if (!task) notFound();

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <Link href={`/tasks/${id}`} style={{ fontSize: 12.5, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {task.name}
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>Edit Task</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {task.status === 'completed' ? 'Saving will re-activate this task with the new schedule.' : 'Changes take effect on the next scheduled run.'}
        </p>
      </div>

      {task.status === 'completed' && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 9, marginBottom: 16, backgroundColor: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontSize: 13 }}>
          <span style={{ flexShrink: 0 }}>ℹ</span>
          This task is completed. Saving will re-activate it with the updated schedule.
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 32px' }}>
        <TaskForm initial={task} />
      </div>
    </div>
  );
}
