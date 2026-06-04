'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateTask } from '@/lib/schedule';
import Icon from './Icon';
import Button from './Button';

const SCHEDULE_TYPES = [
  { value: 'hourly',        label: 'Hourly',      hint: 'Every hour at X:mm',     icon: 'refresh' },
  { value: 'daily',         label: 'Daily',       hint: 'Once per day at HH:MM',  icon: 'calendar' },
  { value: 'adhoc_once',    label: 'Run Once',    hint: 'Fires immediately, once', icon: 'play' },
  { value: 'adhoc_n_times', label: 'Run N Times', hint: 'N runs with interval',   icon: 'bolt' },
];

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      style={{
        backgroundColor: 'var(--bg-base)',
        border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`,
        color: 'var(--text-primary)',
        borderRadius: 8,
        padding: '9px 13px',
        width: '100%',
        fontSize: 13.5,
        outline: 'none',
        boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocus={e => { if (!error) e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = error ? '0 0 0 3px rgba(239,68,68,0.08)' : '0 0 0 3px var(--accent-glow)'; }}
      onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.01em' }}>
      {children}
      {required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: 'var(--danger-fg)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="warning" size={13} />{msg}</p>;
}

function Section({ title, children }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20 }}>
      {title && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>{title}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

export default function TaskForm({ initial = {} }) {
  const router = useRouter();
  const isEdit = !!initial.id;

  const [form, setForm] = useState({
    name:             initial.name             ?? '',
    description:      initial.description      ?? '',
    prompt:           initial.prompt           ?? '',
    model:            initial.model            ?? '',
    schedule_type:    initial.schedule_type    ?? 'hourly',
    hourly_minute:    initial.hourly_minute    ?? 0,
    daily_time:       initial.daily_time?.slice(0, 5) ?? '09:00',
    interval_minutes: initial.interval_minutes ?? 60,
    max_runs:         initial.max_runs         ?? 3,
  });

  const [errors, setErrors]           = useState({});
  const [touched, setTouched]         = useState({});
  const [saving, setSaving]           = useState(false);
  const [serverError, setServerError] = useState('');

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      if (touched[field]) setErrors(err => ({ ...err, [field]: undefined }));
    };
  }

  function touch(field) {
    return () => {
      setTouched(t => ({ ...t, [field]: true }));
      const errs = validateTask({ ...form });
      setErrors(prev => ({ ...prev, [field]: errs[field] }));
    };
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validateTask(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setTouched(Object.fromEntries(Object.keys(errs).map(k => [k, true])));
      return;
    }
    setSaving(true);
    setServerError('');
    try {
      const res  = await fetch(isEdit ? `/api/tasks/${initial.id}` : '/api/tasks', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setServerError(data.error ?? 'Something went wrong.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setServerError('Network error. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const st = form.schedule_type;
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {serverError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--r-md)', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger-fg)', fontSize: 13.5 }}>
          <Icon name="warning" size={16} /> {serverError}
        </div>
      )}

      {/* Basic info */}
      <Section title="Task Details">
        <div>
          <Label required>Name</Label>
          <Input error={errors.name} value={form.name} onChange={set('name')} onBlur={touch('name')} placeholder="e.g. Daily market summary" autoFocus />
          <FieldError msg={errors.name} />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={form.description} onChange={set('description')} placeholder="Short description of what this task does" />
        </div>
        <div>
          <Label required>Prompt</Label>
          <textarea
            value={form.prompt}
            onChange={set('prompt')}
            onBlur={touch('prompt')}
            placeholder="The exact text sent to the LLM on each run…"
            style={{
              backgroundColor: 'var(--bg-base)',
              border: `1px solid ${errors.prompt ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`,
              color: 'var(--text-primary)',
              borderRadius: 8,
              padding: '10px 13px',
              width: '100%',
              fontSize: 13.5,
              outline: 'none',
              minHeight: 120,
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = errors.prompt ? 'rgba(239,68,68,0.6)' : 'var(--accent)'; e.target.style.boxShadow = errors.prompt ? '0 0 0 3px rgba(239,68,68,0.08)' : '0 0 0 3px var(--accent-glow)'; }}
            onBlur={e => { touch('prompt')(); e.target.style.borderColor = errors.prompt ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'; e.target.style.boxShadow = 'none'; }}
          />
          <FieldError msg={errors.prompt} />
        </div>
        <div>
          <Label>Model <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></Label>
          <Input value={form.model} onChange={set('model')} placeholder="Leave blank to use LM Studio's loaded model" />
        </div>
      </Section>

      {/* Schedule */}
      <Section title="Schedule">
        <div>
          <Label required>Type</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {SCHEDULE_TYPES.map(t => {
              const active = st === t.value;
              return (
                <button key={t.value} type="button" onClick={() => { setForm(f => ({ ...f, schedule_type: t.value })); setErrors(e => ({ ...e, schedule_type: undefined })); }}
                  style={{
                    padding: '12px 11px',
                    borderRadius: 'var(--r-md)',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                    backgroundColor: active ? 'rgba(99,102,241,0.1)' : 'var(--bg-base)',
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: active ? '0 0 0 3px var(--accent-glow)' : 'none',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Icon name={t.icon} size={16} style={{ color: active ? 'var(--accent-soft)' : 'var(--text-muted)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--accent-soft)' : 'var(--text-secondary)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: active ? 'rgba(165,180,252,0.65)' : 'var(--text-muted)', lineHeight: 1.3 }}>{t.hint}</div>
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.schedule_type} />
        </div>

        {st === 'hourly' && (
          <div>
            <Label required>Minute of each hour</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="number" min="0" max="59" value={form.hourly_minute} onChange={set('hourly_minute')} onBlur={touch('hourly_minute')}
                style={{ backgroundColor: 'var(--bg-base)', border: `1px solid ${errors.hourly_minute ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`, color: 'var(--text-primary)', borderRadius: 8, padding: '9px 13px', width: 90, fontSize: 13.5, outline: 'none' }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>→ runs at :{String(form.hourly_minute).padStart(2, '0')} every hour</span>
            </div>
            <FieldError msg={errors.hourly_minute} />
          </div>
        )}

        {st === 'daily' && (
          <div>
            <Label required>Time of day</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="time" value={form.daily_time} onChange={set('daily_time')} onBlur={touch('daily_time')}
                style={{ backgroundColor: 'var(--bg-base)', border: `1px solid ${errors.daily_time ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`, color: 'var(--text-primary)', borderRadius: 8, padding: '9px 13px', width: 150, fontSize: 13.5, outline: 'none', colorScheme: 'dark' }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>→ runs once per day</span>
            </div>
            <FieldError msg={errors.daily_time} />
          </div>
        )}

        {st === 'adhoc_once' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 'var(--r-md)', backgroundColor: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--accent-soft)', fontSize: 13 }}>
            <Icon name="info" size={16} />
            Runs once within the next minute, then marks itself completed.
          </div>
        )}

        {st === 'adhoc_n_times' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label required>Number of runs</Label>
                <input type="number" min="1" value={form.max_runs} onChange={set('max_runs')} onBlur={touch('max_runs')}
                  style={{ backgroundColor: 'var(--bg-base)', border: `1px solid ${errors.max_runs ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`, color: 'var(--text-primary)', borderRadius: 8, padding: '9px 13px', width: '100%', fontSize: 13.5, outline: 'none' }} />
                <FieldError msg={errors.max_runs} />
              </div>
              <div>
                <Label required>Interval (minutes)</Label>
                <input type="number" min="1" value={form.interval_minutes} onChange={set('interval_minutes')} onBlur={touch('interval_minutes')}
                  style={{ backgroundColor: 'var(--bg-base)', border: `1px solid ${errors.interval_minutes ? 'rgba(239,68,68,0.6)' : 'var(--border-light)'}`, color: 'var(--text-primary)', borderRadius: 8, padding: '9px 13px', width: '100%', fontSize: 13.5, outline: 'none' }} />
                <FieldError msg={errors.interval_minutes} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              First run is immediate → then every {form.interval_minutes}m → {form.max_runs} total runs
            </p>
          </div>
        )}
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
        <Button type="submit" variant="primary" size="md" loading={saving} icon={saving ? undefined : (isEdit ? 'check' : 'plus')}>
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={() => router.back()}>Cancel</Button>
        {hasErrors && <span style={{ fontSize: 12, color: 'var(--danger-fg)', marginLeft: 4, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="warning" size={13} />Fix errors above to continue</span>}
      </div>
    </form>
  );
}
