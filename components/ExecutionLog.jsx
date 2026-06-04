'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import Icon from './Icon';
import { SkeletonRow } from './Skeleton';
import { useCategory } from './CategoryProvider';
import { categoriesForView } from '@/lib/categories';

const STATUS_OPTIONS = ['', 'success', 'failed', 'running', 'pending'];

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function duration(ms) {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} title="Copy to clipboard" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
      background: copied ? 'rgba(16,185,129,0.12)' : 'var(--bg-elevated)',
      border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'var(--border-light)'}`,
      color: copied ? 'var(--success-fg)' : 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
    }}>
      <Icon name={copied ? 'check' : 'copy'} size={12} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ExpandableText({ content, isError }) {
  const [open, setOpen] = useState(false);
  if (!content) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content;
  return (
    <div>
      <pre style={{
        margin: 0, fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        backgroundColor: isError ? 'rgba(239,68,68,0.07)' : 'var(--bg-base)',
        color: isError ? 'var(--danger-fg)' : 'var(--text-secondary)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.18)' : 'var(--border)'}`,
        borderRadius: 8, padding: '10px 12px', fontFamily: 'inherit',
        maxHeight: open ? 400 : 64, overflow: open ? 'auto' : 'hidden', transition: 'max-height 0.2s var(--ease)',
      }}>
        {open ? content : preview}
      </pre>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}>
        {content.length > 120 && (
          <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 600, color: 'var(--accent-soft)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name={open ? 'chevronU' : 'chevronD'} size={12} />
            {open ? 'Collapse' : 'Show full'}
          </button>
        )}
        <CopyButton text={content} />
      </div>
    </div>
  );
}

export default function ExecutionLog({ initialTaskId = '', tasks = [] }) {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [taskId, setTaskId]   = useState(initialTaskId);
  const [status, setStatus]   = useState('');
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]     = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { view } = useCategory();
  const showToast = (message, type = 'info') => setToast({ message, type });
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (taskId) qs.set('taskId', taskId);
      if (status)  qs.set('status', status);
      // Apply the global category filter only in the global log, not a single task's history.
      if (!initialTaskId) qs.set('category', categoriesForView(view).join(','));
      qs.set('page', page);
      const data = await (await fetch(`/api/executions?${qs}`)).json();
      setRows(data.rows ?? []);
      setTotal(data.total ?? 0);
    } catch {
      showToast('Failed to load executions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [taskId, status, page, view, initialTaskId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [taskId, status, view]);

  async function deleteRow(id) {
    setConfirm(null);
    setDeleting(id);
    try {
      await fetch(`/api/executions/${id}`, { method: 'DELETE' });
      setRows(r => r.filter(x => x.id !== id));
      setTotal(t => t - 1);
      showToast('Execution deleted.', 'success');
    } catch {
      showToast('Failed to delete execution.', 'error');
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / limit);
  const selStyle = { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 13, fontWeight: 500, outline: 'none', colorScheme: 'dark', cursor: 'pointer' };
  const THEAD = ['Task', 'Status', 'Trigger', 'Started', 'Duration', 'Response / Error', ''];

  const Head = () => (
    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
      {THEAD.map((h, i) => <th key={h || i} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>)}
    </tr>
  );

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog message="Delete this execution record? This cannot be undone." onConfirm={() => deleteRow(confirm)} onCancel={() => setConfirm(null)} />
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {tasks.length > 0 && (
          <select value={taskId} onChange={e => setTaskId(e.target.value)} style={selStyle}>
            <option value="">All tasks</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        <select value={status} onChange={e => setStatus(e.target.value)} style={selStyle}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All statuses'}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-muted)' }}>
          {loading ? 'Loading…' : `${total} execution${total !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="w-full"><thead><Head /></thead><tbody>{[1,2,3,4,5].map(i => <SkeletonRow key={i} cols={7} />)}</tbody></table>
        </div>
      ) : rows.length === 0 ? (
        <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 12, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', marginBottom: 14 }}>
            <Icon name="bolt" size={22} />
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>No executions match the current filters.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead><Head /></thead>
            <tbody>
              {rows.map((ex, i) => (
                <tr key={ex.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', verticalAlign: 'top', transition: 'background-color 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '13px 16px' }}>
                    <Link href={`/tasks/${ex.task_id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-soft)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>{ex.task_name}</Link>
                    <p className="tnum" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>#{ex.id}</p>
                  </td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge status={ex.status} /></td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{ex.trigger}</span>
                  </td>
                  <td className="tnum" style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(ex.started_at)}</td>
                  <td className="tnum" style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{duration(ex.duration_ms) ?? '—'}</td>
                  <td style={{ padding: '13px 16px', maxWidth: 360 }}>
                    {ex.input_data && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 7, fontSize: 11.5, color: 'var(--accent-soft)', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '5px 8px' }}>
                        <Icon name="bolt" size={12} style={{ marginTop: 1 }} />
                        <span style={{ wordBreak: 'break-word' }}><strong style={{ fontWeight: 600 }}>Input:</strong> {ex.input_data}</span>
                      </div>
                    )}
                    {ex.status === 'failed' ? <ExpandableText content={ex.error} isError /> : <ExpandableText content={ex.response} isError={false} />}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button onClick={() => setConfirm(ex.id)} disabled={deleting === ex.id} title="Delete"
                      style={{ display: 'inline-flex', padding: 6, borderRadius: 6, backgroundColor: 'rgba(239,68,68,0.07)', color: 'var(--danger-fg)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.16)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}>
                      <Icon name={deleting === ex.id ? 'spinner' : 'trash'} size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <PageBtn icon="chevronL" label="Previous" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} />
          <span className="tnum" style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <PageBtn label="Next" iconRight="chevronR" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} />
        </div>
      )}
    </div>
  );
}

function PageBtn({ icon, iconRight, label, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)',
      color: disabled ? 'var(--text-muted)' : 'var(--text-primary)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--bg-hover)'; }}
    onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = 'var(--bg-surface)'; }}>
      {icon && <Icon name={icon} size={13} />}
      {label}
      {iconRight && <Icon name={iconRight} size={13} />}
    </button>
  );
}
