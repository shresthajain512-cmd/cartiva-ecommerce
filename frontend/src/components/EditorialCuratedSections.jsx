import React, { useState } from 'react';
import { Sparkles, ArrowRight, Star, Heart, ShoppingBag, Mail, CheckCircle2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const EditorialCuratedSections = ({
  allProducts = [],
  onInspectProduct,
  onExploreCategory,
  onExploreCatalogue
}) => {
  const { recentlyViewed } = useRecentlyViewed();
  const { wishlist } = useWishlist();
  const { addToast } = useToast();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // 1. Trending Products (Featured items)
  const trendingProducts = allProducts.filter((p) => p.isFeatured).slice(0, 4);

  // 2. New Arrivals (Latest additions)
  const newArrivals = allProducts.slice(0, 4);

  // 3. Best Sellers (High rating & review count)
  const bestSellers = [...allProducts]
    .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
    .slice(0, 4);

  // 4. Personalized Recommendations (derived from user browsing / wishlist or featured balance)
  const preferredCategory =
    recentlyViewed.length > 0
      ? recentlyViewed[0].category
      : wishlist.length > 0
      ? wishlist[0].category
      : 'Home & Kitchen';

  const personalizedRecommendations = allProducts
    .filter((p) => p.category === preferredCategory)
    .slice(0, 4);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Please provide a valid email address', 'warning');
      return;
    }
    setSubscribed(true);
    addToast('Thank you for subscribing to Cartiva Gazette', 'success');
  };

  return (
    <div className="editorial-showcases-wrapper">
      {/* 1. Trending Curations */}
      {trendingProducts.length > 0 && (
        <section className="showcase-section">
          <div className="container">
            <div className="showcase-header-row">
              <div>
                <span className="section-eyebrow">Studio Spotlight</span>
                <h2 className="section-title">Trending Artisan Creations</h2>
              </div>
              <button
                type="button"
                className="section-view-all-btn"
                onClick={onExploreCatalogue}
              >
                <span>View Full Catalogue</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="products-grid">
              {trendingProducts.map((p) => (
                <ProductCard key={p._id} product={p} onInspect={onInspectProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. New Arrivals & Best Sellers Dual Showcase */}
      <section className="showcase-section bg-subtle">
        <div className="container">
          <div className="showcase-header-row">
            <div>
              <span className="section-eyebrow">Fresh Kiln & Studio Dispatches</span>
              <h2 className="section-title">New Arrivals for Autumn</h2>
            </div>
          </div>

          <div className="products-grid">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} onInspect={onInspectProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Recommended for You (Personalized Signal) */}
      {personalizedRecommendations.length > 0 && (
        <section className="showcase-section">
          <div className="container">
            <div className="showcase-header-row">
              <div>
                <span className="section-eyebrow">Personalized Signal</span>
                <h2 className="section-title">
                  Recommended for You in {preferredCategory}
                </h2>
              </div>
              <button
                type="button"
                className="section-view-all-btn"
                onClick={() => onExploreCategory(preferredCategory)}
              >
                <span>Explore {preferredCategory}</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="products-grid">
              {personalizedRecommendations.map((p) => (
                <ProductCard key={p._id} product={p} onInspect={onInspectProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Recently Viewed Products (History Tracker) */}
      {recentlyViewed.length > 0 && (
        <section className="showcase-section bg-subtle">
          <div className="container">
            <div className="showcase-header-row">
              <div>
                <span className="section-eyebrow">Your Session History</span>
                <h2 className="section-title">Recently Viewed Pieces</h2>
              </div>
            </div>

            <div className="products-grid">
              {recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p._id} product={p} onInspect={onInspectProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Newsletter Subscription: The Cartiva Gazette */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <div className="newsletter-icon-wrap">
              <Mail size={28} />
            </div>
            <span className="newsletter-eyebrow">The Cartiva Gazette</span>
            <h2 className="newsletter-title">Slow Living & Artisan Monograph</h2>
            <p className="newsletter-desc">
              Bi-weekly essays on studio visits, woodblock printing, natural dye houses, and
              first private allocations for limited seasonal kiln runs. No marketing spam.
            </p>

            {subscribed ? (
              <div className="newsletter-success-box">
                <CheckCircle2 size={20} className="check-green" />
                <span>You are now subscribed to the Cartiva Gazette. Welcome to our salon.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your personal email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-submit-btn">
                  <span>Subscribe</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            <span className="newsletter-guarantee">
              Direct-from-studio provenance • Unsubscribe with a single click at any time
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
