'use client';

import { useEffect } from 'react';
import Icon from './Icon';

export default function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Delete' }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(4,7,13,0.7)', backdropFilter: 'blur(5px)',
      animation: 'fade-in 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-pop" style={{
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--r-xl)', padding: '26px 28px', width: '100%', maxWidth: 410,
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.26)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: 'var(--danger-fg)' }}>
          <Icon name="warning" size={20} />
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, backgroundColor: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.32)', color: 'var(--danger-fg)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}>
            <Icon name="trash" size={14} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
