'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RunNowButton({ taskId }) {
  const [state, setState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function run() {
    setState('running');
    setErrorMsg('');
    try {
      const res  = await fetch(`/api/tasks/${taskId}/run`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setState('success');
        router.refresh();
        setTimeout(() => setState('idle'), 3000);
      } else {
        setState('failed');
        setErrorMsg(data.error ?? 'Unknown error');
        setTimeout(() => setState('idle'), 5000);
      }
    } catch {
      setState('failed');
      setErrorMsg('Network error');
      setTimeout(() => setState('idle'), 5000);
    }
  }

  const styles = {
    idle:    { bg: 'linear-gradient(135deg,#6366f1,#7c3aed)', color: 'white',   border: 'rgba(255,255,255,0.08)', shadow: '0 0 16px rgba(99,102,241,0.3)' },
    running: { bg: 'var(--bg-elevated)',                       color: 'var(--text-muted)', border: 'var(--border)', shadow: 'none' },
    success: { bg: 'rgba(16,185,129,0.1)',                     color: '#34d399', border: 'rgba(16,185,129,0.3)', shadow: 'none' },
    failed:  { bg: 'rgba(239,68,68,0.1)',                      color: '#f87171', border: 'rgba(239,68,68,0.3)', shadow: 'none' },
  };
  const s = styles[state];

  const labels = { idle: '▶ Run Now', running: 'Running…', success: '✓ Done', failed: '✗ Failed' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={run} disabled={state === 'running'} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 16px', borderRadius: 8,
        fontSize: 13, fontWeight: 600,
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        boxShadow: s.shadow,
        cursor: state === 'running' ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
      }}>
        {state === 'running' && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 4" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </svg>
        )}
        {labels[state]}
      </button>
      {errorMsg && <span style={{ fontSize: 12, color: '#f87171' }}>{errorMsg}</span>}
    </div>
  );
}
