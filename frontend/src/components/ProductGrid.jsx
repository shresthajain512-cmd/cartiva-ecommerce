import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import {
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ProductGrid = ({
  products = [],
  loading = false,
  error = null,
  onRetry,
  searchQuery = '',
  onClearSearch,
  selectedCategory = 'All',
  onSelectCategory,
  sortOption = 'featured',
  onSortChange,
  inStockOnly = false,
  onToggleInStock,
  minPrice = '',
  maxPrice = '',
  onClearPrice,
  selectedSeller = '',
  sellers = [],
  onClearSeller,
  minRating = '',
  onClearRating,
  discountedOnly = false,
  onToggleDiscounted,
  newArrivalsOnly = false,
  onToggleNewArrivals,
  onResetFilters,
  onOpenFilterDrawer,
  onInspectProduct
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculation
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  // Active filter chips list
  const activeChips = [];
  if (selectedCategory && selectedCategory !== 'All') {
    activeChips.push({
      id: 'category',
      label: `Category: ${selectedCategory}`,
      onRemove: () => onSelectCategory('All')
    });
  }
  if (searchQuery) {
    activeChips.push({
      id: 'search',
      label: `Search: "${searchQuery}"`,
      onRemove: onClearSearch
    });
  }
  if (minPrice || maxPrice) {
    activeChips.push({
      id: 'price',
      label: `Price: ₹${minPrice || '0'} – ₹${maxPrice || 'Any'}`,
      onRemove: onClearPrice
    });
  }
  if (selectedSeller) {
    const sellerObj = sellers.find((s) => s._id === selectedSeller);
    activeChips.push({
      id: 'seller',
      label: `Studio: ${sellerObj ? sellerObj.businessName : 'Selected Maker'}`,
      onRemove: onClearSeller
    });
  }
  if (minRating) {
    activeChips.push({
      id: 'rating',
      label: `Rating: ${minRating}★ & above`,
      onRemove: onClearRating
    });
  }
  if (inStockOnly) {
    activeChips.push({
      id: 'inStock',
      label: 'In Stock Only',
      onRemove: () => onToggleInStock(false)
    });
  }
  if (discountedOnly) {
    activeChips.push({
      id: 'discounted',
      label: 'Special Offers Only',
      onRemove: () => onToggleDiscounted(false)
    });
  }
  if (newArrivalsOnly) {
    activeChips.push({
      id: 'newArrivals',
      label: 'New Arrivals Only',
      onRemove: () => onToggleNewArrivals(false)
    });
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const el = document.getElementById('catalogue-results-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="catalogue" className="catalogue-section">
      <div id="catalogue-results-anchor" />
      <div className="catalogue-inner-content">
        {/* 1. Header & Controls Bar */}
        <div className="catalogue-controls-bar">
          <div className="catalogue-header-info">
            <span className="catalogue-eyebrow">The Master Catalogue</span>
            <h2 className="catalogue-title">
              {selectedCategory === 'All' ? 'All Handcrafted Creations' : `${selectedCategory} Collection`}
            </h2>
            <p className="catalogue-count">
              {loading
                ? 'Loading verified artisan inventory...'
                : `Showing ${totalItems} authentic ${totalItems === 1 ? 'creation' : 'creations'} across 6 categories`}
            </p>
          </div>

          {/* Filtering & Sorting Controls */}
          <div className="controls-right-group">
            {/* Filter Drawer Toggle Button */}
            <button
              type="button"
              className="btn-filter-drawer-toggle"
              onClick={onOpenFilterDrawer}
              aria-label="Open filter options"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="controls-badge">{activeChips.length}</span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle" role="group" aria-label="Layout view mode">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid layout"
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List layout"
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="sort-select-wrapper">
              <ArrowUpDown size={14} className="sort-icon" />
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Sort product catalogue"
              >
                <option value="featured">Featured Curations</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="top_rated">Top Rated (★)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Active Filter Chips Row */}
        {activeChips.length > 0 && (
          <div className="active-filters-chips-bar">
            <span className="active-chips-label">Active Filters:</span>
            <div className="active-chips-list">
              {activeChips.map((chip) => (
                <div key={chip.id} className="filter-chip">
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="clear-all-chips-btn"
                onClick={onResetFilters}
              >
                Reset All
              </button>
            </div>
          </div>
        )}

        {/* 3. Error State */}
        {error && (
          <div className="catalogue-alert-state" role="alert">
            <AlertCircle size={28} className="alert-icon" />
            <div className="alert-content">
              <h3>Catalogue Connection Interrupted</h3>
              <p>{error}</p>
            </div>
            <button type="button" className="btn-retry" onClick={onRetry}>
              <RefreshCw size={15} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* 4. Loading Skeletons */}
        {loading && (
          <div className={`products-grid ${viewMode === 'list' ? 'products-list-layout' : ''}`}>
            {[...Array(viewMode === 'list' ? 4 : 8)].map((_, idx) => (
              <div key={idx} className="product-skeleton-card">
                <div className="skeleton-image-box" />
                <div className="skeleton-body">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line title" />
                  <div className="skeleton-line text" />
                  <div className="skeleton-footer">
                    <div className="skeleton-line price" />
                    <div className="skeleton-line button" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Product Cards Display */}
        {!loading && !error && paginatedProducts.length > 0 && (
          <>
            <div className={`products-grid ${viewMode === 'list' ? 'products-list-layout' : ''}`}>
              {paginatedProducts.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onInspect={onInspectProduct}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="catalogue-pagination-bar">
                <button
                  type="button"
                  className="pagination-arrow-btn"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pagination-pages-group">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`pagination-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                        aria-label={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="pagination-arrow-btn"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* 6. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="catalogue-empty-state">
            <div className="empty-icon-wrap">
              <Sparkles size={32} />
            </div>
            <h3>No Handcrafted Pieces Found</h3>
            <p>
              No products match your selected combination of filters or keyword search.
              Try adjusting your price range, clearing specific filters, or resetting all.
            </p>
            <div className="empty-actions-row">
              <button
                type="button"
                className="btn-primary"
                onClick={onResetFilters}
              >
                Reset All Filters
              </button>
              {selectedCategory !== 'All' && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onSelectCategory('All')}
                >
                  View All Categories
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
