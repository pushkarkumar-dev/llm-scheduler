'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { SkeletonCard, SkeletonRow } from './Skeleton';
import { scheduleLabel } from '@/lib/schedule';

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const STAT_ICONS = {
  active: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6.5 9l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  completed: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  errors: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2l7 13H2L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 7.5v3M9 12.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export default function Dashboard() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null);
  const [toast, setToast]     = useState(null);
  const [confirm, setConfirm] = useState(null);

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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  async function runNow(id) {
    setActing(id + 'run');
    try {
      const res  = await fetch(`/api/tasks/${id}/run`, { method: 'POST' });
      const data = await res.json();
      showToast(data.success ? 'Task ran successfully.' : `Run failed: ${data.error ?? 'Unknown error'}`, data.success ? 'success' : 'error');
      const listRes = await fetch('/api/tasks');
      const list    = await listRes.json();
      setTasks(Array.isArray(list) ? list : []);
    } catch {
      showToast('Network error while running task.', 'error');
    } finally {
      setActing(null);
    }
  }

  const active    = tasks.filter(t => t.status === 'active').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed    = tasks.filter(t => t.last_exec_status === 'failed').length;

  const stats = [
    { key: 'active',    label: 'Active Tasks',  value: active,    color: 'var(--success)', icon: STAT_ICONS.active },
    { key: 'completed', label: 'Completed',      value: completed, color: 'var(--accent)',  icon: STAT_ICONS.completed },
    { key: 'errors',    label: 'Recent Errors',  value: failed,    color: failed > 0 ? 'var(--danger)' : 'var(--text-muted)', icon: STAT_ICONS.errors },
  ];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.name}" and all its execution history? This cannot be undone.`}
          onConfirm={() => deleteTask(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Tasks</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Manage and monitor your scheduled LLM tasks</p>
        </div>
        <Link href="/tasks/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '8px 18px',
          borderRadius: '9px',
          fontSize: '13.5px', fontWeight: 600,
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
          color: 'white', textDecoration: 'none',
          boxShadow: '0 0 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New Task
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {loading
          ? [1,2,3].map(i => <SkeletonCard key={i} />)
          : stats.map(s => (
            <div key={s.key} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${s.color}55, transparent)` }} />
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>{s.label}</p>
                  <p style={{ fontSize: '32px', fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</p>
                </div>
                <div style={{ color: s.color, opacity: 0.7, padding: 8, backgroundColor: `${s.color}12`, borderRadius: 8, border: `1px solid ${s.color}22` }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                {['Task', 'Schedule', 'Status', 'Next Run', 'Last Result', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>{[1,2,3].map(i => <SkeletonRow key={i} cols={6} />)}</tbody>
          </table>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-muted), var(--bg-elevated))', border: '1px solid var(--border-light)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 14h4M8 17h6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No tasks yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Schedule your first LLM prompt to get started</p>
          <Link href="/tasks/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: 'white', textDecoration: 'none', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            Create your first task
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                {['Task', 'Schedule', 'Status', 'Next Run', 'Last Result', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => {
                const isActing = acting?.startsWith(String(task.id));
                return (
                  <tr key={task.id} style={{
                    borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: isActing ? 0.5 : 1,
                    transition: 'opacity 0.15s, background-color 0.1s',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <Link href={`/tasks/${task.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13.5 }}>
                        {task.name}
                      </Link>
                      {task.description && (
                        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.description}</p>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap' }}>
                        {scheduleLabel(task)}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}><StatusBadge status={task.status} /></td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(task.next_run_at)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      {task.last_exec_status
                        ? <StatusBadge status={task.last_exec_status} />
                        : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Never run</span>}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <Btn onClick={() => runNow(task.id)} disabled={!!acting} variant="accent">▶ Run</Btn>
                        {task.status === 'active'  && <Btn onClick={() => togglePause(task)} disabled={!!acting}>⏸ Pause</Btn>}
                        {task.status === 'paused'  && <Btn onClick={() => togglePause(task)} disabled={!!acting} variant="success">▶ Resume</Btn>}
                        <Link href={`/tasks/${task.id}/edit`} style={btnStyle('default')}>Edit</Link>
                        <Btn onClick={() => setConfirm({ id: task.id, name: task.name })} disabled={!!acting} variant="danger">Delete</Btn>
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

const VARIANT_STYLES = {
  default: { color: 'var(--text-secondary)',  bg: 'var(--bg-elevated)', border: 'var(--border)' },
  accent:  { color: '#a5b4fc',                bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)' },
  success: { color: 'var(--success)',          bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
  danger:  { color: '#f87171',                 bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
};

function btnStyle(variant) {
  const v = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  return { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, color: v.color, backgroundColor: v.bg, border: `1px solid ${v.border}`, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' };
}

function Btn({ onClick, disabled, children, variant = 'default' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...btnStyle(variant), cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}
