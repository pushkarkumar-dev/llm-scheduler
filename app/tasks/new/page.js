import TaskForm from '@/components/TaskForm';
import Link from 'next/link';

export const metadata = { title: 'New Task — TaskScheduler' };

export default function NewTaskPage() {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <Link href="/" style={{ fontSize: 12.5, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Tasks
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>New Task</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Schedule a prompt to run automatically on your local LLM</p>
      </div>
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 32px' }}>
        <TaskForm />
      </div>
    </div>
  );
}
