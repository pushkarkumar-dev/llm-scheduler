'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav style={{
      backgroundColor: 'rgba(13,21,38,0.85)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">

        {/* Brand */}
        <Link href="/" style={{ textDecoration: 'none' }} className="flex items-center gap-2.5 flex-shrink-0">
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '9px',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            width: 30, height: 30,
          }} className="flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 3.5h11M2 7.5h7M2 11.5h9" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              <circle cx="12.5" cy="7.5" r="1.8" fill="white"/>
            </svg>
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em' }}>
            TaskScheduler
          </span>
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', flexShrink: 0 }} />

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {[['/', 'Tasks'], ['/executions', 'Executions']].map(([href, label]) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                borderRadius: '7px',
                fontSize: '13.5px',
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                border: active ? '1px solid var(--border-light)' : '1px solid transparent',
                textDecoration: 'none',
              }}>
                {active && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />
                )}
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          <Link href="/tasks/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '7px 16px',
            borderRadius: '8px',
            fontSize: '13.5px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            color: 'white',
            textDecoration: 'none',
            boxShadow: '0 0 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            New Task
          </Link>
        </div>
      </div>
    </nav>
  );
}
