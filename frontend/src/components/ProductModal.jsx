import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  Heart,
  Scale,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useToast } from '../context/ToastContext';

export const ProductModal = ({ product, onClose, onViewFullDetails }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useComparison();
  const { addToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isOutOfStock = product.stockCount === 0;
  const storeDisplayName = product.storeName || product.seller?.businessName || 'Verified Artisan Studio';
  const wishlisted = isInWishlist(product._id);
  const compared = isInCompare(product._id);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    addToast(`Added "${product.title}" to bag`, 'success');
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Left Column: Imagery */}
          <div className="modal-image-col">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="modal-img"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <span className="modal-cat-tag">{product.category}</span>
            {hasDiscount && (
              <span className="modal-discount-tag">Save {discountPercent}%</span>
            )}
          </div>

          {/* Right Column: Specifications & Purchasing */}
          <div className="modal-content-col">
            {/* Storefront Provenance & Rating */}
            <div className="modal-store-rating-bar">
              <div className="modal-store-pill">
                <Store size={14} className="store-icon" />
                <span>Direct from studio: <strong>{storeDisplayName}</strong></span>
              </div>
              <div className="modal-rating-badge">
                <Star size={13} fill="var(--color-gold)" color="var(--color-gold)" />
                <span>{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="modal-title">{product.title}</h2>

            {/* Price Row */}
            <div className="modal-price-row">
              <span className="modal-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <span className="modal-original-price">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              <span className="modal-tax-note">All duties & taxes included</span>
            </div>

            {/* Description */}
            <p className="modal-desc">{product.description}</p>

            {/* Specifications snippet */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="modal-specs-snippet">
                {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                  <div key={k} className="modal-spec-item">
                    <span className="modal-spec-k">{k}:</span>
                    <span className="modal-spec-v">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Inventory Status */}
            <div className="modal-stock-status">
              {isOutOfStock ? (
                <span className="stock-pill out">Sold Out</span>
              ) : (
                <span className="stock-pill in">
                  Verified Batch: {product.stockCount} Available in Studio
                </span>
              )}
            </div>

            {/* Actions: Quantity + Add to Bag */}
            <div className="modal-actions-group">
              <div className="modal-qty-box">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  –
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(product.stockCount || 99, quantity + 1))}
                  disabled={quantity >= product.stockCount || isOutOfStock}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`btn btn-primary modal-add-btn ${isOutOfStock ? 'disabled' : ''} ${isAdded ? 'btn-added' : ''}`}
                onClick={handleAdd}
                disabled={isOutOfStock}
              >
                {isAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Bag</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>
            </div>

            {/* Wishlist, Compare & Full Details links */}
            <div className="modal-extra-links">
              <button
                type="button"
                className={`modal-icon-action ${wishlisted ? 'active' : ''}`}
                onClick={() => {
                  const added = toggleWishlist(product);
                  addToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
                }}
              >
                <Heart size={16} fill={wishlisted ? '#B23A22' : 'none'} color={wishlisted ? '#B23A22' : 'currentColor'} />
                <span>{wishlisted ? 'Wishlisted' : 'Save'}</span>
              </button>

              <button
                type="button"
                className={`modal-icon-action ${compared ? 'active' : ''}`}
                onClick={() => {
                  const res = toggleCompare(product);
                  addToast(res.message, res.inCompare ? 'info' : 'warning');
                }}
              >
                <Scale size={16} color={compared ? 'var(--color-gold)' : 'currentColor'} />
                <span>{compared ? 'In Compare' : 'Compare'}</span>
              </button>

              {onViewFullDetails && (
                <button
                  type="button"
                  className="modal-view-full-btn"
                  onClick={() => {
                    onViewFullDetails(product);
                    onClose();
                  }}
                >
                  <span>Full Details & Specs</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Guarantees */}
            <div className="modal-trust-row">
              <div className="trust-pill">
                <Truck size={14} />
                <span>Express Insured Shipping</span>
              </div>
              <div className="trust-pill">
                <RotateCcw size={14} />
                <span>14-Day Doorstep Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
