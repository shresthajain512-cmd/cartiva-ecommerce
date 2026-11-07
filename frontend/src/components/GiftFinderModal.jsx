import React, { useState } from 'react';
import { X, Gift, RotateCcw, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const GiftFinderModal = ({ isOpen, onClose, allProducts = [], onInspectProduct }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState('');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('All');

  if (!isOpen) return null;

  const recipients = [
    { id: 'design', label: 'Design & Architecture Enthusiast', tag: 'Books', icon: '📐' },
    { id: 'audiophile', label: 'Music & Audio Lover', tag: 'Electronics', icon: '🎧' },
    { id: 'homebody', label: 'Culinary & Home Living Connoisseur', tag: 'Home & Kitchen', icon: '☕' },
    { id: 'wellness', label: 'Yoga & Mindful Movement Explorer', tag: 'Fitness', icon: '🧘' },
    { id: 'artisan', label: 'Leather & Heritage Goods Collector', tag: 'Fashion', icon: '👜' }
  ];

  const occasions = [
    { id: 'housewarming', label: 'Housewarming & New Space' },
    { id: 'birthday', label: 'Birthday Celebration' },
    { id: 'anniversary', label: 'Milestone Anniversary' },
    { id: 'thankyou', label: 'Heartfelt Thank You Gift' },
    { id: 'self', label: 'Everyday Personal Treat' }
  ];

  const budgets = [
    { id: 'tier1', label: 'Under ₹1,500', max: 1500, min: 0 },
    { id: 'tier2', label: '₹1,500 – ₹3,500', max: 3500, min: 1500 },
    { id: 'tier3', label: '₹3,500 – ₹7,000', max: 7000, min: 3500 },
    { id: 'tier4', label: 'Luxury Allocation (₹7,000+)', max: 50000, min: 7000 }
  ];

  // Filter products based on selected criteria
  const getFilteredGifts = () => {
    let result = [...allProducts];

    // Recipient maps to category preferences
    if (recipient) {
      const found = recipients.find((r) => r.id === recipient);
      if (found) {
        result = result.filter((p) => p.category === found.tag || p.category === 'Other');
      }
    }

    // Category override if chosen
    if (category && category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    // Budget filter
    if (budget) {
      const budgetObj = budgets.find((b) => b.id === budget);
      if (budgetObj) {
        result = result.filter((p) => p.price >= budgetObj.min && p.price <= budgetObj.max);
      }
    }

    return result.slice(0, 6);
  };

  const giftResults = getFilteredGifts();

  const handleReset = () => {
    setStep(1);
    setRecipient('');
    setOccasion('');
    setBudget('');
    setCategory('All');
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    addToast(`Added "${product.title}" to bag`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="gift-finder-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-finder-title"
      >
        {/* Modal Header */}
        <div className="gift-modal-header">
          <div className="gift-title-group">
            <Gift size={22} className="gift-icon" />
            <div>
              <h2 id="gift-finder-title">Cartiva Curated Gift Concierge</h2>
              <p className="gift-subtitle">
                Select your parameters to uncover thoughtful artisanal pieces.
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close gift concierge">
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="gift-stepper-bar">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1. Recipient</div>
          <div className="step-connector" />
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2. Occasion</div>
          <div className="step-connector" />
          <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3. Budget</div>
          <div className="step-connector" />
          <div className={`step-indicator ${step === 4 ? 'active' : ''}`}>4. Curations</div>
        </div>

        {/* Step Content */}
        <div className="gift-modal-body">
          {step === 1 && (
            <div className="gift-step-pane">
              <h3 className="gift-question">Who are you selecting a gift for?</h3>
              <div className="gift-options-grid">
                {recipients.map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    className={`gift-option-card ${recipient === rec.id ? 'selected' : ''}`}
                    onClick={() => {
                      setRecipient(rec.id);
                      setStep(2);
                    }}
                  >
                    <span className="gift-option-icon">{rec.icon}</span>
                    <span className="gift-option-label">{rec.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="gift-step-pane">
              <h3 className="gift-question">What is the special occasion?</h3>
              <div className="gift-options-grid">
                {occasions.map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    className={`gift-option-card ${occasion === occ.id ? 'selected' : ''}`}
                    onClick={() => {
                      setOccasion(occ.id);
                      setStep(3);
                    }}
                  >
                    <span className="gift-option-label">{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="gift-step-pane">
              <h3 className="gift-question">What is your intended budget allocation?</h3>
              <div className="gift-options-grid">
                {budgets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`gift-option-card ${budget === b.id ? 'selected' : ''}`}
                    onClick={() => {
                      setBudget(b.id);
                      setStep(4);
                    }}
                  >
                    <span className="gift-option-label">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="gift-results-pane">
              <div className="results-header-row">
                <div>
                  <h3 className="gift-question">
                    Recommended Pieces ({giftResults.length})
                  </h3>
                  <p className="gift-summary-text">
                    Curated for: {recipients.find((r) => r.id === recipient)?.label || 'Recipient'} •{' '}
                    {occasions.find((o) => o.id === occasion)?.label || 'Occasion'}
                  </p>
                </div>
                <button type="button" className="btn-reset-gift" onClick={handleReset}>
                  <RotateCcw size={13} />
                  <span>Restart Finder</span>
                </button>
              </div>

              {giftResults.length > 0 ? (
                <div className="gift-results-grid">
                  {giftResults.map((prod) => (
                    <div key={prod._id} className="gift-result-card">
                      <img
                        src={prod.imageUrl}
                        alt={prod.title}
                        onClick={() => {
                          onInspectProduct(prod);
                          onClose();
                        }}
                      />
                      <div className="gift-result-body">
                        <span className="gift-result-store">{prod.storeName}</span>
                        <h4
                          className="gift-result-title"
                          onClick={() => {
                            onInspectProduct(prod);
                            onClose();
                          }}
                        >
                          {prod.title}
                        </h4>
                        <div className="gift-result-footer">
                          <span className="gift-result-price">
                            ₹{Number(prod.price).toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            className="btn-gift-add"
                            onClick={() => handleAddToCart(prod)}
                            title="Add gift to bag"
                          >
                            <ShoppingBag size={14} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="gift-no-results">
                  <p>No pieces exactly matched this combination in stock.</p>
                  <button type="button" className="btn-primary" onClick={handleReset}>
                    Try Another Budget or Recipient
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="gift-modal-footer">
          {step > 1 && step < 4 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep(step - 1)}
            >
              Previous Step
            </button>
          )}
          {step < 3 && (
            <button
              type="button"
              className="btn-text"
              onClick={() => setStep(step + 1)}
            >
              Skip this question
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep(4)}
            >
              Show Recommendations
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
