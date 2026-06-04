'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [view, setViewState]     = useState('all');   // all | production | experimental | test
  const [testUnlocked, setUnlock] = useState(false);
  const [hydrated, setHydrated]   = useState(false);

  // Hydrate from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const unlocked = sessionStorage.getItem('test-unlocked') === '1';
    const saved    = sessionStorage.getItem('category-view');
    setUnlock(unlocked);
    // Never restore the gated 'test' view without an active unlock
    if (saved && (saved !== 'test' || unlocked)) setViewState(saved);
    setHydrated(true);
  }, []);

  const setView = useCallback((next) => {
    setViewState(next);
    sessionStorage.setItem('category-view', next);
  }, []);

  const unlockTest = useCallback(() => {
    setUnlock(true);
    sessionStorage.setItem('test-unlocked', '1');
  }, []);

  return (
    <CategoryContext.Provider value={{ view, setView, testUnlocked, unlockTest, hydrated }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategory must be used within CategoryProvider');
  return ctx;
}
