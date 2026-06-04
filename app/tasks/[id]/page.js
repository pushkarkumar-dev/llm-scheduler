import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import RunNowButton from '@/components/RunNowButton';
import ExecutionLog from '@/components/ExecutionLog';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Breadcrumb from '@/components/Breadcrumb';
import { scheduleLabel } from '@/lib/schedule';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const META_ICON = {
  Schedule: 'clock', 'Next Run': 'calendar', 'Run Count': 'refresh',
  Model: 'bolt', Created: 'calendar', Updated: 'refresh',
};

export default async function TaskDetailPage({ params }) {
  const { id } = await params;
  const [task] = await query('SELECT * FROM tasks WHERE id=?', [id]);
  if (!task) notFound();

  const meta = [
    { label: 'Schedule',  value: scheduleLabel(task) },
    { label: 'Next Run',  value: formatDate(task.next_run_at) },
    { label: 'Run Count', value: task.run_count },
    { label: 'Model',     value: task.model || 'Server default' },
    { label: 'Created',   value: formatDate(task.created_at) },
    { label: 'Updated',   value: formatDate(task.updated_at) },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <Breadcrumb items={[{ label: 'Tasks', href: '/' }, { label: task.name }]} />

      {/* Header card */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--accent), transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>{task.name}</h1>
              <StatusBadge status={task.status} />
            </div>
            {task.description && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{task.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <RunNowButton taskId={id} />
            <Button href={`/tasks/${id}/edit`} variant="secondary" size="sm" icon="edit">Edit</Button>
          </div>
        </div>
      </div>

      {/* Config */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 18 }}>Configuration</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px 24px', marginBottom: 22 }}>
          {meta.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 11 }}>
              <span style={{ display: 'flex', flexShrink: 0, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <Icon name={META_ICON[label]} size={15} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
                <p className="tnum" style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{String(value)}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 9, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Prompt</p>
          <pre style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', fontFamily: 'inherit' }}>{task.prompt}</pre>
        </div>
      </div>

      {/* History */}
      <p style={{ fontSize: 15, fontWeight: 650, letterSpacing: '-0.01em', marginBottom: 16 }}>Execution History</p>
      <ExecutionLog initialTaskId={String(task.id)} tasks={[]} />
    </div>
  );
}
