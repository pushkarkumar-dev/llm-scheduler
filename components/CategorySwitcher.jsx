'use client';

import { useState, useEffect } from 'react';
import Icon from './Icon';
import { useCategory } from './CategoryProvider';

const TABS = [
  { value: 'all',          label: 'All' },
  { value: 'production',   label: 'Production' },
  { value: 'experimental', label: 'Experimental' },
  { value: 'private',      label: 'Private', locked: true },
];

export default function CategorySwitcher() {
  const { view, setView, unlocked, unlock, hydrated } = useCategory();
  const [askPw, setAskPw] = useState(false);

  function pick(tab) {
    if (tab.value === 'private' && !unlocked) { setAskPw(true); return; }
    setView(tab.value);
  }

  if (!hydrated) return <div style={{ height: 32 }} />; // reserve space, avoid flash

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: 3, borderRadius: 10, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        {TABS.map(tab => {
          const active = view === tab.value;
          const gated = tab.locked && !unlocked;
          return (
            <button key={tab.value} onClick={() => pick(tab)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 11px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: active ? 600 : 500,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              background: active ? 'var(--bg-hover)' : 'transparent',
              boxShadow: active ? 'inset 0 0 0 1px var(--border-light)' : 'none',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-muted)'; }}>
              {tab.locked && <Icon name={unlocked ? 'lockOpen' : 'lock'} size={12} style={{ color: gated ? 'var(--text-muted)' : 'var(--accent-soft)' }} />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {askPw && (
        <PasswordModal
          onClose={() => setAskPw(false)}
          onUnlocked={() => { unlock(); setView('private'); setAskPw(false); }}
        />
      )}
    </>
  );
}

function PasswordModal({ onClose, onUnlocked }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/categories/unlock', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.ok) onUnlocked();
      else setError('Incorrect password.');
    } catch {
      setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,7,13,0.7)', backdropFilter: 'blur(5px)', animation: 'fade-in 0.15s ease' }}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} className="animate-pop" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-xl)', padding: '24px 26px', width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 11, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)', color: 'var(--accent-soft)', marginBottom: 16 }}>
          <Icon name="lock" size={18} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 650, marginBottom: 4 }}>Unlock Private tasks</p>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>Enter the password to reveal Private-category tasks for this session.</p>
        <input
          autoFocus type="password" value={pw} onChange={e => { setPw(e.target.value); setError(''); }}
          placeholder="Password"
          style={{ width: '100%', backgroundColor: 'var(--bg-base)', border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`, color: 'var(--text-primary)', borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 13.5, outline: 'none' }}
          onFocus={e => { if (!error) { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; } }}
          onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
        />
        {error && <p style={{ fontSize: 12, color: 'var(--danger-fg)', marginTop: 7, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="warning" size={13} />{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={busy || !pw} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, background: 'var(--gradient-accent)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: busy || !pw ? 'not-allowed' : 'pointer', opacity: busy || !pw ? 0.5 : 1 }}>
            <Icon name={busy ? 'spinner' : 'lockOpen'} size={13} /> Unlock
          </button>
        </div>
      </form>
    </div>
  );
}
