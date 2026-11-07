import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Clock, ArrowRight, Store, Tag } from 'lucide-react';

const POPULAR_SEARCHES = [
  'Ceramic Matcha Bowl',
  'Mechanical Keyboard',
  'Leather Weekender',
  'Studio Candle',
  'Cork Yoga Mat',
  'Dutch Oven',
  'Pour Over Carafe'
];

const RECENT_SEARCHES_KEY = 'cartiva_recent_queries_v1';

export const SmartSearchDropdown = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onSelectProduct,
  products = [],
  isOpen,
  onClose
}) => {
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['Headphones', 'Leather Bag', 'Coffee Dripper'];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const saveQuery = (query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save search query:', err);
      }
      return updated;
    });
  };

  const handleSelectQuery = (query) => {
    saveQuery(query);
    onSearchChange(query);
    onSearchSubmit(query);
    onClose();
  };

  const handleClearRecents = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  if (!isOpen) return null;

  // Filter matching products
  const trimmed = searchQuery.trim().toLowerCase();
  const matchedProducts = trimmed
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(trimmed) ||
            p.category.toLowerCase().includes(trimmed) ||
            (p.storeName && p.storeName.toLowerCase().includes(trimmed)) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(trimmed)))
        )
        .slice(0, 5)
    : [];

  // Filter matching categories & sellers
  const matchedCategories = trimmed
    ? ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Fitness', 'Other'].filter((c) =>
        c.toLowerCase().includes(trimmed)
      )
    : [];

  return (
    <div className="smart-search-dropdown" ref={dropdownRef} role="listbox">
      {trimmed.length > 0 ? (
        <div className="search-results-section">
          {/* Matched Categories */}
          {matchedCategories.length > 0 && (
            <div className="search-group">
              <span className="search-group-title">
                <Tag size={13} />
                <span>Categories</span>
              </span>
              <div className="search-chips-row">
                {matchedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="search-chip"
                    onClick={() => handleSelectQuery(cat)}
                  >
                    <span>{cat}</span>
                    <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Products */}
          <div className="search-group">
            <span className="search-group-title">
              <Sparkles size={13} />
              <span>Matching Products ({matchedProducts.length})</span>
            </span>
            {matchedProducts.length > 0 ? (
              <div className="search-product-list">
                {matchedProducts.map((prod) => (
                  <div
                    key={prod._id}
                    className="search-product-item"
                    onClick={() => {
                      saveQuery(prod.title);
                      onSelectProduct(prod);
                      onClose();
                    }}
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="search-prod-thumb"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    <div className="search-prod-info">
                      <h4 className="search-prod-title">{prod.title}</h4>
                      <div className="search-prod-meta">
                        <span className="search-prod-store">{prod.storeName}</span>
                        <span className="search-prod-dot">•</span>
                        <span className="search-prod-price">₹{Number(prod.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="search-item-arrow" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="search-no-results">
                <p>No products directly match "{searchQuery}"</p>
                <button
                  type="button"
                  className="search-fallback-btn"
                  onClick={() => handleSelectQuery('')}
                >
                  Browse all 50 master products
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="search-default-section">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="search-group">
              <div className="search-group-header">
                <span className="search-group-title">
                  <Clock size={13} />
                  <span>Recent Searches</span>
                </span>
                <button
                  type="button"
                  className="clear-recents-btn"
                  onClick={handleClearRecents}
                >
                  Clear
                </button>
              </div>
              <div className="search-chips-row">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="search-chip"
                    onClick={() => handleSelectQuery(term)}
                  >
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="search-group">
            <span className="search-group-title">
              <Sparkles size={13} />
              <span>Trending & Popular Searches</span>
            </span>
            <div className="search-chips-row">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="search-chip popular"
                  onClick={() => handleSelectQuery(term)}
                >
                  <Search size={11} />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
