import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import RunNowButton from '@/components/RunNowButton';
import ExecutionLog from '@/components/ExecutionLog';
import { scheduleLabel } from '@/lib/schedule';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const card = { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12 };

export default async function TaskDetailPage({ params }) {
  const { id } = await params;
  const [task] = await query('SELECT * FROM tasks WHERE id=?', [id]);
  if (!task) notFound();

  return (
    <div style={{ maxWidth: 900 }}>

      {/* Breadcrumb */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/" style={{ fontSize: 12.5, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Tasks
        </Link>
      </div>

      {/* Header card */}
      <div style={{ ...card, padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>{task.name}</h1>
              <StatusBadge status={task.status} />
            </div>
            {task.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{task.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <RunNowButton taskId={id} />
            <Link href={`/tasks/${id}/edit`} style={{ display: 'inline-flex', alignItems: 'center', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Config grid */}
      <div style={{ ...card, padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>Configuration</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', marginBottom: 20 }}>
          {[
            { label: 'Schedule',  value: scheduleLabel(task) },
            { label: 'Next Run',  value: formatDate(task.next_run_at) },
            { label: 'Run Count', value: task.run_count },
            { label: 'Model',     value: task.model || 'Server default' },
            { label: 'Created',   value: formatDate(task.created_at) },
            { label: 'Updated',   value: formatDate(task.updated_at) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{String(value)}</p>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Prompt</p>
          <pre style={{ margin: 0, fontSize: 12.5, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontFamily: 'inherit' }}>{task.prompt}</pre>
        </div>
      </div>

      {/* Execution history */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Execution History</p>
        <ExecutionLog initialTaskId={String(task.id)} tasks={[]} />
      </div>
    </div>
  );
}
