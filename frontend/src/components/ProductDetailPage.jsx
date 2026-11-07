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
  ChevronRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useToast } from '../context/ToastContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

export const ProductDetailPage = ({
  product,
  allProducts = [],
  onBack,
  onSelectProduct,
  onNavigateToStorefront,
  onNavigateToCheckout
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, toggleCompare } = useComparison();
  const { addToast } = useToast();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Standard');
  const [selectedImage, setSelectedImage] = useState(product?.imageUrl);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Record this product in recently viewed upon mounting
  useEffect(() => {
    if (product) {
      addRecentlyViewed(product);
      setSelectedImage(product.imageUrl);
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stockCount === 0;
  const isLowStock = product.stockCount > 0 && product.stockCount <= 5;
  const wishlisted = isInWishlist(product._id);
  const compared = isInCompare(product._id);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Gallery images (main image + derived curated detail shots)
  const galleryImages = [
    product.imageUrl,
    // Complementary angle / texture shots from reliable Unsplash studio assets
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80'
  ];

  // Similar products in the same category
  const similarProducts = allProducts
    .filter((p) => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  // Frequently bought together companion item
  const companionProduct = allProducts.find(
    (p) => p._id !== product._id && (p.category === product.category || p.category === 'Other')
  );

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    addToast(`Added ${quantity} × "${product.title}" to bag`, 'success');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const handleCheckDelivery = (e) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.trim().length < 6) {
      addToast('Please enter a valid 6-digit PIN code', 'warning');
      return;
    }
    setDeliveryEstimate('Estimated delivery within 2–4 business days via insured express courier');
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const bundleTotal = companionProduct
    ? product.price + companionProduct.price
    : product.price;

  const handleAddBundleToCart = () => {
    addToCart(product, 1);
    if (companionProduct) {
      addToCart(companionProduct, 1);
    }
    addToast(`Added editorial bundle to your bag!`, 'success');
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="detail-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" className="breadcrumb-btn" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>Catalogue</span>
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-cat">{product.category}</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{product.title}</span>
        </nav>

        {/* Main Showcase Layout (Gallery + Buying Column) */}
        <div className="product-detail-layout">
          {/* Left Column: Image Gallery with Zoom */}
          <div className="product-gallery-section">
            <div
              className="main-image-viewport"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={selectedImage}
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
                <span>Hover to inspect fine detail</span>
              </span>
            </div>

            {/* Thumbnail Strip */}
            <div className="gallery-thumbnail-strip">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`gallery-thumb-btn ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View photo angle ${idx + 1}`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information, Specs & Purchase Box */}
          <div className="product-purchase-section">
            {/* Store & Provenance */}
            <div className="detail-provenance-row">
              <button
                type="button"
                className="detail-store-link"
                onClick={() => onNavigateToStorefront && onNavigateToStorefront(product.seller?._id || product.seller)}
              >
                <Store size={15} />
                <span>{product.storeName || product.seller?.businessName || 'Verified Artisan'}</span>
                <span className="verified-badge">Verified Maker</span>
              </button>

              <div className="detail-rating-stars">
                <Star size={15} fill="var(--color-gold)" color="var(--color-gold)" />
                <span className="rating-value">{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
                <span className="rating-count">({product.reviewsCount || 24} verified artisan reviews)</span>
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
              <span className="detail-tax-note">Inclusive of all duties, GST, and domestic packaging</span>
            </div>

            {/* Stock & Availability Pill */}
            <div className="detail-stock-row">
              {isOutOfStock ? (
                <span className="stock-status-pill out-of-stock">Currently Sold Out</span>
              ) : isLowStock ? (
                <span className="stock-status-pill low-stock">
                  Limited Batch — Only {product.stockCount} pieces remaining
                </span>
              ) : (
                <span className="stock-status-pill in-stock">
                  In Stock — Ready for immediate studio dispatch ({product.stockCount} available)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="detail-description-block">
              <h3 className="detail-subheading">Craftsmanship & Design</h3>
              <p className="detail-description-text">{product.description}</p>
            </div>

            {/* Variant Options (Edition / Material) */}
            <div className="detail-variants-group">
              <span className="variants-label">Edition / Finish:</span>
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
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                  >
                    –
                  </button>
                  <span id="detail-qty" className="qty-num">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(product.stockCount || 99, quantity + 1))}
                    disabled={quantity >= product.stockCount || isOutOfStock}
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
                    addToast(added ? 'Added to Wishlist' : 'Removed from Wishlist', 'info');
                  }}
                >
                  <Heart size={16} fill={wishlisted ? '#B23A22' : 'none'} color={wishlisted ? '#B23A22' : 'currentColor'} />
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
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="detail-specs-section">
            <h3 className="section-specs-title">Technical & Material Specifications</h3>
            <div className="specs-table-container">
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.specs).map(([specKey, specVal]) => (
                    <tr key={specKey}>
                      <th className="spec-name">{specKey}</th>
                      <td className="spec-value">{specVal}</td>
                    </tr>
                  ))}
                  <tr>
                    <th className="spec-name">Category</th>
                    <td className="spec-value">{product.category}</td>
                  </tr>
                  <tr>
                    <th className="spec-name">Studio Provenance</th>
                    <td className="spec-value">{product.storeName || 'Verified Artisan Atelier'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                  onClick={() => onSelectProduct(companionProduct)}
                >
                  <img src={companionProduct.imageUrl} alt={companionProduct.title} />
                  <span className="bundle-prod-name">{companionProduct.title}</span>
                  <span className="bundle-prod-price">₹{Number(companionProduct.price).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bundle-total-action">
                <div className="bundle-total-group">
                  <span className="total-label">Combined Bundle Total:</span>
                  <span className="total-price">₹{Number(bundleTotal).toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="button"
                  className="btn-primary btn-add-bundle"
                  onClick={handleAddBundleToCart}
                >
                  <ShoppingBag size={16} />
                  <span>Add Both to Bag</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="similar-products-section">
            <div className="similar-header">
              <h3 className="similar-title">More in {product.category}</h3>
              <p className="similar-subtitle">Handcrafted pieces sharing similar craftsmanship traditions</p>
            </div>
            <div className="similar-grid">
              {similarProducts.map((simProd) => (
                <div
                  key={simProd._id}
                  className="similar-card"
                  onClick={() => onSelectProduct(simProd)}
                >
                  <img src={simProd.imageUrl} alt={simProd.title} />
                  <div className="similar-info">
                    <span className="similar-store">{simProd.storeName}</span>
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
