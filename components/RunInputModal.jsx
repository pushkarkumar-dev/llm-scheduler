'use client';

import { useState, useEffect } from 'react';
import Icon from './Icon';

export default function RunInputModal({ taskName, label, onRun, onCancel }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(4,7,13,0.7)', backdropFilter: 'blur(5px)', animation: 'fade-in 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-pop" style={{
        backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)',
        borderRadius: 'var(--r-xl)', padding: '24px 26px', width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
          <span style={{ display: 'flex', width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)', color: 'var(--accent-soft)' }}>
            <Icon name="bolt" size={16} />
          </span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 650, letterSpacing: '-0.01em' }}>Run with extra context</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{taskName}</p>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '18px 0 7px' }}>
          {label || 'Additional context for this run'}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 5 }}>(optional)</span>
        </label>
        <textarea
          autoFocus value={value} onChange={e => setValue(e.target.value)}
          placeholder="Type extra details to steer just this run…"
          style={{
            width: '100%', minHeight: 110, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
            backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-light)', color: 'var(--text-primary)',
            borderRadius: 'var(--r-md)', padding: '10px 13px', fontSize: 13.5, outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
        />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onCancel} style={{ padding: '8px 18px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}>
            Cancel
          </button>
          <button onClick={() => onRun(value)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: 'var(--gradient-accent)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-glow)', cursor: 'pointer' }}>
            <Icon name="play" size={13} />
            Run Now
          </button>
        </div>
      </div>
    </div>
  );
}
