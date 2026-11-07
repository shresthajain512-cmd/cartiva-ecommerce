import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CreditCard, CheckCircle2, ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CheckoutModal = ({ isOpen, onClose, onOrderPlaced }) => {
  const { items, subtotal, clearCart } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState('checkout'); // 'checkout' | 'success'
  const [formData, setFormData] = useState({
    name: 'Shrestha Jain',
    email: 'shrestha@example.com',
    phone: '9876543210',
    address: '402, Lotus Courtyard, 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038'
  });

  const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' | 'priority'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'cod'
  const [orderId, setOrderId] = useState('');

  if (!isOpen) return null;

  const shippingCost = subtotal >= 2999 || shippingMethod === 'standard' ? 0 : 250;
  const grandTotal = subtotal + shippingCost;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.pincode) {
      addToast('Please complete required shipping fields', 'warning');
      return;
    }

    const generatedId = `CTV-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setStep('success');
    clearCart();
    addToast(`Order ${generatedId} confirmed!`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="checkout-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        <div className="checkout-modal-header">
          <div className="checkout-title-group">
            <Lock size={18} className="lock-icon" />
            <h2 id="checkout-title">
              {step === 'checkout' ? 'Artisan Studio Direct Checkout' : 'Order Successfully Placed'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
            <X size={20} />
          </button>
        </div>

        {step === 'checkout' ? (
          <div className="checkout-modal-body">
            {/* Left: Form */}
            <form onSubmit={handleSubmitOrder} className="checkout-form-column">
              {/* Shipping Address */}
              <div className="checkout-section">
                <h3 className="checkout-sec-title">1. Insured Delivery Address</h3>
                <div className="checkout-fields-grid">
                  <div className="field-group span-2">
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label>Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="field-group span-2">
                    <label>Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label>City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label>State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Speed */}
              <div className="checkout-section">
                <h3 className="checkout-sec-title">2. Studio Courier Selection</h3>
                <div className="shipping-methods-row">
                  <label className={`shipping-method-card ${shippingMethod === 'standard' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                    />
                    <div>
                      <span className="method-name">Complimentary Insured Express</span>
                      <span className="method-time">Delivers in 2–4 business days</span>
                    </div>
                    <span className="method-price">FREE</span>
                  </label>

                  <label className={`shipping-method-card ${shippingMethod === 'priority' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'priority'}
                      onChange={() => setShippingMethod('priority')}
                    />
                    <div>
                      <span className="method-name">Priority Direct Courier</span>
                      <span className="method-time">Next-Day studio dispatch</span>
                    </div>
                    <span className="method-price">₹250</span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h3 className="checkout-sec-title">3. Payment Method</h3>
                <div className="payment-options-row">
                  <button
                    type="button"
                    className={`pay-option-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <span>Instant UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-option-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <span>Credit / Debit Card</span>
                  </button>
                  <button
                    type="button"
                    className={`pay-option-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary btn-place-order">
                <span>Confirm & Place Order (₹{Number(grandTotal).toLocaleString('en-IN')})</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Right: Order Summary */}
            <aside className="checkout-summary-column">
              <h3 className="summary-title">Order Allocation ({items.length} items)</h3>
              <div className="checkout-items-scroll">
                {items.map((item) => (
                  <div key={item.product._id} className="checkout-item-row">
                    <img src={item.product.imageUrl} alt={item.product.title} />
                    <div className="checkout-item-details">
                      <span className="checkout-item-store">{item.product.storeName}</span>
                      <h4 className="checkout-item-title">{item.product.title}</h4>
                      <span className="checkout-item-qty">Qty: {item.quantity}</span>
                    </div>
                    <span className="checkout-item-price">
                      ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="checkout-totals-box">
                <div className="totals-row">
                  <span>Bag Subtotal:</span>
                  <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="totals-row">
                  <span>Studio Packaging & Courier:</span>
                  <span>{shippingCost === 0 ? 'COMPLIMENTARY' : `₹${shippingCost}`}</span>
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

              <div className="checkout-trust-badge">
                <ShieldCheck size={18} />
                <span>Protected by Cartiva Artisan Authenticity Guarantee</span>
              </div>
            </aside>
          </div>
        ) : (
          /* Order Success Confirmation */
          <div className="order-success-pane">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} />
            </div>
            <h2>Order Confirmed & Allocated</h2>
            <p className="order-id-display">Reference ID: <strong>{orderId}</strong></p>
            <p className="success-desc">
              Your order has been transmitted directly to our verified artisan studios.
              You will receive automated dispatch tracking via email and SMS as each studio packages your piece.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onClose();
                if (onOrderPlaced) onOrderPlaced();
              }}
            >
              Continue Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
