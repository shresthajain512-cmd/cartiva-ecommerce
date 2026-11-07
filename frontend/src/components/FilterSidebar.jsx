import React from 'react';
import { X, SlidersHorizontal, Check, RotateCcw, Star, DollarSign, Store, Tag } from 'lucide-react';

export const FilterSidebar = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  sellers = [],
  selectedSeller,
  onSelectSeller,
  minPrice,
  maxPrice,
  onPriceChange,
  minRating,
  onRatingChange,
  inStockOnly,
  onToggleInStock,
  discountedOnly,
  onToggleDiscounted,
  newArrivalsOnly,
  onToggleNewArrivals,
  onResetFilters,
  activeFilterCount,
  isOpen,
  onClose,
  totalMatching
}) => {
  const pricePresets = [
    { label: 'Under ₹1,500', min: 0, max: 1500 },
    { label: '₹1,500 – ₹3,000', min: 1500, max: 3000 },
    { label: '₹3,000 – ₹6,000', min: 3000, max: 6000 },
    { label: 'Above ₹6,000', min: 6000, max: 20000 }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="filter-drawer-backdrop" onClick={onClose} />}

      <aside className={`catalogue-filter-sidebar ${isOpen ? 'drawer-open' : ''}`}>
        {/* Drawer Header (Mobile & Desktop) */}
        <div className="filter-sidebar-header">
          <div className="filter-header-title-group">
            <SlidersHorizontal size={18} className="filter-icon" />
            <h3 className="filter-sidebar-title">Refine Catalogue</h3>
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount} active</span>
            )}
          </div>

          <div className="filter-header-actions">
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={onResetFilters}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset All</span>
              </button>
            )}
            <button
              type="button"
              className="filter-drawer-close-btn"
              onClick={onClose}
              aria-label="Close filters drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="filter-scroll-content">
          {/* 1. Category Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">
              <Tag size={14} />
              <span>Category</span>
            </h4>
            <div className="filter-options-list">
              <button
                type="button"
                className={`filter-category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => onSelectCategory('All')}
              >
                <span>All Categories</span>
                {selectedCategory === 'All' && <Check size={14} />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat)}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Range Filter */}
          <div className="filter-section">
            <h4 className="filter-section-title">
              <DollarSign size={14} />
              <span>Price Range (₹)</span>
            </h4>

            {/* Presets */}
            <div className="price-presets-grid">
              {pricePresets.map((preset) => {
                const isSelected =
                  Number(minPrice) === preset.min && Number(maxPrice) === preset.max;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    className={`price-preset-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        onPriceChange('', '');
                      } else {
                        onPriceChange(preset.min, preset.max);
                      }
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Inputs */}
            <div className="price-inputs-row">
              <div className="price-input-box">
                <span className="price-curr">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => onPriceChange(e.target.value, maxPrice)}
                  min="0"
                  className="price-input"
                />
              </div>
              <span className="price-divider">–</span>
              <div className="price-input-box">
                <span className="price-curr">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => onPriceChange(minPrice, e.target.value)}
                  min="0"
                  className="price-input"
                />
              </div>
            </div>
          </div>

          {/* 3. Artisan Studio / Seller Filter */}
          {sellers.length > 0 && (
            <div className="filter-section">
              <h4 className="filter-section-title">
                <Store size={14} />
                <span>Artisan Studio</span>
              </h4>
              <div className="filter-options-list">
                <button
                  type="button"
                  className={`filter-seller-chip ${!selectedSeller ? 'active' : ''}`}
                  onClick={() => onSelectSeller('')}
                >
                  <span>All Studios</span>
                  {!selectedSeller && <Check size={13} />}
                </button>
                {sellers.map((s) => (
                  <button
                    key={s._id || s.businessName}
                    type="button"
                    className={`filter-seller-chip ${selectedSeller === s._id ? 'active' : ''}`}
                    onClick={() => onSelectSeller(selectedSeller === s._id ? '' : s._id)}
                  >
                    <span>{s.businessName || s.name}</span>
                    {selectedSeller === s._id && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Minimum Customer Rating */}
          <div className="filter-section">
            <h4 className="filter-section-title">
              <Star size={14} />
              <span>Customer Rating</span>
            </h4>
            <div className="rating-filter-options">
              {[4.8, 4.5, 4.0].map((starVal) => {
                const isSelected = Number(minRating) === starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    className={`rating-filter-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => onRatingChange(isSelected ? '' : starVal)}
                  >
                    <div className="rating-stars-group">
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <span>{starVal} & above</span>
                    </div>
                    {isSelected && <Check size={13} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Inventory & Special Flags */}
          <div className="filter-section">
            <h4 className="filter-section-title">
              <span>Availability & Offers</span>
            </h4>
            <div className="filter-checkbox-list">
              <label className="filter-checkbox-row">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => onToggleInStock(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label">In-Stock Only</span>
              </label>

              <label className="filter-checkbox-row">
                <input
                  type="checkbox"
                  checked={discountedOnly}
                  onChange={(e) => onToggleDiscounted(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label">Special Offers & Discounts</span>
              </label>

              <label className="filter-checkbox-row">
                <input
                  type="checkbox"
                  checked={newArrivalsOnly}
                  onChange={(e) => onToggleNewArrivals(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-label">New Arrivals Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Mobile Apply Button */}
        <div className="filter-drawer-footer">
          <button type="button" className="btn-drawer-apply" onClick={onClose}>
            <span>View {totalMatching !== undefined ? `${totalMatching} Results` : 'Results'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
