import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'cartiva_cart_v1';
const FREE_SHIPPING_THRESHOLD = 2999;
const STANDARD_SHIPPING_FEE = 149;

export const CartProvider = ({ children }) => {
  // 1. Initial State with Safe Sanitization & Error Recovery
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      // Filter and sanitize items to prevent malformed or outdated records
      return parsed.filter(
        (item) =>
          item &&
          item.product &&
          (item.product._id || item.product.id) &&
          typeof item.quantity === 'number' &&
          item.quantity > 0 &&
          !isNaN(Number(item.product.price))
      );
    } catch (err) {
      console.warn('Failed to parse cart from localStorage:', err.message);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // 2. LocalStorage Persistence
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart to localStorage:', err.message);
    }
  }, [items]);

  // Toast notification helper
  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  /**
   * Add a product to cart or increment quantity
   * Enforces stock limits and preserves seller identity for multi-vendor splitting
   */
  const addToCart = (product, quantity = 1) => {
    if (!product || (!product._id && !product.id)) {
      return { success: false, message: 'Invalid product' };
    }

    const prodId = product._id || product.id;
    const requestedQty = Math.max(1, parseInt(quantity, 10) || 1);
    const maxStock = typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 999;

    if (maxStock === 0) {
      triggerNotification(`"${product.title}" is currently out of stock`);
      return { success: false, message: 'Product is sold out' };
    }

    // Normalize seller & store information for Day 11 multi-vendor split orders
    const normalizedProduct = {
      ...product,
      _id: prodId,
      sellerId: product.seller?._id || product.seller || product.sellerId || 'cartiva-artisan',
      storeName: product.storeName || product.seller?.businessName || 'Verified Artisan Studio'
    };

    let reachedMaxStock = false;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.product._id || item.product.id) === prodId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity;
        const newQty = currentQty + requestedQty;

        if (newQty > maxStock) {
          reachedMaxStock = true;
          updated[existingIndex].quantity = maxStock;
        } else {
          updated[existingIndex].quantity = newQty;
        }
        return updated;
      } else {
        const clampedQty = Math.min(requestedQty, maxStock);
        if (clampedQty < requestedQty) {
          reachedMaxStock = true;
        }
        return [...prevItems, { product: normalizedProduct, quantity: clampedQty }];
      }
    });

    if (reachedMaxStock) {
      triggerNotification(`Adjusted to maximum available studio inventory (${maxStock} pieces)`);
    } else {
      triggerNotification(`Added ${requestedQty} × "${product.title}" to your shopping bag`);
    }

    return { success: true };
  };

  /**
   * Remove item from cart by product ID
   */
  const removeFromCart = (productId) => {
    if (!productId) return;
    setItems((prev) =>
      prev.filter((item) => (item.product._id || item.product.id) !== productId)
    );
  };

  /**
   * Update item quantity with strict inventory validation
   */
  const updateQuantity = (productId, newQuantity) => {
    if (!productId) return;
    const parsedQty = parseInt(newQuantity, 10);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if ((item.product._id || item.product.id) === productId) {
          const maxStock =
            typeof item.product.stockCount === 'number'
              ? Math.max(0, item.product.stockCount)
              : 999;
          const clamped = Math.min(parsedQty, maxStock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  /**
   * Empty all items from cart
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Get quantity of a specific product currently in bag
   */
  const getItemQuantity = (productId) => {
    if (!productId) return 0;
    const found = items.find((item) => (item.product._id || item.product.id) === productId);
    return found ? found.quantity : 0;
  };

  // 3. Computed Totals & Multi-Vendor Groupings
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.product.price) || 0) * (item.quantity || 0),
        0
      ),
    [items]
  );

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  /**
   * Group cart items by seller ID for Day 11 multi-vendor split checkout
   */
  const groupedBySeller = useMemo(() => {
    const groups = new Map();

    items.forEach((item) => {
      const p = item.product;
      const sId = p.seller?._id || p.seller || p.sellerId || 'cartiva-studio';
      const sName = p.storeName || p.seller?.businessName || 'Verified Artisan Atelier';

      if (!groups.has(sId)) {
        groups.set(sId, {
          sellerId: sId,
          storeName: sName,
          items: [],
          sellerSubtotal: 0,
          sellerTotalQuantity: 0
        });
      }

      const group = groups.get(sId);
      group.items.push(item);
      group.sellerSubtotal += (Number(p.price) || 0) * (item.quantity || 0);
      group.sellerTotalQuantity += item.quantity || 0;
    });

    return Array.from(groups.values());
  }, [items]);

  const hasOutOfStockItems = useMemo(
    () =>
      items.some(
        (item) =>
          typeof item.product.stockCount === 'number' && item.product.stockCount === 0
      ),
    [items]
  );

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        subtotal,
        shippingFee,
        grandTotal,
        FREE_SHIPPING_THRESHOLD,
        groupedBySeller,
        sellerCount: groupedBySeller.length,
        hasOutOfStockItems,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        openCart,
        closeCart,
        notification
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
