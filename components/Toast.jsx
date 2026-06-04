'use client';

import { useEffect } from 'react';

const STYLES = {
  success: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', color: '#34d399', icon: '✓' },
  error:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  color: '#f87171', icon: '✕' },
  info:    { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', color: '#a5b4fc', icon: 'ℹ' },
};

export default function Toast({ message, type = 'info', onClose }) {
  const s = STYLES[type] ?? STYLES.info;

  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 100,
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '12px 16px', borderRadius: 10,
      backgroundColor: 'var(--bg-surface)',
      border: `1px solid ${s.border}`,
      boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px ${s.border}`,
      color: s.color, fontSize: 13.5, maxWidth: 340,
      backdropFilter: 'blur(12px)',
      animation: 'toastIn 0.2s ease',
    }}>
      <span style={{ fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
      <span style={{ flex: 1, color: 'var(--text-primary)' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 0 }}>×</button>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
