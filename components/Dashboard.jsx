'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import RunInputModal from './RunInputModal';
import Button from './Button';
import Icon from './Icon';
import { SkeletonCard, SkeletonRow } from './Skeleton';
import { scheduleLabel } from '@/lib/schedule';
import { useCategory } from './CategoryProvider';
import { categoriesForView, CATEGORY_META } from '@/lib/categories';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const COLS = ['Task', 'Schedule', 'Status', 'Next Run', 'Last Result', ''];

export default function Dashboard() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null);
  const [toast, setToast]     = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [runPrompt, setRunPrompt] = useState(null); // task awaiting run-time input

  const { view } = useCategory();
  const showToast = (message, type = 'info') => setToast({ message, type });

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function togglePause(task) {
    const action = task.status === 'active' ? 'pause' : 'resume';
    setActing(task.id + action);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const updated = await res.json();
      setTasks(t => t.map(x => x.id === task.id ? updated : x));
      showToast(`Task ${action === 'pause' ? 'paused' : 'resumed'}.`, 'success');
    } catch {
      showToast('Action failed.', 'error');
    } finally {
      setActing(null);
    }
  }

  async function deleteTask(id) {
    setConfirm(null);
    setActing(id + 'delete');
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(t => t.filter(x => x.id !== id));
      showToast('Task deleted.', 'success');
    } catch {
      showToast('Failed to delete task.', 'error');
    } finally {
      setActing(null);
    }
  }

  // Tasks that accept input open a modal first; others run immediately.
  function handleRunClick(task) {
    if (task.accepts_input) setRunPrompt(task);
    else runNow(task.id);
  }

  async function runNow(id, input = '') {
    setActing(id + 'run');
    try {
      const res  = await fetch(`/api/tasks/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      showToast(data.success ? 'Task ran successfully.' : `Run failed: ${data.error ?? 'Unknown error'}`, data.success ? 'success' : 'error');
      const list = await (await fetch('/api/tasks')).json();
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      showToast('Network error while running task.', 'error');
    } finally {
      setActing(null);
    }
  }

  const allowed = categoriesForView(view);
  const visibleTasks = tasks.filter(t => allowed.includes(t.category ?? 'experimental'));

  const active    = visibleTasks.filter(t => t.status === 'active').length;
  const completed = visibleTasks.filter(t => t.status === 'completed').length;
  const failed    = visibleTasks.filter(t => t.last_exec_status === 'failed').length;

  const stats = [
    { key: 'active',    label: 'Active Tasks',  value: active,    color: 'var(--success)', icon: 'circleCheck' },
    { key: 'completed', label: 'Completed',     value: completed, color: 'var(--accent)',  icon: 'check' },
    { key: 'errors',    label: 'Recent Errors', value: failed,    color: failed > 0 ? 'var(--danger)' : 'var(--text-muted)', icon: 'warning' },
  ];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.name}" and all its execution history? This cannot be undone.`}
          onConfirm={() => deleteTask(confirm.id)} onCancel={() => setConfirm(null)}
        />
      )}
      {runPrompt && (
        <RunInputModal
          taskName={runPrompt.name}
          label={runPrompt.input_label}
          onCancel={() => setRunPrompt(null)}
          onRun={(input) => { const id = runPrompt.id; setRunPrompt(null); runNow(id, input); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Tasks</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>Manage and monitor your scheduled LLM tasks</p>
        </div>
        <Button href="/tasks/new" variant="primary" size="md" icon="plus">New Task</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 28 }}>
        {loading
          ? [1,2,3].map(i => <SkeletonCard key={i} />)
          : stats.map((s, i) => (
            <div key={s.key} className="card animate-page" style={{ padding: 20, position: 'relative', overflow: 'hidden', animationDelay: `${i * 60}ms` }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}, transparent 80%)` }} />
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>{s.label}</p>
                  <p className="tnum" style={{ fontSize: 34, fontWeight: 750, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</p>
                </div>
                <div style={{ color: s.color, padding: 9, backgroundColor: `${s.color}14`, borderRadius: 10, border: `1px solid ${s.color}26`, display: 'flex' }}>
                  <Icon name={s.icon} size={18} />
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="w-full">
            <thead><Thead /></thead>
            <tbody>{[1,2,3].map(i => <SkeletonRow key={i} cols={6} />)}</tbody>
          </table>
        </div>
      ) : visibleTasks.length === 0 ? (
        <EmptyState filtered={tasks.length > 0} />
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead><Thead /></thead>
            <tbody>
              {visibleTasks.map((task, i) => {
                const isActing = acting?.startsWith(String(task.id));
                const cat = CATEGORY_META[task.category ?? 'experimental'];
                return (
                  <tr key={task.id} className="animate-page"
                    style={{ borderBottom: i < visibleTasks.length - 1 ? '1px solid var(--border)' : 'none', opacity: isActing ? 0.45 : 1, transition: 'opacity 0.15s, background-color 0.12s', animationDelay: `${i * 35}ms` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <Link href={`/tasks/${task.id}`} style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-primary)', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-soft)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                          {task.name}
                        </Link>
                        <span title={cat.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, color: cat.color, background: `${cat.color}14`, border: `1px solid ${cat.color}33` }}>
                          <Icon name={cat.icon} size={10} /> {cat.label}
                        </span>
                        {!!task.accepts_input && (
                          <span title="Accepts extra input at run time" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 5, color: 'var(--accent-soft)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                            <Icon name="bolt" size={10} /> Input
                          </span>
                        )}
                      </span>
                      {task.description && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, padding: '4px 9px', whiteSpace: 'nowrap' }}>
                        <Icon name="clock" size={12} style={{ color: 'var(--text-muted)' }} />
                        {scheduleLabel(task)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}><StatusBadge status={task.status} /></td>
                    <td className="tnum" style={{ padding: '14px 16px', fontSize: 12.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(task.next_run_at)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {task.last_exec_status ? <StatusBadge status={task.last_exec_status} /> : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Never run</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <Button onClick={() => handleRunClick(task)} disabled={!!acting} variant="accent" size="xs" icon="play">Run</Button>
                        {task.status === 'active' && <Button onClick={() => togglePause(task)} disabled={!!acting} variant="secondary" size="xs" icon="pause">Pause</Button>}
                        {task.status === 'paused' && <Button onClick={() => togglePause(task)} disabled={!!acting} variant="success" size="xs" icon="play">Resume</Button>}
                        <Button href={`/tasks/${task.id}/edit`} variant="ghost" size="xs" icon="edit" title="Edit" />
                        <Button onClick={() => setConfirm({ id: task.id, name: task.name })} disabled={!!acting} variant="danger" size="xs" icon="trash" title="Delete" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Thead() {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
      {COLS.map((h, i) => (
        <th key={h || i} style={{ textAlign: i === COLS.length - 1 ? 'right' : 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
      ))}
    </tr>
  );
}

function EmptyState({ filtered = false }) {
  return (
    <div className="card" style={{ padding: '72px 32px', textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-muted), var(--bg-elevated))', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-glow)' }}>
        <Icon name={filtered ? 'list' : 'calendar'} size={26} style={{ color: 'var(--accent)' }} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 650, marginBottom: 8, letterSpacing: '-0.02em' }}>
        {filtered ? 'No tasks in this view' : 'No tasks yet'}
      </p>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 24 }}>
        {filtered ? 'Try a different category, or create a task here.' : 'Schedule your first LLM prompt to get started'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button href="/tasks/new" variant="primary" size="md" icon="plus">
          {filtered ? 'New Task' : 'Create your first task'}
        </Button>
      </div>
    </div>
  );
}
