import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

export const CategoryBar = ({ categories = [], selectedCategory = 'All', onSelectCategory }) => {
  const allCategories = ['All', ...(categories || [])];

  return (
    <div className="category-bar-wrapper">
      <div className="container category-container">
        <div className="category-label">
          <Layers size={16} className="category-label-icon" />
          <span>Curated Editions</span>
        </div>

        <div className="category-pills-scroll" role="tablist" aria-label="Product categories">
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={isSelected}
                className={`category-pill ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat === 'All' && <Sparkles size={13} className="pill-sparkle" />}
                <span>{cat === 'All' ? 'All Collections' : cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        .category-bar-wrapper {
          background-color: var(--color-cream);
          border-bottom: 1px solid var(--color-beige);
          padding: 1rem 0;
          position: sticky;
          top: 73px;
          z-index: 90;
          backdrop-filter: blur(8px);
          background-color: rgba(245, 240, 231, 0.95);
        }

        .category-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .category-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.775rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-gold);
          flex-shrink: 0;
        }

        .category-label-icon {
          color: var(--color-gold);
        }

        .category-pills-scroll {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 0.2rem 0;
        }

        .category-pills-scroll::-webkit-scrollbar {
          display: none;
        }

        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-charcoal);
          background-color: var(--color-white);
          border: 1px solid var(--color-beige-dark);
          border-radius: var(--radius-full);
          white-space: nowrap;
          transition: all var(--transition-fast);
          cursor: pointer;
        }

        .category-pill:hover {
          border-color: var(--color-gold);
          color: var(--color-charcoal);
          transform: translateY(-1px);
        }

        .category-pill.active {
          background-color: var(--color-charcoal);
          color: var(--color-cream);
          border-color: var(--color-charcoal);
          box-shadow: var(--shadow-sm);
        }

        .pill-sparkle {
          color: var(--color-gold);
        }

        .category-pill.active .pill-sparkle {
          color: var(--color-gold);
        }

        @media (max-width: 768px) {
          .category-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
