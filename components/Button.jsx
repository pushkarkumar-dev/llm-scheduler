'use client';

import Link from 'next/link';
import Icon from './Icon';

const VARIANTS = {
  primary: {
    background: 'var(--gradient-accent)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'var(--shadow-glow), inset 0 1px 0 rgba(255,255,255,0.12)',
  },
  secondary: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    boxShadow: 'none',
  },
  accent: {
    background: 'rgba(99,102,241,0.12)',
    color: 'var(--accent-soft)',
    border: '1px solid rgba(99,102,241,0.3)',
    boxShadow: 'none',
  },
  success: {
    background: 'rgba(16,185,129,0.12)',
    color: 'var(--success-fg)',
    border: '1px solid rgba(16,185,129,0.3)',
    boxShadow: 'none',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--danger-fg)',
    border: '1px solid rgba(239,68,68,0.28)',
    boxShadow: 'none',
  },
};

const SIZES = {
  xs: { padding: '4px 10px',  fontSize: 12,   gap: 5,  radius: 'var(--r-sm)' },
  sm: { padding: '7px 14px',  fontSize: 13,   gap: 6,  radius: 'var(--r-md)' },
  md: { padding: '9px 18px',  fontSize: 13.5, gap: 7,  radius: 'var(--r-md)' },
};

export default function Button({
  children, variant = 'secondary', size = 'sm', icon, iconRight,
  loading = false, disabled = false, href, onClick, type = 'button',
  title, style = {},
}) {
  const v = VARIANTS[variant] ?? VARIANTS.secondary;
  const s = SIZES[size] ?? SIZES.sm;
  const isDisabled = disabled || loading;

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: s.gap,
    padding: s.padding, fontSize: s.fontSize, fontWeight: 600, lineHeight: 1,
    borderRadius: s.radius, textDecoration: 'none', whiteSpace: 'nowrap',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    ...v, ...style,
  };

  const lift = (e, on) => {
    if (isDisabled || variant !== 'primary') {
      // subtle background shift for non-primary
      if (!isDisabled && variant === 'secondary') e.currentTarget.style.background = on ? 'var(--bg-hover)' : v.background;
      if (!isDisabled && variant === 'ghost') e.currentTarget.style.background = on ? 'var(--bg-elevated)' : 'transparent';
      return;
    }
    e.currentTarget.style.transform = on ? 'translateY(-1px)' : 'translateY(0)';
    e.currentTarget.style.boxShadow = on
      ? '0 0 36px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
      : v.boxShadow;
  };
  const press = (e, down) => { if (!isDisabled) e.currentTarget.style.transform = down ? 'translateY(1px)' : 'translateY(0)'; };

  const inner = (
    <>
      {loading ? <Icon name="spinner" size={s.fontSize} /> : icon ? <Icon name={icon} size={s.fontSize} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={s.fontSize} /> : null}
    </>
  );

  const handlers = {
    onMouseEnter: e => lift(e, true),
    onMouseLeave: e => lift(e, false),
    onMouseDown: e => press(e, true),
    onMouseUp: e => press(e, false),
    title,
  };

  if (href && !isDisabled) {
    return <Link href={href} style={base} {...handlers}>{inner}</Link>;
  }

  return (
    <button type={type} onClick={onClick} disabled={isDisabled} style={base} {...handlers}>
      {inner}
    </button>
  );
}
