import React, { createContext, useContext, useState, useEffect } from 'react';

const RecentlyViewedContext = createContext();
const RECENT_STORAGE_KEY = 'cartiva_recent_viewed_v1';
const MAX_RECENT_ITEMS = 12;

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse recently viewed items:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (err) {
      console.error('Failed to persist recently viewed items:', err);
    }
  }, [recentlyViewed]);

  const addRecentlyViewed = (product) => {
    if (!product || !product._id) return;

    setRecentlyViewed((prev) => {
      // Filter out existing occurrence to prevent duplicates and push to front
      const filtered = prev.filter((item) => item._id !== product._id);
      return [product, ...filtered].slice(0, MAX_RECENT_ITEMS);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addRecentlyViewed,
        clearRecentlyViewed
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};
