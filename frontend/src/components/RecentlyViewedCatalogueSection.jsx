import React from 'react';
import { History, Trash2, Eye, Store, Star } from 'lucide-react';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

export const RecentlyViewedCatalogueSection = ({ onInspectProduct, onSelectProduct }) => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="recently-viewed-catalogue-section" aria-label="Recently viewed products">
      <div className="recently-viewed-header">
        <div className="recently-viewed-title-group">
          <div className="eyebrow-with-icon">
            <History size={14} className="eyebrow-icon" />
            <span className="editorial-eyebrow">Your Browsing Journey</span>
          </div>
          <h3 className="recently-viewed-title">Recently Viewed Creations</h3>
          <p className="recently-viewed-subtitle">
            Handcrafted pieces you explored from verified artisan studios
          </p>
        </div>

        <button
          type="button"
          className="btn-clear-recent-history"
          onClick={clearRecentlyViewed}
          aria-label="Clear recently viewed products history"
          title="Clear history"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      <div className="recently-viewed-carousel">
        {recentlyViewed.map((prod) => (
          <div
            key={prod._id}
            className="recent-product-card"
            onClick={() => {
              if (onInspectProduct) onInspectProduct(prod);
              else if (onSelectProduct) onSelectProduct(prod);
            }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${prod.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (onInspectProduct) onInspectProduct(prod);
                else if (onSelectProduct) onSelectProduct(prod);
              }
            }}
          >
            <div className="recent-img-wrapper">
              <img
                src={prod.imageUrl}
                alt={prod.title}
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <span className="recent-category-pill">{prod.category}</span>
              <button
                type="button"
                className="recent-quick-view-action"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onInspectProduct) onInspectProduct(prod);
                }}
                aria-label={`Quick view ${prod.title}`}
              >
                <Eye size={13} />
                <span>Quick View</span>
              </button>
            </div>

            <div className="recent-body">
              <div className="recent-store-row">
                <Store size={11} className="store-icon" />
                <span className="recent-store-name">
                  {prod.storeName || prod.seller?.businessName || 'Artisan Studio'}
                </span>
              </div>
              <h4 className="recent-prod-title" title={prod.title}>
                {prod.title}
              </h4>
              <div className="recent-footer-row">
                <span className="recent-price">
                  ₹{Number(prod.price).toLocaleString('en-IN')}
                </span>
                {prod.rating && (
                  <div className="recent-rating">
                    <Star size={11} fill="var(--color-gold)" color="var(--color-gold)" />
                    <span>{Number(prod.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

