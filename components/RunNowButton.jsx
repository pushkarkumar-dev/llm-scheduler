'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';
import RunInputModal from './RunInputModal';

const STATES = {
  idle:    { bg: 'var(--gradient-accent)', color: '#fff', border: 'rgba(255,255,255,0.1)', shadow: 'var(--shadow-glow), inset 0 1px 0 rgba(255,255,255,0.12)', icon: 'play',    label: 'Run Now' },
  running: { bg: 'var(--bg-elevated)',     color: 'var(--text-muted)', border: 'var(--border-light)', shadow: 'none', icon: 'spinner', label: 'Running…' },
  success: { bg: 'rgba(16,185,129,0.12)',  color: 'var(--success-fg)', border: 'rgba(16,185,129,0.3)', shadow: 'none', icon: 'check',   label: 'Done' },
  failed:  { bg: 'rgba(239,68,68,0.1)',    color: 'var(--danger-fg)',  border: 'rgba(239,68,68,0.3)',  shadow: 'none', icon: 'x',       label: 'Failed' },
};

export default function RunNowButton({ taskId, taskName, acceptsInput = false, inputLabel }) {
  const [state, setState] = useState('idle');
  const [progress, setProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [modal, setModal] = useState(false);
  const router = useRouter();

  async function run({ times = 1, input = '' }) {
    setState('running');
    setErrorMsg('');
    let ok = 0, failed = 0, lastErr = '';
    for (let i = 0; i < times; i++) {
      setProgress(times > 1 ? `${i + 1}/${times}` : '');
      try {
        const res  = await fetch(`/api/tasks/${taskId}/run`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        });
        const data = await res.json();
        if (data.success) ok++; else { failed++; lastErr = data.error ?? 'Unknown error'; }
      } catch { failed++; lastErr = 'Network error'; }
    }
    setProgress('');
    router.refresh();
    if (failed === 0) {
      setState('success');
      setTimeout(() => setState('idle'), 3000);
    } else {
      setState('failed');
      setErrorMsg(times > 1 ? `${failed} of ${times} failed` : lastErr);
      setTimeout(() => setState('idle'), 5000);
    }
  }

  const s = STATES[state];
  const label = state === 'running' && progress ? `Running ${progress}` : s.label;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {modal && (
        <RunInputModal
          taskName={taskName} label={inputLabel} acceptsInput={acceptsInput}
          onCancel={() => setModal(false)}
          onRun={({ times, input }) => { setModal(false); run({ times, input }); }}
        />
      )}
      <button onClick={() => setModal(true)} disabled={state === 'running'} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 16px', borderRadius: 'var(--r-md)',
        fontSize: 13, fontWeight: 600, lineHeight: 1,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        boxShadow: s.shadow, cursor: state === 'running' ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (state === 'idle') { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'; } }}
      onMouseLeave={e => { if (state === 'idle') { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = s.shadow; } }}>
        <Icon name={s.icon} size={14} />
        {label}
      </button>
      {errorMsg && <span style={{ fontSize: 12, color: 'var(--danger-fg)' }}>{errorMsg}</span>}
    </div>
  );
}
