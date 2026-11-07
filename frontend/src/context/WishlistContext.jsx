import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'cartiva_wishlist_v1';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse wishlist from localStorage:', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to persist wishlist to localStorage:', err);
    }
  }, [wishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  const addToWishlist = (product) => {
    if (!product || !product._id) return;
    setWishlist((prev) => {
      if (prev.some((item) => item._id === product._id)) return prev;
      return [product, ...prev];
    });
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
  };

  const toggleWishlist = (product) => {
    if (!product || !product._id) return;
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
      return false;
    } else {
      addToWishlist(product);
      return true;
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        totalWishlist: wishlist.length,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
