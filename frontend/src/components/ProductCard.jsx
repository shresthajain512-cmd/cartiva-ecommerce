import React, { useState } from 'react';
import { ShoppingBag, Eye, Store, Check, Heart, Scale, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useToast } from '../context/ToastContext';

export const ProductCard = ({ product, onInspect, onSelect, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useComparison();
  const { addToast } = useToast();

  const [isAdded, setIsAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(
    product?.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
  );

  if (!product) return null;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product);
    } else if (onInspect) {
      onInspect(product);
    }
  };

  const isOutOfStock = product.stockCount === 0;
  const isLowStock = product.stockCount > 0 && product.stockCount <= 5;
  const storeDisplayName = product.storeName || product.seller?.businessName || 'Verified Artisan Studio';
  const wishlisted = isInWishlist(product._id);
  const compared = isInCompare(product._id);

  // Discount calculation
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setIsAdded(true);
    addToast(`Added "${product.title}" to your shopping bag`, 'success');
    setTimeout(() => setIsAdded(false), 1600);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    const added = toggleWishlist(product);
    if (added) {
      addToast(`Saved "${product.title}" to Wishlist`, 'info');
    } else {
      addToast(`Removed "${product.title}" from Wishlist`, 'info');
    }
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    const res = toggleCompare(product);
    addToast(res.message, res.inCompare ? 'info' : 'warning');
  };

  const handleImageError = () => {
    setImgSrc('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80');
  };

  return (
    <article
      className={`product-card ${viewMode === 'list' ? 'product-card-list' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
    >
      {/* 1. Image Showcase Container */}
      <div className="card-image-box">
        <img
          src={imgSrc}
          alt={product.title}
          className="card-img"
          loading="lazy"
          onError={handleImageError}
        />

        {/* Top Badges */}
        <div className="card-top-badges">
          <span className="card-category-badge">{product.category}</span>
          {hasDiscount && (
            <span className="card-discount-badge">Save {discountPercent}%</span>
          )}
        </div>

        {/* Wishlist & Compare Floating Actions */}
        <div className="card-quick-actions">
          <button
            type="button"
            className={`card-action-icon-btn ${wishlisted ? 'active-wishlist' : ''}`}
            onClick={handleWishlistToggle}
            aria-label={wishlisted ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
            title={wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={wishlisted ? '#B23A22' : 'none'} color={wishlisted ? '#B23A22' : 'currentColor'} />
          </button>

          <button
            type="button"
            className={`card-action-icon-btn ${compared ? 'active-compare' : ''}`}
            onClick={handleCompareToggle}
            aria-label="Compare product"
            title={compared ? 'In Comparison' : 'Add to Compare'}
          >
            <Scale size={16} color={compared ? 'var(--color-gold)' : 'currentColor'} />
          </button>
        </div>

        {/* Stock Status Badge */}
        <div className="card-bottom-stock">
          {isOutOfStock ? (
            <span className="card-stock-badge badge-danger">Sold Out</span>
          ) : isLowStock ? (
            <span className="card-stock-badge badge-warning">Only {product.stockCount} Left</span>
          ) : (
            <span className="card-stock-badge badge-success">In Stock</span>
          )}
        </div>

        {/* Quick View Overlay Button */}
        <button
          type="button"
          className="card-quick-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            onInspect(product);
          }}
          aria-label={`Quick view ${product.title}`}
        >
          <Eye size={15} />
          <span>Quick View</span>
        </button>
      </div>

      {/* 2. Product Details */}
      <div className="card-body">
        {/* Storefront Provenance & Rating Row */}
        <div className="card-store-rating-row">
          <div className="card-store-row">
            <Store size={13} className="store-icon" />
            <span className="store-name">{storeDisplayName}</span>
          </div>

          <div className="card-rating-badge" title={`${product.rating || 4.8} rating (${product.reviewsCount || 24} reviews)`}>
            <Star size={12} className="star-icon" fill="var(--color-gold)" color="var(--color-gold)" />
            <span className="rating-num">{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
            <span className="reviews-num">({product.reviewsCount || 24})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="card-title" title={product.title}>
          {product.title}
        </h3>

        {/* Brief excerpt */}
        <p className="card-desc">
          {product.description?.slice(0, 85)}
          {product.description?.length > 85 ? '...' : ''}
        </p>

        {/* Specifications snippet if available */}
        {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
          <div className="card-specs-preview">
            {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
              <span key={key} className="spec-pill">{key}: {val}</span>
            ))}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="card-footer-row">
          <div className="card-price-group">
            <div className="price-values">
              <span className="card-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <span className="card-original-price">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="price-taxes-note">Incl. all taxes</span>
          </div>

          <button
            type="button"
            className={`btn-add-to-bag ${isOutOfStock ? 'disabled' : ''} ${isAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.title} to bag`}
          >
            {isAdded ? (
              <>
                <Check size={16} />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Sold Out</span>
            ) : (
              <>
                <ShoppingBag size={15} />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
