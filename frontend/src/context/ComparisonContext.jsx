import React, { createContext, useContext, useState, useEffect } from 'react';

const ComparisonContext = createContext();
const MAX_COMPARE_ITEMS = 4;
const COMPARE_STORAGE_KEY = 'cartiva_compare_v1';

export const ComparisonProvider = ({ children }) => {
  const [comparedProducts, setComparedProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPARE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse compare products from localStorage:', err);
      return [];
    }
  });
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(comparedProducts));
    } catch (err) {
      console.error('Failed to persist compare products to localStorage:', err);
    }
  }, [comparedProducts]);

  const isInCompare = (productId) => {
    return comparedProducts.some((p) => p._id === productId);
  };

  const addToCompare = (product) => {
    if (!product || !product._id) return { success: false, message: 'Invalid product' };

    if (comparedProducts.some((p) => p._id === product._id)) {
      return { success: false, message: 'Product is already in comparison list' };
    }

    if (comparedProducts.length >= MAX_COMPARE_ITEMS) {
      return { success: false, message: `You can compare at most ${MAX_COMPARE_ITEMS} products at once` };
    }

    setComparedProducts((prev) => [...prev, product]);
    return { success: true, message: `Added "${product.title}" to compare` };
  };

  const removeFromCompare = (productId) => {
    setComparedProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const toggleCompare = (product) => {
    if (isInCompare(product._id)) {
      removeFromCompare(product._id);
      return { inCompare: false, message: 'Removed from comparison' };
    } else {
      const res = addToCompare(product);
      return { inCompare: res.success, message: res.message };
    }
  };

  const clearCompare = () => {
    setComparedProducts([]);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedProducts,
        totalCompared: comparedProducts.length,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        openCompareModal: () => setIsCompareModalOpen(true),
        closeCompareModal: () => setIsCompareModalOpen(false)
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
