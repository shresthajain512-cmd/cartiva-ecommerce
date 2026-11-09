import React, { useState, useEffect } from 'react';
import {
  Store,
  MapPin,
  CheckCircle,
  Star,
  ArrowLeft,
  Package,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { fetchStorefront } from '../services/api';

const ARTISAN_STORIES = {
  'Kanso Sound & Acoustics': {
    location: 'Kyoto & Bengaluru Studios',
    founded: '2021',
    bio: 'Kanso translates to simplicity and the elimination of clutter. We engineer precision acoustic hardware, hand-lubricated mechanical keyboards, and studio audio drivers with bio-cellulose diaphragms and aerospace-grade aluminum.',
    banner: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  },
  'Nomad Leather Atelier': {
    location: 'Florence & Jaipur',
    founded: '2019',
    bio: 'Dedicated to traditional French saddle-stitching, English bridle leather, and Tuscan vegetable-tanned hides. Every bag, wallet, and belt is cut by hand and hand-burnished using pure unbleached beeswax.',
    banner: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  },
  'Terra Stoneware Studio': {
    location: 'Khurja & Pondicherry',
    founded: '2018',
    bio: 'High-fire stoneware fired in reduction kilns at 1280°C. We craft pour-over coffee servers, matcha chawans, and heavy enamelled cast iron pieces built to age with warmth in the kitchen.',
    banner: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
  },
  'Sonder Books & Prints': {
    location: 'Edinburgh & Mumbai',
    founded: '2020',
    bio: 'Sonder is the realization that each random passerby lives a life as vivid as your own. We publish architectural monographs, typography compendiums, and archival letterpress folios on uncoated stock.',
    banner: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
  },
  'Prana Movement Lab': {
    location: 'Rishikesh & Goa',
    founded: '2022',
    bio: 'Bridging ancient yogic science and modern kinetic conditioning. We harvest organic cork and natural tree rubber to create studio-grade mats, cast iron bells, and recovery rollers free from synthetic plastics.',
    banner: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
  },
  'Aethel Botanical & Living': {
    location: 'Dehradun Foothills',
    founded: '2021',
    bio: 'Apothecary and home living studio formulating small-batch soy candles, steam-distilled room mists, and spun raw brass meditation vessels inspired by Himalayan cedar forests.',
    banner: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
  }
};

export const StorefrontPage = ({
  sellerId,
  onBack,
  onInspectProduct,
  allProducts = []
}) => {
  const [storeData, setStoreData] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStoreCategory, setSelectedStoreCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const loadStore = async () => {
      setLoading(true);
      setError(null);
      try {
        if (sellerId) {
          const data = await fetchStorefront(sellerId);
          if (isMounted) {
            if (data.success && data.store) {
              setStoreData(data.store);
              setStoreProducts(data.products || []);
            } else {
              setError('Artisan Studio Not Found');
            }
          }
        } else {
          // Fallback to first available seller from loaded products if no sellerId was provided
          const sampleProd = allProducts.find((p) => p.seller?._id || p.seller);
          if (sampleProd) {
            const sid = sampleProd.seller?._id || sampleProd.seller;
            const data = await fetchStorefront(sid);
            if (isMounted && data.success && data.store) {
              setStoreData(data.store);
              setStoreProducts(data.products || []);
            }
          } else {
            setError('No artisan storefront specified');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Storefront load notice:', err.message);
          setError(err.message || 'Artisan Studio Not Found');
          setStoreData(null);
          setStoreProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStore();
    return () => {
      isMounted = false;
    };
  }, [sellerId, allProducts]);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="storefront-page animate-fade-in">
        <div className="storefront-hero-banner" style={{ backgroundColor: 'var(--color-beige)', height: '260px' }}>
          <div className="storefront-banner-overlay">
            <div className="container">
              <button type="button" className="storefront-back-btn" onClick={onBack}>
                <ArrowLeft size={16} />
                <span>Back to Catalogue</span>
              </button>
            </div>
          </div>
        </div>
        <div className="container storefront-container" style={{ padding: '2rem 1rem 5rem' }}>
          <div className="skeleton-box" style={{ height: '140px', width: '100%', borderRadius: 'var(--radius-md)', marginBottom: '3rem' }} />
          <div className="products-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="product-skeleton-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error / Studio Not Found State
  if (error || !storeData) {
    return (
      <div className="storefront-page animate-fade-in">
        <div className="container storefront-container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
          <div className="catalogue-empty-state" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div className="empty-state-icon" style={{ marginBottom: '1.5rem' }}>
              <Store size={56} strokeWidth={1.5} color="var(--color-gold)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--color-charcoal)' }}>
              Artisan Studio Not Found
            </h2>
            <p style={{ color: 'var(--color-charcoal-muted)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {error || 'This artisan studio does not exist, has been archived, or is awaiting marketplace verification.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={onBack}
              style={{ padding: '0.85rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={16} />
              <span>Return to Marketplace Catalogue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const businessName = storeData.businessName || storeData.name || 'Verified Atelier';
  const story = ARTISAN_STORIES[businessName] || {
    location: 'Independent Maker Studio',
    founded: '2020',
    bio: `${businessName} is an approved independent Cartiva artisan atelier dedicated to small-batch craftsmanship, transparent provenance, and sustainable material sourcing.`,
    banner: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  };

  const storeCategories = [
    'All',
    ...Array.from(new Set(storeProducts.map((p) => p.category).filter(Boolean)))
  ];

  const filteredStoreProducts =
    selectedStoreCategory === 'All'
      ? storeProducts
      : storeProducts.filter((p) => p.category === selectedStoreCategory);

  return (
    <div className="storefront-page animate-fade-in">
      {/* Banner Section */}
      <div
        className="storefront-hero-banner"
        style={{ backgroundImage: `url(${story.banner})` }}
      >
        <div className="storefront-banner-overlay">
          <div className="container">
            <button type="button" className="storefront-back-btn" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Back to Catalogue</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container storefront-container">
        {/* Store Profile Card */}
        <div className="store-profile-card">
          <div className="store-avatar-box">
            <img src={story.avatar} alt={businessName} />
          </div>

          <div className="store-meta-group">
            <div className="store-title-badge-row">
              <h1 className="store-name-title">{businessName}</h1>
              <span className="verified-pill">
                <CheckCircle size={14} />
                <span>Verified Independent Atelier</span>
              </span>
            </div>

            <div className="store-location-row">
              <MapPin size={14} />
              <span>{story.location}</span>
              <span className="store-dot">•</span>
              <span>Est. {story.founded}</span>
              <span className="store-dot">•</span>
              <div className="store-rating-star">
                <Star size={13} fill="var(--color-gold)" color="var(--color-gold)" />
                <span>4.9 Studio Score</span>
              </div>
            </div>

            <p className="store-bio-text">{story.bio}</p>
          </div>
        </div>

        {/* Store Catalogue Navigation & Category Filter Pills */}
        <div className="store-catalogue-header">
          <div className="store-header-info">
            <h2 className="store-catalogue-title">
              Studio Catalogue ({filteredStoreProducts.length})
            </h2>
            <p className="store-catalogue-sub">
              Showing {filteredStoreProducts.length} authentic {filteredStoreProducts.length === 1 ? 'creation' : 'creations'} handcrafted by {businessName}.
            </p>
          </div>

          {storeCategories.length > 1 && (
            <div className="store-category-pills">
              {storeCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`store-cat-btn ${selectedStoreCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedStoreCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Store Products Grid */}
        {filteredStoreProducts.length === 0 ? (
          <div className="catalogue-alert-state" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-charcoal-muted)', marginBottom: '1.5rem' }}>
              No pieces currently catalogued in this studio category.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setSelectedStoreCategory('All')}
            >
              View All Studio Pieces
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredStoreProducts.map((prod) => (
              <ProductCard
                key={prod._id}
                product={prod}
                onInspect={onInspectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
