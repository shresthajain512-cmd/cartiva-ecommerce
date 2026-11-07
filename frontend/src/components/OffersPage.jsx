import React from 'react';
import { Sparkles, Tag, ArrowRight, Clock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { ProductCard } from './ProductCard';

export const OffersPage = ({
  allProducts = [],
  onInspectProduct,
  onExploreCatalogue
}) => {
  // Filter products with real discounts
  const discountedProducts = allProducts.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

  return (
    <div className="offers-page">
      <div className="container">
        {/* Hero Banner */}
        <div className="offers-hero-card">
          <div className="offers-hero-content">
            <span className="offers-eyebrow">
              <Sparkles size={14} />
              <span>Autumn 2026 Archive Event</span>
            </span>
            <h1 className="offers-title">Studio Promotions & Seasonal Reductions</h1>
            <p className="offers-subtitle">
              Special introductory allocations on certified artisan pieces. Directly funded by our
              studio makers with full warranty, archival provenance, and complimentary domestic courier.
            </p>
            <div className="offers-badge-row">
              <span className="offer-tag-badge">Up to 25% Off Select Ateliers</span>
              <span className="offer-tag-badge">Free Domestic Delivery over ₹2,999</span>
            </div>
          </div>
        </div>

        {/* Promo Grid */}
        <div className="offers-promos-banner-grid">
          <div className="promo-callout-card">
            <Tag size={20} className="promo-icon" />
            <div className="promo-text">
              <h4>Audio & Desk Bundle</h4>
              <p>Save up to ₹1,500 on Kanso wireless mechanical keyboards & studio headphones</p>
            </div>
          </div>

          <div className="promo-callout-card">
            <Clock size={20} className="promo-icon" />
            <div className="promo-text">
              <h4>Limited Batch Ceramics</h4>
              <p>Terra Stoneware studio introductory savings on pour-over drippers & matcha chawans</p>
            </div>
          </div>

          <div className="promo-callout-card">
            <ShieldCheck size={20} className="promo-icon" />
            <div className="promo-text">
              <h4>Full Lifetime Guarantee</h4>
              <p>Every discounted piece retains complete studio authenticity & 14-day returns</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="offers-catalogue-header">
          <h2 className="offers-grid-heading">
            Promotional Archive Pieces ({discountedProducts.length})
          </h2>
          <p className="offers-grid-sub">
            Verified discounted pieces currently active in our live MongoDB catalogue.
          </p>
        </div>

        {discountedProducts.length > 0 ? (
          <div className="products-grid">
            {discountedProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onInspect={onInspectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty-state">
            <p>All items currently at standard studio retail pricing.</p>
            <button type="button" className="btn-primary" onClick={onExploreCatalogue}>
              Browse Full Catalogue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
