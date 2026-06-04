import TaskForm from '@/components/TaskForm';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata = { title: 'New Task — LLM Scheduler' };

export default function NewTaskPage() {
  return (
    <div style={{ maxWidth: 680 }}>
      <Breadcrumb items={[{ label: 'Tasks', href: '/' }, { label: 'New Task' }]} />
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>New Task</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Schedule a prompt to run automatically on your local LLM</p>
      </div>
      <div className="card" style={{ padding: '28px 32px' }}>
        <TaskForm />
      </div>
    </div>
  );
}
