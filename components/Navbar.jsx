'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from './Icon';
import Button from './Button';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const links = [
    { href: '/', label: 'Tasks', icon: 'list' },
    { href: '/executions', label: 'Executions', icon: 'bolt' },
  ];

  return (
    <nav style={{
      backgroundColor: 'rgba(10,15,26,0.72)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--gradient-accent)',
            boxShadow: '0 0 16px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            <Icon name="clock" size={16} style={{ color: '#fff' }} strokeWidth={1.8} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            LLM&nbsp;Scheduler
          </span>
        </Link>

        <div style={{ width: 1, height: 22, backgroundColor: 'var(--border)', flexShrink: 0 }} />

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {links.map(({ href, label, icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '6px 12px', borderRadius: 8,
                fontSize: 13.5, fontWeight: active ? 600 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-light)' : 'transparent'}`,
                textDecoration: 'none',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                <Icon name={icon} size={15} style={{ color: active ? 'var(--accent-soft)' : 'inherit' }} />
                {label}
              </Link>
            );
          })}
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <Button href="/tasks/new" variant="primary" size="sm" icon="plus">New Task</Button>
        </div>
      </div>
    </nav>
  );
}
