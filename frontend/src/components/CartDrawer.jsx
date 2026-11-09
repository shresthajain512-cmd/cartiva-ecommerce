import React, { useEffect } from 'react';
import {
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Store,
  AlertTriangle,
  ArrowLeft,
  Truck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CartDrawer = ({ onOpenCheckout, onBrowseCatalogue }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    grandTotal,
    totalItems,
    FREE_SHIPPING_THRESHOLD,
    groupedBySeller,
    sellerCount,
    hasOutOfStockItems
  } = useCart();

  const { addToast } = useToast();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    if (hasOutOfStockItems) {
      addToast('Please remove out-of-stock items before proceeding to checkout', 'warning');
      return;
    }
    closeCart();
    if (onOpenCheckout) {
      onOpenCheckout();
    }
  };

  const handleBrowseClick = () => {
    closeCart();
    if (onBrowseCatalogue) {
      onBrowseCatalogue();
    }
  };

  const handleRemove = (product) => {
    removeFromCart(product._id || product.id);
    addToast(`Removed "${product.title}" from your shopping bag`, 'info');
  };

  return (
    <div
      className="cart-drawer-overlay animate-fade-in"
      onClick={closeCart}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag Drawer"
    >
      <div className="cart-drawer-card animate-slide-left" onClick={(e) => e.stopPropagation()}>
        {/* 1. Header */}
        <div className="cart-drawer-header">
          <div className="header-title-group">
            <ShoppingBag size={20} className="header-bag-icon" />
            <h2 className="header-title">Shopping Bag</h2>
            <span className="header-count-badge">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeCart}
            aria-label="Close shopping bag"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. Free Shipping Progress Bar */}
        {subtotal > 0 && (
          <div className="shipping-progress-box">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <p className="shipping-congrats">
                <Sparkles size={14} color="var(--color-gold)" />
                <span>You have unlocked <strong>Complimentary Studio Shipping</strong>!</span>
              </p>
            ) : (
              <p className="shipping-needed">
                <Truck size={14} />
                <span>
                  Add <strong>₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')}</strong> more for complimentary shipping.
                </span>
              </p>
            )}
            <div className="progress-track" aria-hidden="true">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))}%`
                }}
              />
            </div>
          </div>
        )}

        {/* 3. Main Drawer Body */}
        <div className="cart-drawer-body">
          {items.length === 0 ? (
            /* Empty Cart State */
            <div className="empty-cart-view animate-fade-in">
              <div className="empty-bag-circle">
                <ShoppingBag size={40} strokeWidth={1.5} color="var(--color-gold)" />
              </div>
              <h3 className="empty-bag-title">Your Shopping Bag is Empty</h3>
              <p className="empty-bag-desc">
                Explore our master catalogue of handcrafted artisanal technology, literature, studio ceramics, and bespoke objects.
              </p>
              <button
                type="button"
                className="btn-primary btn-explore-catalogue"
                onClick={handleBrowseClick}
              >
                <span>Browse Curated Pieces</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            /* Multi-Vendor Grouped Item List */
            <div className="cart-items-container">
              {groupedBySeller.map((group) => (
                <div key={group.sellerId} className="seller-package-group">
                  {/* Studio Header for Multi-Vendor Clarity */}
                  <div className="seller-package-header">
                    <Store size={14} className="package-store-icon" />
                    <span className="package-store-name">{group.storeName}</span>
                    <span className="package-count-badge">
                      {group.items.length} {group.items.length === 1 ? 'piece' : 'pieces'}
                    </span>
                  </div>

                  {/* Individual Products within Studio Package */}
                  <div className="package-items-list">
                    {group.items.map((item) => {
                      const prod = item.product;
                      const maxStock = typeof prod.stockCount === 'number' ? Math.max(0, prod.stockCount) : 999;
                      const isOutOfStock = maxStock === 0;
                      const isLowStock = maxStock > 0 && maxStock <= 5;
                      const itemSubtotal = (Number(prod.price) || 0) * item.quantity;

                      return (
                        <div key={prod._id || prod.id} className="cart-item-card">
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="item-thumbnail"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                            }}
                          />

                          <div className="item-info">
                            <div className="item-top-row">
                              <h4 className="item-title" title={prod.title}>{prod.title}</h4>
                              <button
                                type="button"
                                className="btn-trash"
                                onClick={() => handleRemove(prod)}
                                aria-label={`Remove ${prod.title} from bag`}
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Price & Item Subtotal */}
                            <div className="item-price-meta">
                              <span className="item-unit-price">
                                ₹{Number(prod.price).toLocaleString('en-IN')} each
                              </span>
                              <span className="item-total-price">
                                ₹{itemSubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Stock Warning Pills */}
                            {isOutOfStock ? (
                              <div className="item-stock-warning danger">
                                <AlertTriangle size={12} />
                                <span>Sold Out — Remove to proceed</span>
                              </div>
                            ) : isLowStock ? (
                              <div className="item-stock-warning warning">
                                <span>Only {maxStock} remaining in studio inventory</span>
                              </div>
                            ) : null}

                            {/* Stepper & Quantity Controls */}
                            <div className="item-actions-row">
                              <div className="stepper-compact">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(prod._id || prod.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  –
                                </button>
                                <span className="stepper-val">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(prod._id || prod.id, item.quantity + 1)}
                                  disabled={item.quantity >= maxStock || isOutOfStock}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <span className="item-stock-limit-note">
                                Max {maxStock}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Footer & Multi-Vendor Checkout Summary */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="summary-row">
              <span className="summary-label">Subtotal ({totalItems} {totalItems === 1 ? 'piece' : 'pieces'})</span>
              <span className="summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">
                Direct Studio Shipping
                {sellerCount > 1 && (
                  <span className="multi-studio-badge"> ({sellerCount} Ateliers)</span>
                )}
              </span>
              <span className="summary-val">
                {shippingFee === 0 ? <strong className="free-tag">Complimentary</strong> : `₹${shippingFee}`}
              </span>
            </div>

            <div className="summary-row total-row">
              <span className="summary-label">Total Payable</span>
              <span className="summary-total">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Checkout Action Stack */}
            <div className="drawer-cta-stack">
              <button
                type="button"
                className={`btn-primary btn-checkout ${hasOutOfStockItems ? 'disabled' : ''}`}
                onClick={handleCheckoutClick}
                disabled={hasOutOfStockItems}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="btn-continue-shopping"
                onClick={handleBrowseClick}
              >
                <ArrowLeft size={14} />
                <span>Continue Shopping Catalogue</span>
              </button>
            </div>

            <div className="footer-guarantee">
              <ShieldCheck size={14} className="shield-icon" />
              <span>Direct Maker Provenance • Fully Insured Studio Packaging</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 700;
          background: rgba(37, 37, 34, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
        }

        .cart-drawer-card {
          width: 100%;
          max-width: 480px;
          height: 100%;
          background-color: var(--color-white);
          display: flex;
          flex-direction: column;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          border-left: 1px solid var(--color-beige);
        }

        .cart-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.4rem 1.75rem;
          border-bottom: 1px solid var(--color-beige);
          background-color: var(--color-cream);
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .header-bag-icon {
          color: var(--color-gold);
        }

        .header-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          margin: 0;
          color: var(--color-charcoal);
        }

        .header-count-badge {
          font-size: 0.85rem;
          color: var(--color-charcoal-muted);
          font-weight: 500;
        }

        .drawer-close-btn {
          background: none;
          border: none;
          color: var(--color-charcoal);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
          transition: background-color var(--transition-fast);
        }
        .drawer-close-btn:hover {
          background-color: var(--color-beige);
        }

        .shipping-progress-box {
          padding: 0.85rem 1.75rem;
          background-color: var(--color-cream-light);
          border-bottom: 1px solid var(--color-beige);
          font-size: 0.82rem;
        }

        .shipping-congrats,
        .shipping-needed {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin: 0 0 0.45rem;
          color: var(--color-charcoal);
        }

        .progress-track {
          width: 100%;
          height: 5px;
          background-color: var(--color-beige);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-gold-muted), var(--color-gold));
          border-radius: var(--radius-full);
          transition: width 0.3s ease-out;
        }

        .cart-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 1.75rem;
        }

        .empty-cart-view {
          text-align: center;
          padding: 4.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-bag-circle {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background-color: var(--color-cream);
          border: 1px solid var(--color-beige);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .empty-bag-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          margin: 0 0 0.5rem;
          color: var(--color-charcoal);
        }

        .empty-bag-desc {
          color: var(--color-charcoal-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0 0 2rem;
          max-width: 320px;
        }

        .btn-explore-catalogue {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.85rem 1.75rem;
        }

        .seller-package-group {
          margin-bottom: 1.5rem;
          border: 1px solid var(--color-beige);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .seller-package-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          background-color: var(--color-cream-light);
          border-bottom: 1px solid var(--color-beige);
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-charcoal);
        }

        .package-store-icon {
          color: var(--color-gold);
        }

        .package-count-badge {
          margin-left: auto;
          font-size: 0.74rem;
          color: var(--color-charcoal-muted);
        }

        .cart-item-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid var(--color-beige-light);
          background-color: var(--color-white);
        }
        .cart-item-card:last-child {
          border-bottom: none;
        }

        .item-thumbnail {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-beige);
          flex-shrink: 0;
        }

        .item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .item-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .item-title {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
          color: var(--color-charcoal);
          line-height: 1.35;
        }

        .btn-trash {
          background: none;
          border: none;
          color: var(--color-charcoal-muted);
          cursor: pointer;
          padding: 0.2rem;
          border-radius: var(--radius-sm);
          transition: color var(--transition-fast);
        }
        .btn-trash:hover {
          color: var(--color-danger);
        }

        .item-price-meta {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          font-size: 0.84rem;
        }

        .item-unit-price {
          color: var(--color-charcoal-muted);
        }

        .item-total-price {
          font-weight: 700;
          color: var(--color-charcoal);
        }

        .item-stock-warning {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          width: fit-content;
        }
        .item-stock-warning.warning {
          background-color: var(--color-warning-bg);
          color: var(--color-warning);
        }
        .item-stock-warning.danger {
          background-color: var(--color-danger-bg);
          color: var(--color-danger);
          font-weight: 600;
        }

        .item-actions-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.25rem;
        }

        .stepper-compact {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--color-beige);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--color-cream-light);
        }

        .stepper-compact button {
          background: none;
          border: none;
          width: 26px;
          height: 26px;
          font-size: 0.95rem;
          color: var(--color-charcoal);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stepper-compact button:disabled {
          color: var(--color-beige-dark);
          cursor: not-allowed;
        }

        .stepper-val {
          width: 28px;
          text-align: center;
          font-size: 0.84rem;
          font-weight: 600;
        }

        .item-stock-limit-note {
          font-size: 0.72rem;
          color: var(--color-charcoal-muted);
        }

        .cart-drawer-footer {
          padding: 1.4rem 1.75rem;
          background-color: var(--color-cream);
          border-top: 1px solid var(--color-beige);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--color-charcoal);
        }

        .multi-studio-badge {
          font-size: 0.76rem;
          color: var(--color-gold);
          font-weight: 600;
        }

        .free-tag {
          color: var(--color-success);
          font-weight: 600;
        }

        .total-row {
          border-top: 1px solid var(--color-beige);
          padding-top: 0.85rem;
          margin-top: 0.25rem;
          font-size: 1.15rem;
          font-weight: 700;
        }

        .summary-total {
          color: var(--color-charcoal);
        }

        .drawer-cta-stack {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .btn-checkout {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.95rem;
          font-size: 0.95rem;
        }

        .btn-continue-shopping {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          color: var(--color-charcoal);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.4rem;
          transition: color var(--transition-fast);
        }
        .btn-continue-shopping:hover {
          color: var(--color-gold);
        }

        .footer-guarantee {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.74rem;
          color: var(--color-charcoal-muted);
          margin-top: 0.25rem;
        }

        .shield-icon {
          color: var(--color-gold);
        }

        @media (max-width: 480px) {
          .cart-drawer-card {
            max-width: 100%;
          }
          .cart-drawer-header,
          .cart-drawer-body,
          .cart-drawer-footer {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};
