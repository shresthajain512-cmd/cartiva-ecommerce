import React, { useState } from 'react';
import { X, Scale, ShoppingBag, Check, Trash2, Star, Store, AlertCircle } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ProductComparisonModal = () => {
  const {
    comparedProducts,
    removeFromCompare,
    clearCompare,
    isCompareModalOpen,
    closeCompareModal
  } = useComparison();

  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  if (!isCompareModalOpen) return null;

  // Extract all unique spec keys across all compared products
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) =>
        p.specs && typeof p.specs === 'object' ? Object.keys(p.specs) : []
      )
    )
  );

  const handleAddToCart = (product) => {
    if (product.stockCount === 0) return;
    addToCart(product, 1);
    addToast(`Added "${product.title}" to bag`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={closeCompareModal}>
      <div
        className="compare-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
      >
        {/* Modal Header */}
        <div className="compare-modal-header">
          <div className="compare-header-title-group">
            <Scale size={20} className="compare-icon" />
            <h2 id="compare-modal-title">
              Product Comparison ({comparedProducts.length}/4)
            </h2>
          </div>

          <div className="compare-header-actions">
            {comparedProducts.length > 1 && (
              <label className="difference-toggle">
                <input
                  type="checkbox"
                  checked={highlightDifferences}
                  onChange={(e) => setHighlightDifferences(e.target.checked)}
                />
                <span>Highlight Differences</span>
              </label>
            )}

            {comparedProducts.length > 0 && (
              <button
                type="button"
                className="btn-clear-compare"
                onClick={clearCompare}
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}

            <button
              type="button"
              className="modal-close-btn"
              onClick={closeCompareModal}
              aria-label="Close comparison window"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="compare-modal-body">
          {comparedProducts.length === 0 ? (
            <div className="compare-empty-state">
              <Scale size={42} className="empty-scale-icon" />
              <h3>No Products in Comparison List</h3>
              <p>
                Click the balance scale icon on any product card in the catalogue to add it
                here and compare specifications side by side.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={closeCompareModal}
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            <div className="compare-table-wrapper">
              <table className="compare-table">
                <tbody>
                  {/* Row: Product Header (Image, Title, Remove) */}
                  <tr className="compare-row-header">
                    <th className="compare-attr-header">Product</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-col-cell">
                        <div className="compare-card-head">
                          <button
                            type="button"
                            className="compare-remove-item-btn"
                            onClick={() => removeFromCompare(p._id)}
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="compare-thumb"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <h4 className="compare-prod-title">{p.title}</h4>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Price */}
                  <tr>
                    <th className="compare-attr-label">Price (INR)</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-cell">
                        <div className="compare-price-val">
                          <span className="price-bold">
                            ₹{Number(p.price).toLocaleString('en-IN')}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="original-strikethrough">
                              ₹{Number(p.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Category */}
                  <tr>
                    <th className="compare-attr-label">Category</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-cell">
                        <span className="spec-badge">{p.category}</span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Artisan Studio / Seller */}
                  <tr>
                    <th className="compare-attr-label">Artisan Studio</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-cell">
                        <div className="compare-store-cell">
                          <Store size={13} />
                          <span>{p.storeName || p.seller?.businessName || 'Verified Studio'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Customer Rating */}
                  <tr>
                    <th className="compare-attr-label">Rating</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-cell">
                        <div className="compare-rating-cell">
                          <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                          <span>{p.rating ? Number(p.rating).toFixed(1) : '4.8'}</span>
                          <span className="reviews-gray">({p.reviewsCount || 24} reviews)</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Stock Status */}
                  <tr>
                    <th className="compare-attr-label">Availability</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-cell">
                        {p.stockCount === 0 ? (
                          <span className="status-pill status-out">Sold Out</span>
                        ) : p.stockCount <= 5 ? (
                          <span className="status-pill status-low">
                            Only {p.stockCount} in stock
                          </span>
                        ) : (
                          <span className="status-pill status-in">In Stock ({p.stockCount})</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Specifications Rows */}
                  {allSpecKeys.map((key) => {
                    const values = comparedProducts.map((p) => p.specs?.[key] || '—');
                    const hasDifference =
                      values.some((v) => v !== values[0]) && comparedProducts.length > 1;

                    return (
                      <tr
                        key={key}
                        className={highlightDifferences && hasDifference ? 'diff-highlight' : ''}
                      >
                        <th className="compare-attr-label">{key}</th>
                        {comparedProducts.map((p) => (
                          <td key={p._id} className="compare-cell">
                            {p.specs?.[key] ? (
                              <span className="spec-text">{p.specs[key]}</span>
                            ) : (
                              <span className="spec-empty">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* Action Row: Add to Bag */}
                  <tr className="compare-action-row">
                    <th className="compare-attr-label">Action</th>
                    {comparedProducts.map((p) => (
                      <td key={p._id} className="compare-cell">
                        <button
                          type="button"
                          className={`btn-add-to-bag ${p.stockCount === 0 ? 'disabled' : ''}`}
                          onClick={() => handleAddToCart(p)}
                          disabled={p.stockCount === 0}
                        >
                          <ShoppingBag size={14} />
                          <span>{p.stockCount === 0 ? 'Sold Out' : 'Add to Bag'}</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
