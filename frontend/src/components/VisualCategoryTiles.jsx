import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_TILES = [
  {
    name: 'Electronics',
    subtitle: 'Acoustics & Tactile Hardware',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    count: '8 Creations'
  },
  {
    name: 'Fashion',
    subtitle: 'Full-Grain Leather & Selvedge',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    count: '9 Creations'
  },
  {
    name: 'Home & Kitchen',
    subtitle: 'Ceramic Stoneware & Cast Iron',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    count: '9 Creations'
  },
  {
    name: 'Books',
    subtitle: 'Monographs & Letterpress',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    count: '8 Creations'
  },
  {
    name: 'Fitness',
    subtitle: 'Organic Cork & Movement Props',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    count: '8 Creations'
  },
  {
    name: 'Other',
    subtitle: 'Soy Candles, Mists & Desk Objects',
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80',
    count: '8 Creations'
  }
];

export const VisualCategoryTiles = ({ onSelectCategory }) => {
  return (
    <section className="category-tiles-section">
      <div className="container">
        <div className="tiles-section-header">
          <div>
            <span className="section-eyebrow">Explore Ateliers</span>
            <h2 className="section-title">Shop by Craft Discipline</h2>
          </div>
          <p className="section-lead">
            Curated across 6 foundational pillars of mindful daily living and master craftsmanship.
          </p>
        </div>

        <div className="category-tiles-grid">
          {CATEGORY_TILES.map((tile) => (
            <div
              key={tile.name}
              className="category-tile-card"
              onClick={() => onSelectCategory(tile.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelectCategory(tile.name);
              }}
            >
              <div
                className="tile-card-bg"
                style={{ backgroundImage: `url(${tile.image})` }}
              />
              <div className="tile-card-overlay">
                <span className="tile-count-badge">{tile.count}</span>
                <div className="tile-card-info">
                  <h3 className="tile-title">{tile.name}</h3>
                  <p className="tile-sub">{tile.subtitle}</p>
                  <div className="tile-action-link">
                    <span>Browse Collection</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
