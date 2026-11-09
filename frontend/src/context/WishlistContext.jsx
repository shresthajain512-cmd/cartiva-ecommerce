import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();
const WISHLIST_STORAGE_KEY = 'cartiva_wishlist_v1';

export const WishlistProvider = ({ children }) => {
  // 1. Initial State with Safe Sanitization & Recovery
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item) => item && (item._id || item.id) && item.title && !isNaN(Number(item.price))
      );
    } catch (err) {
      console.warn('Failed to parse wishlist from localStorage:', err.message);
      return [];
    }
  });

  // 2. LocalStorage Persistence
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (err) {
      console.warn('Failed to persist wishlist to localStorage:', err.message);
    }
  }, [wishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  const addToWishlist = (product) => {
    if (!product || (!product._id && !product.id)) return false;
    const prodId = product._id || product.id;

    let added = false;
    setWishlist((prev) => {
      if (prev.some((item) => (item._id || item.id) === prodId)) {
        return prev;
      }
      added = true;
      return [
        {
          ...product,
          _id: prodId,
          sellerId: product.seller?._id || product.seller || product.sellerId || 'cartiva-artisan',
          storeName: product.storeName || product.seller?.businessName || 'Verified Artisan Atelier'
        },
        ...prev
      ];
    });
    return added;
  };

  const removeFromWishlist = (productId) => {
    if (!productId) return;
    setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
  };

  const toggleWishlist = (product) => {
    if (!product || (!product._id && !product.id)) return false;
    const prodId = product._id || product.id;

    if (isInWishlist(prodId)) {
      removeFromWishlist(prodId);
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
