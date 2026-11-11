import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Lock,
  ShoppingBag,
  Store,
  AlertCircle,
  ArrowLeft,
  Package,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { createOrderApi } from '../services/api';

export const CheckoutModal = ({ isOpen, onClose, onOrderPlaced, onNavigateToAccount, onBrowseCatalogue }) => {
  const { items, subtotal, shippingFee, grandTotal, groupedBySeller, clearCart } = useCart();
  const { addToast } = useToast();
  const { user, token, ensureAuthenticatedSession } = useAuth();

  const [step, setStep] = useState('checkout'); // 'checkout' | 'processing' | 'success'
  const [confirmedOrder, setConfirmedOrder] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cartiva_latest_confirmed_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Shrestha Jain',
    email: user?.email || 'shrestha@example.com',
    password: '',
    phone: '+91 98765 43210',
    address: '402, Lotus Courtyard, 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'mock_card' | 'mock_upi'

  // Update name/email if user logs in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Reset or restore step when modal opens (supports reopening confirmation safely)
  useEffect(() => {
    if (isOpen) {
      setFormError('');
      const hash = window.location.hash || '';
      if (hash.includes('step=success') || hash.includes('confirmation')) {
        try {
          const saved = sessionStorage.getItem('cartiva_latest_confirmed_order');
          if (saved) {
            setConfirmedOrder(JSON.parse(saved));
            setStep('success');
            return;
          }
        } catch {}
      }
      if (step === 'success' && !confirmedOrder) {
        setStep('checkout');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Recipient full name is required for insured delivery';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      return 'Please enter a valid email address for dispatch tracking';
    }
    if (!token && (!formData.password || formData.password.length < 6)) {
      return 'Please enter an account password (at least 6 characters) to authenticate your acquisition';
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) return 'Please provide a valid 10-digit mobile number';
    if (!formData.address.trim()) return 'Delivery street address is required';
    if (!formData.city.trim()) return 'Delivery city is required';
    if (!formData.state.trim()) return 'State/Province is required';
    if (!formData.pincode.trim() || formData.pincode.trim().length < 4) {
      return 'Please provide a valid postal code';
    }
    return null;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setFormError('Your shopping bag is empty. Please add handcrafted pieces before checkout.');
      return;
    }

    const error = validateForm();
    if (error) {
      setFormError(error);
      addToast(error, 'warning');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      // 1. Ensure user has a valid JWT session using their personal account credentials
      const activeToken = await ensureAuthenticatedSession({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (!activeToken) {
        throw new Error('Authentication session could not be established. Please try again.');
      }

      // 2. Format backend order payload
      const orderPayload = {
        items: items.map((it) => ({
          productId: it.product._id,
          quantity: it.quantity
        })),
        shippingAddress: {
          fullName: formData.name.trim(),
          phone: formData.phone.trim(),
          street: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.pincode.trim(),
          country: formData.country || 'India'
        },
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'mock_online'
      };

      // 3. Post to backend
      const res = await createOrderApi(orderPayload, activeToken);

      if (res.success && res.order) {
        setConfirmedOrder(res.order);
        try {
          sessionStorage.setItem('cartiva_latest_confirmed_order', JSON.stringify(res.order));
        } catch {}
        setStep('success');
        clearCart();
        addToast(`Order ${res.order.orderReference} confirmed!`, 'success');
        if (onOrderPlaced) {
          onOrderPlaced(res.order);
        }
      } else {
        throw new Error(res.message || 'Unable to place order');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setFormError(err.message || 'An error occurred while confirming your order. Please try again.');
      addToast(err.message || 'Order failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={step === 'success' ? onClose : undefined}>
      <div
        className="checkout-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {/* Header */}
        <div className="checkout-modal-header">
          <div className="checkout-title-group">
            <Lock size={18} className="lock-icon" />
            <h2 id="checkout-title">
              {step === 'checkout'
                ? 'Artisan Studio Direct Checkout'
                : 'Acquisition Confirmed & Allocated'}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        {step === 'checkout' ? (
          <div className="checkout-modal-body">
            {/* Left: Form Column */}
            <form onSubmit={handleSubmitOrder} className="checkout-form-column" noValidate>
              {/* Back to Bag navigation */}
              <button
                type="button"
                className="checkout-back-link"
                onClick={onClose}
              >
                <ArrowLeft size={14} />
                <span>Return to Shopping Bag</span>
              </button>

              {formError && (
                <div className="checkout-error-banner" role="alert">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              {/* SECTION 1: Insured Delivery Address */}
              <div className="checkout-section">
                <div className="sec-header-row">
                  <span className="sec-num-pill">1</span>
                  <h3 className="checkout-sec-title">Insured Studio Delivery Destination</h3>
                </div>

                <div className="checkout-fields-grid">
                  <div className="field-group span-2">
                    <label htmlFor="chk-name">Full Recipient Name *</label>
                    <input
                      id="chk-name"
                      type="text"
                      required
                      placeholder="e.g. Shrestha Jain"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="chk-email">Dispatch Email *</label>
                    <input
                      id="chk-email"
                      type="email"
                      required
                      placeholder="patron@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  {!token && (
                    <div className="field-group">
                      <label htmlFor="chk-password">Account Password *</label>
                      <input
                        id="chk-password"
                        type="password"
                        required
                        placeholder="Min 6 characters to sign in/register"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="field-group">
                    <label htmlFor="chk-phone">Contact Phone *</label>
                    <input
                      id="chk-phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="field-group span-2">
                    <label htmlFor="chk-street">Street Address & Landmark *</label>
                    <input
                      id="chk-street"
                      type="text"
                      required
                      placeholder="Flat/House No., Building Name, Street"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="chk-city">City *</label>
                    <input
                      id="chk-city"
                      type="text"
                      required
                      placeholder="Bengaluru"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="chk-state">State / Province *</label>
                    <input
                      id="chk-state"
                      type="text"
                      required
                      placeholder="Karnataka"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="chk-pin">Postal Code / Pincode *</label>
                    <input
                      id="chk-pin"
                      type="text"
                      required
                      maxLength={10}
                      placeholder="560038"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                    />
                  </div>

                  <div className="field-group">
                    <label htmlFor="chk-country">Country</label>
                    <input
                      id="chk-country"
                      type="text"
                      readOnly
                      value={formData.country}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Studio Packaging & Courier */}
              <div className="checkout-section">
                <div className="sec-header-row">
                  <span className="sec-num-pill">2</span>
                  <h3 className="checkout-sec-title">Studio Packaging & Direct Transit</h3>
                </div>

                <div className="shipping-methods-row">
                  <label className="shipping-method-card selected">
                    <input type="radio" name="shipping" checked readOnly />
                    <div className="method-info">
                      <div className="method-header">
                        <Truck size={16} />
                        <span className="method-name">Artisan Studio Direct Courier</span>
                      </div>
                      <span className="method-time">
                        Packaged at origin with certificate of authenticity. 2–4 business days.
                      </span>
                    </div>
                    <span className="method-price">
                      {subtotal >= 2999 ? 'COMPLIMENTARY' : '₹149'}
                    </span>
                  </label>
                </div>
              </div>

              {/* SECTION 3: Payment Method (MVP Transparent Cash on Delivery & Test Mode) */}
              <div className="checkout-section">
                <div className="sec-header-row">
                  <span className="sec-num-pill">3</span>
                  <h3 className="checkout-sec-title">Payment Settlement</h3>
                </div>

                <div className="payment-options-row">
                  <button
                    type="button"
                    className={`pay-option-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="pay-opt-title">Cash on Delivery</div>
                    <span className="pay-opt-desc">Pay upon studio delivery</span>
                  </button>

                  <button
                    type="button"
                    className={`pay-option-btn ${paymentMethod === 'mock_upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('mock_upi')}
                  >
                    <div className="pay-opt-title">Instant UPI / QR</div>
                    <span className="pay-opt-desc">Verified Test Sandbox</span>
                  </button>

                  <button
                    type="button"
                    className={`pay-option-btn ${paymentMethod === 'mock_card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('mock_card')}
                  >
                    <div className="pay-opt-title">Credit / Debit Card</div>
                    <span className="pay-opt-desc">Verified Test Sandbox</span>
                  </button>
                </div>

                <div className="payment-disclaimer-box">
                  <ShieldCheck size={16} />
                  <span>
                    <strong>MVP Settlement Notice:</strong> Cash on Delivery & Verified Test Mode.
                    No live credit card or payment gateway is charged during this challenge phase.
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-primary btn-place-order"
                disabled={submitting || items.length === 0}
              >
                {submitting ? (
                  <span>Verifying Studio Inventory & Allocating...</span>
                ) : (
                  <>
                    <span>Confirm & Authorize Acquisition (₹{Number(grandTotal).toLocaleString('en-IN')})</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Right: Order Summary Column with Multi-Vendor Grouping */}
            <aside className="checkout-summary-column">
              <div className="summary-header-block">
                <h3 className="summary-title">Order Allocation</h3>
                <span className="summary-item-count">
                  {items.reduce((acc, it) => acc + it.quantity, 0)} pieces from {groupedBySeller.length} studios
                </span>
              </div>

              {/* Multi-Vendor Studio Grouping */}
              <div className="checkout-items-scroll">
                {groupedBySeller.map((group) => (
                  <div key={group.sellerId} className="checkout-vendor-group">
                    <div className="vendor-group-bar">
                      <Store size={14} />
                      <span className="vendor-name">Atelier: {group.storeName}</span>
                      <span className="vendor-count">({group.sellerTotalQuantity} items)</span>
                    </div>

                    <div className="vendor-group-items">
                      {group.items.map((item) => (
                        <div key={item.product._id} className="checkout-item-row">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="checkout-item-thumb"
                          />
                          <div className="checkout-item-details">
                            <h4 className="checkout-item-title">{item.product.title}</h4>
                            <div className="checkout-item-meta">
                              <span className="checkout-unit-price">
                                ₹{Number(item.product.price).toLocaleString('en-IN')}
                              </span>
                              <span className="checkout-item-qty">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="checkout-item-price">
                            ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="vendor-group-subtotal">
                      <span>Studio Subtotal:</span>
                      <strong>₹{Number(group.sellerSubtotal).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="checkout-totals-box">
                <div className="totals-row">
                  <span>Bag Subtotal:</span>
                  <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="totals-row">
                  <span>Studio Packaging & Courier:</span>
                  <span>{shippingFee === 0 ? 'COMPLIMENTARY' : `₹${shippingFee}`}</span>
                </div>
                <div className="totals-row">
                  <span>All Taxes Included:</span>
                  <span>₹0.00</span>
                </div>
                <div className="totals-row grand-total">
                  <span>Payable Total:</span>
                  <span>₹{Number(grandTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Cartiva Trust Guarantee */}
              <div className="checkout-trust-badge">
                <ShieldCheck size={18} />
                <div className="trust-text">
                  <strong>Cartiva Authenticity Guarantee</strong>
                  <span>Every master piece is certified by its registered maker.</span>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* Order Success Confirmation View */
          <div className="order-success-pane">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} />
            </div>

            <span className="confirmation-kicker">Acquisition Confirmed & Allocated</span>
            <h2 className="confirmation-headline">Thank You, Patron of Craft</h2>

            <div className="order-reference-card">
              <div className="ref-label">Parent Order Reference</div>
              <div className="ref-code">{confirmedOrder?.orderReference || 'CTV-CONFIRMED'}</div>
              <div className="ref-sub">
                Allocated across {confirmedOrder?.sellerGroups?.length || 1} independent artisan studios
              </div>
            </div>

            {/* Studio Allocations Breakdown */}
            <div className="confirmation-seller-groups">
              <h4 className="sec-small-title">Allocated Studio Dispatches:</h4>
              {confirmedOrder?.sellerGroups?.map((group, idx) => (
                <div key={idx} className="confirmed-group-row">
                  <div className="group-left">
                    <Store size={14} />
                    <span className="group-studio">{group.storeName}</span>
                    <span className="group-subref">{group.subOrderReference}</span>
                  </div>
                  <div className="group-right">
                    <span className="group-status-pill">{group.status}</span>
                    <span className="group-total">₹{Number(group.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Destination summary */}
            <div className="confirmation-dest-summary">
              <p>
                <strong>Delivery Destination:</strong> {confirmedOrder?.shippingAddress?.fullName},{' '}
                {confirmedOrder?.shippingAddress?.street}, {confirmedOrder?.shippingAddress?.city},{' '}
                {confirmedOrder?.shippingAddress?.state} – {confirmedOrder?.shippingAddress?.postalCode}
              </p>
              <p>
                <strong>Confirmed Grand Total:</strong> ₹{Number(confirmedOrder?.totalAmount || 0).toLocaleString('en-IN')}{' '}
                ({confirmedOrder?.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid in Test Mode'})
              </p>
            </div>

            <div className="confirmation-actions-row">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  onClose();
                  if (onNavigateToAccount) {
                    onNavigateToAccount();
                  }
                }}
              >
                <Package size={16} />
                <span>View in My Order History</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  onClose();
                  if (onBrowseCatalogue) {
                    onBrowseCatalogue();
                  }
                }}
              >
                <span>Continue Exploring Catalogue</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};