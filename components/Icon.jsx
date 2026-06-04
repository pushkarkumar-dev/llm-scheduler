// Crisp, consistent line icons (1.6 stroke, 16px grid) — replaces emoji glyphs.
const PATHS = {
  play:     <path d="M5 3.5v9l7-4.5-7-4.5z" fill="currentColor" stroke="none" />,
  pause:    <><rect x="4.5" y="3.5" width="2.2" height="9" rx="0.6" fill="currentColor" stroke="none"/><rect x="9.3" y="3.5" width="2.2" height="9" rx="0.6" fill="currentColor" stroke="none"/></>,
  plus:     <path d="M8 3v10M3 8h10" />,
  trash:    <><path d="M3 4.5h10M6.5 4.5V3.2c0-.4.3-.7.7-.7h1.6c.4 0 .7.3.7.7v1.3M5 4.5l.5 8c0 .4.4.8.8.8h3.4c.4 0 .8-.4.8-.8l.5-8"/></>,
  edit:     <path d="M11 2.5l2.5 2.5L6 12.5l-3 .5.5-3L11 2.5z" />,
  copy:     <><rect x="5.5" y="5.5" width="7.5" height="7.5" rx="1.3"/><path d="M10.5 5.5V4a1.3 1.3 0 00-1.3-1.3H4A1.3 1.3 0 002.7 4v5.2A1.3 1.3 0 004 10.5h1.5"/></>,
  check:    <path d="M3 8.5l3 3 7-7" />,
  x:        <path d="M4 4l8 8M12 4l-8 8" />,
  chevronL: <path d="M10 3.5L5.5 8l4.5 4.5" />,
  chevronR: <path d="M6 3.5L10.5 8 6 12.5" />,
  chevronD: <path d="M3.5 6L8 10.5 12.5 6" />,
  chevronU: <path d="M3.5 10L8 5.5 12.5 10" />,
  arrowL:   <path d="M12.5 8h-9M6.5 4.5L3 8l3.5 3.5" />,
  clock:    <><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></>,
  calendar: <><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M5.5 2v3M10.5 2v3M2.5 6.5h11"/></>,
  bolt:     <path d="M8.5 2L3.5 9h3.5l-1 5 5-7H7.5l1-5z" fill="currentColor" stroke="none"/>,
  circleCheck: <><circle cx="8" cy="8" r="6"/><path d="M5.5 8l1.8 1.8L10.5 6.3"/></>,
  refresh:  <><path d="M13 7a5 5 0 10-.5 4"/><path d="M13 3v4h-4"/></>,
  warning:  <><path d="M8 2.5l6 11H2l6-11z"/><path d="M8 6.5v3.5M8 11.5v.5"/></>,
  list:     <path d="M5 4h9M5 8h9M5 12h9M2.5 4v.01M2.5 8v.01M2.5 12v.01" />,
  info:     <><circle cx="8" cy="8" r="6"/><path d="M8 7.5v3M8 5.5v.5"/></>,
  spinner:  <circle cx="8" cy="8" r="5.5" strokeDasharray="26 9" strokeLinecap="round" />,
};

export default function Icon({ name, size = 16, className = '', style = {}, strokeWidth = 1.6 }) {
  const path = PATHS[name];
  if (!path) return null;
  const spinning = name === 'spinner';
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, ...(spinning ? { animation: 'spin 0.7s linear infinite' } : {}), ...style }}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
