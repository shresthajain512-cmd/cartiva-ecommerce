import React, { useState, useEffect } from 'react';
import { Store, MapPin, CheckCircle, Star, ArrowLeft, SlidersHorizontal, Package } from 'lucide-react';
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
          if (isMounted && data.success) {
            setStoreData(data.store);
            setStoreProducts(data.products || []);
          }
        } else {
          // Fallback to first available seller from products
          const sampleProd = allProducts.find((p) => p.storeName);
          if (sampleProd) {
            setStoreData({
              id: sampleProd.seller?._id || sampleProd.seller,
              name: sampleProd.seller?.name || 'Verified Maker',
              businessName: sampleProd.storeName
            });
            setStoreProducts(allProducts.filter((p) => p.storeName === sampleProd.storeName));
          }
        }
      } catch (err) {
        console.error('Storefront load error:', err);
        // Fallback gracefully to client filtering if API had seller ID format issue
        const matched = allProducts.filter(
          (p) =>
            p.seller?._id === sellerId ||
            p.seller === sellerId ||
            p.storeName === sellerId
        );
        if (isMounted) {
          if (matched.length > 0) {
            setStoreData({
              id: sellerId,
              name: matched[0].seller?.name || 'Artisan Maker',
              businessName: matched[0].storeName
            });
            setStoreProducts(matched);
          } else {
            setError(err.message || 'Storefront could not be loaded.');
          }
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

  const businessName = storeData?.businessName || 'Verified Studio';
  const story = ARTISAN_STORIES[businessName] || {
    location: 'Direct Maker Studio',
    founded: '2020',
    bio: 'Dedicated independent maker crafting authentic small-batch products for the Cartiva community.',
    banner: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1600&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  };

  const storeCategories = [
    'All',
    ...Array.from(new Set(storeProducts.map((p) => p.category)))
  ];

  const filteredStoreProducts =
    selectedStoreCategory === 'All'
      ? storeProducts
      : storeProducts.filter((p) => p.category === selectedStoreCategory);

  return (
    <div className="storefront-page">
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

        {/* Store Catalogue Navigation & Category Pills */}
        <div className="store-catalogue-header">
          <div className="store-header-info">
            <h2 className="store-catalogue-title">
              Studio Catalogue ({filteredStoreProducts.length})
            </h2>
            <p className="store-catalogue-sub">
              Browse original pieces made exclusively in small batches by {businessName}.
            </p>
          </div>

          {storeCategories.length > 2 && (
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
        {loading ? (
          <div className="products-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-skeleton-card" />
            ))}
          </div>
        ) : error ? (
          <div className="catalogue-alert-state">
            <p>{error}</p>
            <button type="button" className="btn-primary" onClick={onBack}>
              Return to Catalogue
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
