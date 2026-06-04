import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import Breadcrumb from '@/components/Breadcrumb';
import Icon from '@/components/Icon';

export default async function EditTaskPage({ params }) {
  const { id } = await params;
  const [task] = await query('SELECT * FROM tasks WHERE id=?', [id]);
  if (!task) notFound();

  return (
    <div style={{ maxWidth: 680 }}>
      <Breadcrumb items={[{ label: 'Tasks', href: '/' }, { label: task.name, href: `/tasks/${id}` }, { label: 'Edit' }]} />
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>Edit Task</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>
          {task.status === 'completed' ? 'Saving will re-activate this task with the new schedule.' : 'Changes take effect on the next scheduled run.'}
        </p>
      </div>

      {task.status === 'completed' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--r-md)', marginBottom: 16, backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--accent-soft)', fontSize: 13 }}>
          <Icon name="info" size={16} />
          This task is completed. Saving will re-activate it with the updated schedule.
        </div>
      )}

      <div className="card" style={{ padding: '28px 32px' }}>
        <TaskForm initial={task} />
      </div>
    </div>
  );
}
