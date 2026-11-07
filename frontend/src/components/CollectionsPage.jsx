import React from 'react';
import { Sparkles, ArrowRight, Layers, Eye } from 'lucide-react';

const CURATED_COLLECTIONS = [
  {
    id: 'desk-setup',
    title: 'Minimal Desk Setup',
    subtitle: 'Tactile mechanical typing, anodized risers & focused acoustic calm',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    count: '7 Selected Items',
    keyword: 'Keyboard'
  },
  {
    id: 'thoughtful-gifting',
    title: 'Thoughtful Gifting',
    subtitle: 'Hand-poured cedar soy candles, leather wallets & letterpress art folios',
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=1200&q=80',
    count: '10 Selected Items',
    keyword: 'Candle'
  },
  {
    id: 'everyday-essentials',
    title: 'Everyday Essentials',
    subtitle: 'Vachetta leather weekender, waxed canvas totes & organic cotton overshirts',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
    count: '8 Selected Items',
    keyword: 'Tote'
  },
  {
    id: 'home-refresh',
    title: 'Home & Table Refresh',
    subtitle: 'Wheel-thrown ceramic pour-over carafes, matcha bowls & cast iron cookware',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80',
    count: '9 Selected Items',
    category: 'Home & Kitchen'
  },
  {
    id: 'fitness-movement',
    title: 'Fitness & Mindful Movement',
    subtitle: 'High-density cork studio mats, matte iron kettlebells & mobility tools',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=80',
    count: '8 Selected Items',
    category: 'Fitness'
  }
];

export const CollectionsPage = ({ onExploreCollection }) => {
  return (
    <div className="collections-page">
      <div className="container">
        {/* Header */}
        <div className="collections-hero-header">
          <span className="collections-eyebrow">Editorial Lookbooks</span>
          <h1 className="collections-title">Curated Thematic Collections</h1>
          <p className="collections-subtitle">
            Harmonious groupings of pieces designed to work together, assembled by our design
            editors around specific rituals of daily living.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="collections-grid-layout">
          {CURATED_COLLECTIONS.map((col, idx) => (
            <div
              key={col.id}
              className={`collection-editorial-card ${idx === 0 ? 'card-featured-span' : ''}`}
              onClick={() => onExploreCollection(col)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onExploreCollection(col);
              }}
            >
              <div
                className="collection-card-bg"
                style={{ backgroundImage: `url(${col.image})` }}
              />
              <div className="collection-card-overlay">
                <span className="collection-count-pill">{col.count}</span>

                <div className="collection-card-content">
                  <span className="collection-tag">Curated Edit</span>
                  <h3 className="collection-title-text">{col.title}</h3>
                  <p className="collection-subtitle-text">{col.subtitle}</p>

                  <div className="collection-explore-link">
                    <span>Explore Collection</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
