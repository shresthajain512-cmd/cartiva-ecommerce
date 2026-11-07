import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onOpenCheckout }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    clearCart
  } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 2999;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 149;
  const grandTotal = subtotal + shippingFee;

  const handleTestCheckout = () => {
    if (onOpenCheckout) {
      setIsCartOpen(false);
      onOpenCheckout();
      return;
    }
    setCheckingOut(true);
    setTimeout(() => {
      const confirmation = {
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
        txnId: `TEST-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: grandTotal,
        itemsCount: totalItems
      };
      setOrderConfirmed(confirmation);
      clearCart();
      setCheckingOut(false);
    }, 1200);
  };

  const handleClose = () => {
    setOrderConfirmed(null);
    setIsCartOpen(false);
  };

  return (
    <div className="cart-drawer-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="cart-drawer-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* 1. Header */}
        <div className="cart-drawer-header">
          <div className="header-title-group">
            <ShoppingBag size={20} className="header-bag-icon" />
            <h2 className="header-title">Shopping Bag</h2>
            <span className="header-count-badge">({totalItems})</span>
          </div>
          <button className="drawer-close-btn" onClick={handleClose} aria-label="Close shopping bag">
            <X size={20} />
          </button>
        </div>

        {/* 2. Free Shipping Progress Bar */}
        {subtotal > 0 && (
          <div className="shipping-progress-box">
            {subtotal >= FREE_SHIPPING_THRESHOLD ? (
              <p className="shipping-congrats">
                ✨ You have unlocked <strong>Complimentary Studio Shipping</strong>!
              </p>
            ) : (
              <p className="shipping-needed">
                Add <strong>₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')}</strong> more to enjoy complimentary shipping.
              </p>
            )}
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* 3. Main Drawer Body */}
        <div className="cart-drawer-body">
          {/* Order Confirmed Screen */}
          {orderConfirmed ? (
            <div className="checkout-success-view animate-fade-in">
              <CheckCircle size={56} className="success-icon" />
              <h3 className="success-title">Order Confirmed (Test Mode)</h3>
              <p className="success-subtitle">
                Thank you for testing the Cartiva marketplace! Your simulated order has been registered.
              </p>

              <div className="receipt-box">
                <div className="receipt-row">
                  <span>Order Reference:</span>
                  <strong>{orderConfirmed.orderId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Test Transaction ID:</span>
                  <strong>{orderConfirmed.txnId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Paid Total:</span>
                  <strong>₹{orderConfirmed.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="receipt-row">
                  <span>Status:</span>
                  <span className="badge badge-success">COMPLETED_TEST_MODE</span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={handleClose}>
                Continue Browsing Catalogue
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="empty-cart-view">
              <div className="empty-bag-circle">
                <ShoppingBag size={36} />
              </div>
              <h3 className="empty-bag-title">Your Bag is Empty</h3>
              <p className="empty-bag-desc">
                Explore our curated collections of artisanal technology, literature, home ceramics, and bespoke fashion.
              </p>
              <button className="btn btn-primary btn-sm" onClick={handleClose}>
                Browse Curated Pieces
              </button>
            </div>
          ) : (
            /* Itemized List */
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.product._id} className="cart-item-card">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="item-thumbnail"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  <div className="item-info">
                    <span className="item-store">
                      {item.product.storeName || item.product.seller?.businessName || 'Artisan Studio'}
                    </span>
                    <h4 className="item-title">{item.product.title}</h4>
                    <span className="item-price">
                      ₹{Number(item.product.price).toLocaleString('en-IN')}
                    </span>

                    <div className="item-actions-row">
                      <div className="stepper-compact">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stockCount || 99)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="btn-trash"
                        onClick={() => removeFromCart(item.product._id)}
                        aria-label={`Remove ${item.product.title} from bag`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Footer & Checkout */}
        {!orderConfirmed && items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Direct Studio Shipping</span>
              <span className="summary-val">
                {shippingFee === 0 ? <strong className="free-tag">Free</strong> : `₹${shippingFee}`}
              </span>
            </div>
            <div className="summary-row total-row">
              <span className="summary-label">Total Payable</span>
              <span className="summary-total">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              className="btn btn-primary btn-checkout"
              onClick={handleTestCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                <span>Simulating Sandbox Payment...</span>
              ) : (
                <>
                  <span>Proceed to Test Checkout</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            <div className="footer-guarantee">
              <ShieldCheck size={14} className="shield-icon" />
              <span>Simulated Test Sandbox — No Real Charges</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 600;
          background: rgba(37, 37, 34, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
        }

        .cart-drawer-card {
          width: 100%;
          max-width: 460px;
          height: 100%;
          background-color: var(--color-white);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-xl);
          border-left: 1px solid var(--color-beige);
        }

        .cart-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid var(--color-beige);
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-bag-icon {
          color: var(--color-gold);
        }

        .header-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          color: var(--color-charcoal);
        }

        .header-count-badge {
          font-size: 0.85rem;
          color: #8C887B;
          font-weight: 500;
        }

        .drawer-close-btn {
          color: var(--color-charcoal-muted);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          transition: background var(--transition-fast);
        }

        .drawer-close-btn:hover {
          background-color: var(--color-beige);
          color: var(--color-charcoal);
        }

        .shipping-progress-box {
          background-color: var(--color-cream);
          padding: 0.85rem 1.75rem;
          border-bottom: 1px solid var(--color-beige);
        }

        .shipping-congrats, .shipping-needed {
          font-size: 0.775rem;
          color: var(--color-charcoal);
          margin-bottom: 0.45rem;
        }

        .progress-track {
          width: 100%;
          height: 5px;
          background-color: var(--color-beige-dark);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background-color: var(--color-gold);
          transition: width var(--transition-normal);
        }

        .cart-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
        }

        .empty-cart-view {
          text-align: center;
          padding: 4rem 1rem;
        }

        .empty-bag-circle {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-full);
          background-color: var(--color-gold-subtle);
          color: var(--color-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .empty-bag-title {
          font-size: 1.35rem;
          color: var(--color-charcoal);
          margin-bottom: 0.5rem;
        }

        .empty-bag-desc {
          font-size: 0.875rem;
          color: var(--color-charcoal-muted);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .cart-item-card {
          display: flex;
          gap: 1rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--color-beige);
        }

        .item-thumbnail {
          width: 76px;
          height: 86px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background-color: var(--color-beige);
          flex-shrink: 0;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .item-store {
          font-size: 0.675rem;
          text-transform: uppercase;
          color: var(--color-gold);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .item-title {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          color: var(--color-charcoal);
          margin-bottom: 0.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-price {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-charcoal);
          margin-bottom: 0.65rem;
        }

        .item-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stepper-compact {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--color-beige-dark);
          border-radius: var(--radius-sm);
          height: 28px;
        }

        .stepper-compact button {
          width: 26px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: var(--color-charcoal);
        }

        .stepper-compact button:hover:not(:disabled) {
          background-color: var(--color-beige);
        }

        .stepper-compact span {
          padding: 0 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .btn-trash {
          color: #A39D90;
          padding: 0.3rem;
          transition: color var(--transition-fast);
        }

        .btn-trash:hover {
          color: var(--color-danger);
        }

        /* Order Confirmed View */
        .checkout-success-view {
          text-align: center;
          padding: 2rem 0;
        }

        .success-icon {
          color: var(--color-success);
          margin: 0 auto 1.25rem;
        }

        .success-title {
          font-size: 1.5rem;
          color: var(--color-charcoal);
          margin-bottom: 0.5rem;
        }

        .success-subtitle {
          font-size: 0.85rem;
          color: var(--color-charcoal-muted);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .receipt-box {
          background-color: var(--color-cream);
          border: 1px solid var(--color-beige);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
          margin-bottom: 1.75rem;
          text-align: left;
          font-size: 0.85rem;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 0.35rem 0;
        }

        .receipt-row strong {
          color: var(--color-charcoal);
        }

        /* Footer */
        .cart-drawer-footer {
          padding: 1.5rem 1.75rem;
          background-color: var(--color-cream-light);
          border-top: 1px solid var(--color-beige);
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          color: var(--color-charcoal-muted);
        }

        .summary-val {
          color: var(--color-charcoal);
          font-weight: 600;
        }

        .free-tag {
          color: var(--color-success);
        }

        .total-row {
          border-top: 1px solid var(--color-beige);
          padding-top: 0.75rem;
          margin-top: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .total-row .summary-label {
          font-weight: 600;
          color: var(--color-charcoal);
        }

        .summary-total {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-charcoal);
        }

        .btn-checkout {
          width: 100%;
          padding: 0.95rem;
          font-size: 0.95rem;
        }

        .footer-guarantee {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #8C887B;
          margin-top: 0.85rem;
        }

        .shield-icon {
          color: var(--color-gold);
        }
      `}</style>
    </div>
  );
};
