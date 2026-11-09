import React, { useState, useEffect } from 'react';
import {
  Heart,
  Scale,
  ShoppingBag,
  Check,
  Star,
  Store,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  PackageCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useToast } from '../context/ToastContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { fetchProductById } from '../services/api';

export const ProductDetailPage = ({
  productId,
  product: initialProduct,
  allProducts = [],
  onBack,
  onSelectProduct,
  onSelectCategory,
  onNavigateToStorefront,
  onNavigateToCheckout
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useComparison();
  const { addToast } = useToast();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(Boolean(!initialProduct && productId));
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Standard Edition');
  const [selectedImage, setSelectedImage] = useState(initialProduct?.imageUrl || null);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // 1. Fetch product if productId is provided and either initialProduct is absent or has a different ID
  useEffect(() => {
    let isMounted = true;

    if (initialProduct && (!productId || initialProduct._id === productId || initialProduct.id === productId)) {
      setProduct(initialProduct);
      setSelectedImage(initialProduct.imageUrl);
      setLoading(false);
      setError(null);
      addRecentlyViewed(initialProduct);
      return;
    }

    if (productId) {
      setLoading(true);
      setError(null);
      fetchProductById(productId)
        .then((data) => {
          if (isMounted) {
            if (data.success && data.product) {
              setProduct(data.product);
              setSelectedImage(data.product.imageUrl);
              addRecentlyViewed(data.product);
            } else {
              setError('Product details not available');
            }
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Product details fetch notice:', err.message);
            setError(err.message || 'Product not found');
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
      setError('No product selected');
    }

    return () => {
      isMounted = false;
    };
  }, [productId, initialProduct]);

  // Reset image, quantity and scroll to top when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.imageUrl);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?._id]);

  // 2. Loading Skeleton State
  if (loading) {
    return (
      <div className="product-detail-page animate-fade-in">
        <div className="container">
          <div className="detail-breadcrumbs-skeleton skeleton-box" style={{ height: '24px', width: '280px', marginBottom: '2rem' }} />
          <div className="product-detail-layout">
            <div className="skeleton-box" style={{ aspectRatio: '1/1', width: '100%', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton-detail-info" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="skeleton-box" style={{ height: '20px', width: '160px' }} />
              <div className="skeleton-box" style={{ height: '42px', width: '85%' }} />
              <div className="skeleton-box" style={{ height: '36px', width: '220px' }} />
              <div className="skeleton-box" style={{ height: '28px', width: '140px' }} />
              <div className="skeleton-box" style={{ height: '90px', width: '100%' }} />
              <div className="skeleton-box" style={{ height: '52px', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error or Not Found State
  if (error || !product) {
    return (
      <div className="product-detail-page animate-fade-in">
        <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
          <div className="catalogue-empty-state" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div className="empty-state-icon" style={{ marginBottom: '1.5rem' }}>
              <Compass size={56} strokeWidth={1.5} color="var(--color-gold)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--color-charcoal)' }}>
              Piece Not Found
            </h2>
            <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {error || 'The requested atelier piece does not exist, has been archived, or is currently unavailable.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={onBack}
              style={{ padding: '0.85rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={16} />
              <span>Return to Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Stock calculations
  const maxStock = Math.max(0, Number(product.stockCount) || 0);
  const isOutOfStock = maxStock === 0;
  const isLowStock = maxStock > 0 && maxStock <= 5;
  const wishlisted = isInWishlist(product._id);
  const compared = isInCompare(product._id);

  // Discount calculation strictly based on real database numbers
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Gallery images with curated detail shots
  const studioFallbacks = [
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80'
  ];
  const galleryImages = [
    product.imageUrl,
    ...(Array.isArray(product.images) && product.images.length > 0 ? product.images : studioFallbacks)
  ].filter((img, idx, arr) => img && arr.indexOf(img) === idx);

  // Similar products in the same category (guaranteed 4 pieces)
  let similarProducts = allProducts.filter(
    (p) => p.category === product.category && (p._id !== product._id && p.id !== product._id)
  );
  if (similarProducts.length < 4) {
    const filler = allProducts.filter(
      (p) => p._id !== product._id && !similarProducts.some((sp) => sp._id === p._id)
    );
    similarProducts = [...similarProducts, ...filler].slice(0, 4);
  } else {
    similarProducts = similarProducts.slice(0, 4);
  }

  // Companion piece for bundle
  const companionProduct = allProducts.find(
    (p) => p._id !== product._id && (p.category === product.category || p.category === 'Home & Kitchen' || p.category === 'Other')
  );

  // Actions
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    addToast(`Added ${quantity} × "${product.title}" to your shopping bag`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const handleQtyChange = (delta) => {
    if (isOutOfStock) return;
    const nextVal = quantity + delta;
    if (nextVal >= 1 && nextVal <= maxStock) {
      setQuantity(nextVal);
    } else if (nextVal > maxStock) {
      addToast(`Only ${maxStock} pieces currently available in studio inventory`, 'warning');
    }
  };

  const handleCheckDelivery = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length < 6) {
      addToast('Please enter a valid 6-digit PIN code', 'warning');
      return;
    }
    setDeliveryEstimate('Estimated dispatch within 24h. Express delivery in 2–4 business days.');
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const sellerId = product.seller?._id || product.seller;
  const storeName = product.storeName || product.seller?.businessName || 'Verified Artisan Atelier';

  // Safe specs parsing
  const specsEntries = product.specs
    ? product.specs instanceof Map
      ? Array.from(product.specs.entries())
      : typeof product.specs === 'object'
      ? Object.entries(product.specs)
      : []
    : [];

  return (
    <div className="product-detail-page animate-fade-in">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" className="breadcrumb-btn" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Catalogue</span>
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          {onSelectCategory ? (
            <button
              type="button"
              className="breadcrumb-btn breadcrumb-category-link"
              onClick={() => onSelectCategory(product.category)}
            >
              {product.category}
            </button>
          ) : (
            <span className="breadcrumb-cat">{product.category}</span>
          )}
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current" title={product.title}>
            {product.title}
          </span>
        </nav>

        {/* Main Showcase Layout (Gallery + Buying Column) */}
        <div className="product-detail-layout">
          {/* Left Column: Image Gallery with Interactive Zoom */}
          <div className="product-gallery-section">
            <div
              className="main-image-viewport"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={selectedImage || product.imageUrl}
                alt={product.title}
                className="detail-main-img"
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                        transform: 'scale(1.75)'
                      }
                    : { transform: 'scale(1)' }
                }
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {hasDiscount && (
                <span className="gallery-discount-pill">
                  Save {discountPercent}% Special Price
                </span>
              )}

              <span className="zoom-hint-badge">
                <Sparkles size={12} />
                <span>Hover to inspect fine craftsmanship</span>
              </span>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="gallery-thumbnail-strip">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                    aria-label={`View photo angle ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.title} perspective ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information, Specs & Purchase Box */}
          <div className="product-purchase-section">
            {/* Store & Provenance */}
            <div className="detail-provenance-row">
              <button
                type="button"
                className="detail-store-link"
                onClick={() => onNavigateToStorefront && sellerId && onNavigateToStorefront(sellerId)}
                title={`Visit ${storeName} Storefront`}
              >
                <Store size={15} />
                <span>{storeName}</span>
                <span className="verified-badge">Verified Maker</span>
              </button>

              <div className="detail-rating-stars">
                <Star size={15} fill="var(--color-gold)" color="var(--color-gold)" />
                <span className="rating-value">
                  {product.rating ? Number(product.rating).toFixed(1) : '4.9'}
                </span>
                <span className="rating-count">
                  {product.reviewsCount
                    ? `(${product.reviewsCount} verified reviews)`
                    : '(Authentic Maker)'}
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="detail-title">{product.title}</h1>

            {/* Price Box */}
            <div className="detail-price-box">
              <div className="detail-price-row">
                <span className="detail-current-price">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="detail-original-price">
                    ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="detail-tax-note">
                Inclusive of all taxes, duties, and insured studio packaging
              </span>
            </div>

            {/* Stock & Availability Pill */}
            <div className="detail-stock-row">
              {isOutOfStock ? (
                <span className="stock-status-pill out-of-stock">Currently Sold Out</span>
              ) : isLowStock ? (
                <span className="stock-status-pill low-stock">
                  Limited Batch — Only {maxStock} pieces remaining in studio inventory
                </span>
              ) : (
                <span className="stock-status-pill in-stock">
                  In Stock — Ready for immediate studio dispatch ({maxStock} available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="detail-description-block">
              <h3 className="detail-subheading">Craftsmanship & Design</h3>
              <p className="detail-description-text">{product.description}</p>
            </div>

            {/* Variant Options (Edition / Finish) */}
            <div className="detail-variants-group">
              <span className="variants-label">Edition / Studio Finish:</span>
              <div className="variants-buttons-row">
                {['Standard Edition', 'Artisan Matte Studio Finish', 'Raw Bespoke Finish'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`variant-choice-btn ${selectedVariant === v ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add to Bag / Buy Now */}
            <div className="detail-actions-panel">
              <div className="quantity-selector-group">
                <label htmlFor="detail-qty" className="qty-label">Quantity:</label>
                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQtyChange(-1)}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span id="detail-qty" className="qty-num">{isOutOfStock ? 0 : quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQtyChange(1)}
                    disabled={quantity >= maxStock || isOutOfStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="cta-buttons-stack">
                <button
                  type="button"
                  className={`btn-primary btn-add-bag-lg ${isOutOfStock ? 'disabled' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingBag size={18} />
                  <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Shopping Bag'}</span>
                </button>

                <button
                  type="button"
                  className={`btn-gold btn-buy-now ${isOutOfStock ? 'disabled' : ''}`}
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                >
                  <span>Instant Buy Now</span>
                </button>
              </div>

              {/* Wishlist & Compare Quick Buttons */}
              <div className="secondary-action-links">
                <button
                  type="button"
                  className={`secondary-action-btn ${wishlisted ? 'active' : ''}`}
                  onClick={() => {
                    const added = toggleWishlist(product);
                    addToast(added ? 'Saved to Wishlist' : 'Removed from Wishlist', 'info');
                  }}
                >
                  <Heart
                    size={16}
                    fill={wishlisted ? '#B23A22' : 'none'}
                    color={wishlisted ? '#B23A22' : 'currentColor'}
                  />
                  <span>{wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
                </button>

                <button
                  type="button"
                  className={`secondary-action-btn ${compared ? 'active' : ''}`}
                  onClick={() => {
                    const res = toggleCompare(product);
                    addToast(res.message, res.inCompare ? 'info' : 'warning');
                  }}
                >
                  <Scale size={16} color={compared ? 'var(--color-gold)' : 'currentColor'} />
                  <span>{compared ? 'In Comparison List' : 'Add to Compare'}</span>
                </button>
              </div>
            </div>

            {/* Delivery Estimator */}
            <div className="delivery-estimator-card">
              <div className="estimator-title-row">
                <Truck size={17} />
                <span>Domestic Express Delivery</span>
              </div>
              <form onSubmit={handleCheckDelivery} className="pincode-form">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="pincode-input"
                />
                <button type="submit" className="pincode-submit-btn">Check</button>
              </form>
              {deliveryEstimate && (
                <p className="delivery-estimate-msg">
                  <Check size={14} className="check-green" />
                  <span>{deliveryEstimate}</span>
                </p>
              )}
            </div>

            {/* Value Guarantees */}
            <div className="detail-guarantees-grid">
              <div className="guarantee-item">
                <ShieldCheck size={18} />
                <div>
                  <h4>Artisan Verified</h4>
                  <p>100% direct provenance from independent studios</p>
                </div>
              </div>
              <div className="guarantee-item">
                <RotateCcw size={18} />
                <div>
                  <h4>14-Day Returns</h4>
                  <p>Hassle-free complimentary doorstep return service</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Table Section */}
        <section className="detail-specs-section">
          <h3 className="section-specs-title">Technical & Material Specifications</h3>
          <div className="specs-table-container">
            <table className="specs-table">
              <tbody>
                <tr>
                  <th className="spec-name">Product Name</th>
                  <td className="spec-value">{product.title}</td>
                </tr>
                <tr>
                  <th className="spec-name">Primary Category</th>
                  <td className="spec-value">{product.category}</td>
                </tr>
                <tr>
                  <th className="spec-name">Artisan Atelier</th>
                  <td className="spec-value">
                    {storeName}{' '}
                    {sellerId && onNavigateToStorefront && (
                      <button
                        type="button"
                        onClick={() => onNavigateToStorefront(sellerId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-gold)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          marginLeft: '0.5rem',
                          textDecoration: 'underline'
                        }}
                      >
                        (View Storefront)
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="spec-name">Stock Status</th>
                  <td className="spec-value">
                    {isOutOfStock
                      ? 'Archived / Sold Out'
                      : `${maxStock} units currently catalogued`}
                  </td>
                </tr>
                {specsEntries.map(([k, v]) => (
                  <tr key={k}>
                    <th className="spec-name">{k}</th>
                    <td className="spec-value">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* About the Studio Showcase Card */}
        {sellerId && (
          <section className="about-studio-section" style={{
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-beige)',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem',
            marginBottom: '4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Store size={22} color="var(--color-gold)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', margin: 0, color: 'var(--color-charcoal)' }}>
                  Handcrafted by {storeName}
                </h3>
                <span className="verified-badge">Verified Maker</span>
              </div>
              <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.92rem', maxWidth: '640px', lineHeight: 1.6, margin: 0 }}>
                Every creation from {storeName} adheres to Cartiva's authentic multi-vendor standards, sustainably crafted and shipped directly from their artisan studio.
              </p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigateToStorefront && onNavigateToStorefront(sellerId)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              <span>Visit Artisan Storefront</span>
              <ExternalLink size={15} />
            </button>
          </section>
        )}

        {/* Frequently Bought Together Bundle */}
        {companionProduct && (
          <section className="bundle-recommendation-section">
            <h3 className="bundle-title">Frequently Paired Together</h3>
            <p className="bundle-subtitle">Artisan-curated companion piece for a complete setup</p>
            <div className="bundle-card">
              <div className="bundle-items-row">
                <div className="bundle-prod-item">
                  <img src={product.imageUrl} alt={product.title} />
                  <span className="bundle-prod-name">{product.title}</span>
                  <span className="bundle-prod-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                </div>

                <span className="bundle-plus">+</span>

                <div
                  className="bundle-prod-item clickable"
                  onClick={() => onSelectProduct && onSelectProduct(companionProduct)}
                >
                  <img src={companionProduct.imageUrl} alt={companionProduct.title} />
                  <span className="bundle-prod-name">{companionProduct.title}</span>
                  <span className="bundle-prod-price">₹{Number(companionProduct.price).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bundle-total-action">
                <div className="bundle-total-group">
                  <span className="total-label">Combined Bundle Total:</span>
                  <span className="total-price">
                    ₹{Number(product.price + companionProduct.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-primary btn-add-bundle"
                  onClick={() => {
                    addToCart(product, 1);
                    addToCart(companionProduct, 1);
                    addToast(`Added editorial bundle to your bag!`, 'success');
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>Add Both to Bag</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Related Products Grid */}
        {similarProducts.length > 0 && (
          <section className="similar-products-section">
            <div className="similar-header">
              <h3 className="similar-title">More Handcrafted Pieces</h3>
              <p className="similar-subtitle">Curated creations sharing similar craftsmanship standards</p>
            </div>
            <div className="similar-grid">
              {similarProducts.map((simProd) => (
                <div
                  key={simProd._id}
                  className="similar-card"
                  onClick={() => onSelectProduct && onSelectProduct(simProd)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onSelectProduct) onSelectProduct(simProd);
                  }}
                >
                  <img src={simProd.imageUrl} alt={simProd.title} />
                  <div className="similar-info">
                    <span className="similar-store">
                      {simProd.storeName || simProd.seller?.businessName || 'Artisan Atelier'}
                    </span>
                    <h4 className="similar-name">{simProd.title}</h4>
                    <span className="similar-price">₹{Number(simProd.price).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
