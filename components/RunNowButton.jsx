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
  const [errorMsg, setErrorMsg] = useState('');
  const [modal, setModal] = useState(false);
  const router = useRouter();

  async function run(input = '') {
    setState('running');
    setErrorMsg('');
    try {
      const res  = await fetch(`/api/tasks/${taskId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
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

  function handleClick() {
    if (acceptsInput) setModal(true);
    else run();
  }

  const s = STATES[state];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {modal && (
        <RunInputModal
          taskName={taskName} label={inputLabel}
          onCancel={() => setModal(false)}
          onRun={(input) => { setModal(false); run(input); }}
        />
      )}
      <button onClick={handleClick} disabled={state === 'running'} style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 16px', borderRadius: 'var(--r-md)',
        fontSize: 13, fontWeight: 600, lineHeight: 1,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        boxShadow: s.shadow, cursor: state === 'running' ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (state === 'idle') { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'; } }}
      onMouseLeave={e => { if (state === 'idle') { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = s.shadow; } }}>
        <Icon name={s.icon} size={14} />
        {s.label}
      </button>
      {errorMsg && <span style={{ fontSize: 12, color: 'var(--danger-fg)' }}>{errorMsg}</span>}
    </div>
  );
}
