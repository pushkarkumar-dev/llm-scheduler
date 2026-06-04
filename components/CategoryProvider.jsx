'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CategoryContext = createContext(null);

export function CategoryProvider({ children }) {
  const [view, setViewState]    = useState('all');   // all | production | experimental | private
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from sessionStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('private-unlocked') === '1';
    const saved      = sessionStorage.getItem('category-view');
    setUnlocked(isUnlocked);
    // Never restore the gated 'private' view without an active unlock
    if (saved && (saved !== 'private' || isUnlocked)) setViewState(saved);
    setHydrated(true);
  }, []);

  const setView = useCallback((next) => {
    setViewState(next);
    sessionStorage.setItem('category-view', next);
  }, []);

  const unlock = useCallback(() => {
    setUnlocked(true);
    sessionStorage.setItem('private-unlocked', '1');
  }, []);

  return (
    <CategoryContext.Provider value={{ view, setView, unlocked, unlock, hydrated }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategory must be used within CategoryProvider');
  return ctx;
}
