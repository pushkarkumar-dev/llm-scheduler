// Task categories — purely organizational, do not affect scheduling.
// 'private' is the gated/hidden bucket (unlocked with a password at the UI level).

export const CATEGORY_META = {
  production:   { label: 'Production',   color: '#34d399', icon: 'circleCheck' },
  experimental: { label: 'Experimental', color: '#fbbf24', icon: 'bolt' },
  private:      { label: 'Private',       color: '#94a3b8', icon: 'lock' },
};

export const CATEGORY_VALUES = ['production', 'experimental', 'private'];

// The default "All" view shows everything except the gated Private bucket.
export function categoriesForView(view) {
  if (view === 'production')   return ['production'];
  if (view === 'experimental') return ['experimental'];
  if (view === 'private')      return ['private'];
  return ['production', 'experimental']; // 'all'
}

export function isValidCategory(value) {
  return CATEGORY_VALUES.includes(value);
}
