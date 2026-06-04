'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { SkeletonRow } from './Skeleton';

const STATUS_OPTIONS = ['', 'success', 'failed', 'running', 'pending'];

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
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
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="text-xs px-2 py-0.5 rounded transition-all"
      style={{
        background: copied ? '#052e16' : 'var(--bg-elevated)',
        border: `1px solid ${copied ? '#166534' : 'var(--border)'}`,
        color: copied ? '#4ade80' : 'var(--text-muted)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function ExpandableText({ content, isError }) {
  const [open, setOpen] = useState(false);
  if (!content) return <span style={{ color: 'var(--text-muted)' }}>—</span>;

  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content;

  return (
    <div>
      <pre
        className="text-xs whitespace-pre-wrap rounded-lg p-3 mt-1"
        style={{
          backgroundColor: isError ? '#450a0a' : 'var(--bg-base)',
          color: isError ? '#f87171' : 'var(--text-secondary)',
          fontFamily: 'inherit',
          maxHeight: open ? '400px' : '72px',
          overflow: open ? 'auto' : 'hidden',
          transition: 'max-height 0.2s ease',
        }}
      >
        {open ? content : preview}
      </pre>
      <div className="flex items-center gap-3 mt-1.5">
        {content.length > 120 && (
          <button
            onClick={() => setOpen(o => !o)}
            className="text-xs font-medium"
            style={{ color: 'var(--accent-hover)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {open ? '↑ Collapse' : '↓ Show full'}
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

  const showToast = (message, type = 'info') => setToast({ message, type });
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (taskId) qs.set('taskId', taskId);
      if (status)  qs.set('status', status);
      qs.set('page', page);
      const res  = await fetch(`/api/executions?${qs}`);
      const data = await res.json();
      setRows(data.rows ?? []);
      setTotal(data.total ?? 0);
    } catch {
      showToast('Failed to load executions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [taskId, status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [taskId, status]);

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

  const selStyle = { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', colorScheme: 'dark' };
  const THEAD = ['Task', 'Status', 'Trigger', 'Started', 'Duration', 'Response / Error', ''];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          message="Delete this execution record? This cannot be undone."
          onConfirm={() => deleteRow(confirm)}
          onCancel={() => setConfirm(null)}
        />
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
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table className="w-full"><thead><tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>{THEAD.map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>)}</tr></thead>
            <tbody>{[1,2,3,4,5].map(i => <SkeletonRow key={i} cols={7} />)}</tbody></table>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>No executions match the current filters.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
                {THEAD.map(h => <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((ex, i) => (
                <tr key={ex.id}
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', verticalAlign: 'top', transition: 'background-color 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/tasks/${ex.task_id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{ex.task_name}</Link>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>#{ex.id}</p>
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={ex.status} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 5, backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{ex.trigger}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(ex.started_at)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{duration(ex.duration_ms) ?? '—'}</td>
                  <td style={{ padding: '12px 16px', maxWidth: 360 }}>
                    {ex.status === 'failed' ? <ExpandableText content={ex.error} isError /> : <ExpandableText content={ex.response} isError={false} />}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setConfirm(ex.id)} disabled={deleting === ex.id}
                      style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, backgroundColor: 'rgba(239,68,68,0.07)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
                      {deleting === ex.id ? '…' : 'Delete'}
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
          {[
            { label: '← Previous', action: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
            { label: 'Next →',     action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages },
          ].map(({ label, action, disabled }) => (
            <button key={label} onClick={action} disabled={disabled} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: disabled ? 'var(--text-muted)' : 'var(--text-primary)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
              {label}
            </button>
          ))}
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
        </div>
      )}
    </div>
  );
}
