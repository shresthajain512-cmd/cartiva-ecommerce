import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Search,
  Tag
} from 'lucide-react';

export const ProductGrid = ({
  products = [],
  allProducts = [],
  loading = false,
  error = null,
  onRetry,
  searchQuery = '',
  onSearchChange,
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

  // Reset page to 1 whenever any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    selectedSeller,
    minRating,
    inStockOnly,
    discountedOnly,
    newArrivalsOnly,
    sortOption
  ]);

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
  if (searchQuery && searchQuery.trim()) {
    activeChips.push({
      id: 'search',
      label: `Search: "${searchQuery}"`,
      onRemove: onClearSearch
    });
  }
  if (minPrice !== '' || maxPrice !== '') {
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
      label: `Studio: ${sellerObj ? sellerObj.businessName : 'Selected Studio'}`,
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

  const handleLoadMore = () => {
    setItemsPerPage((prev) => Math.min(totalItems, prev + 12));
  };

  return (
    <section id="catalogue" className="catalogue-section" aria-label="Product catalogue">
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
              {loading ? (
                'Loading verified artisan inventory...'
              ) : (
                <>
                  Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, totalItems)}</strong> of <strong>{totalItems}</strong> authentic {totalItems === 1 ? 'creation' : 'creations'}
                  {allProducts.length > 0 && totalItems !== allProducts.length && (
                    <span className="catalogue-filtered-pill"> (filtered from {allProducts.length})</span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Filtering, Search & Sorting Controls */}
          <div className="controls-right-group">
            {/* In-Catalogue Search Input */}
            <div className="catalogue-inline-search" role="search">
              <Search size={14} className="inline-search-icon" />
              <input
                type="text"
                className="inline-search-input"
                placeholder="Search catalogue..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                aria-label="Filter catalogue by keyword"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="inline-search-clear"
                  onClick={onClearSearch}
                  aria-label="Clear catalogue search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Drawer Toggle Button */}
            <button
              type="button"
              className="btn-filter-drawer-toggle"
              onClick={onOpenFilterDrawer}
              aria-label="Open filter drawer"
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
              {activeChips.length > 0 && (
                <span className="controls-badge">{activeChips.length}</span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="view-mode-toggle" role="group" aria-label="Catalogue view layout">
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
          <div className="active-filters-chips-bar" aria-label="Active filters">
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
                Reset All Filters
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

        {/* 5. Product Cards Display & Pagination */}
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

            {/* Pagination & Load More Discovery Controls */}
            <div className="catalogue-pagination-container">
              {/* Items Per Page & Display Summary Bar */}
              <div className="pagination-meta-row">
                <div className="pagination-progress-container">
                  <span className="progress-text">
                    Showing {Math.min(startIndex + paginatedProducts.length, totalItems)} of {totalItems} pieces
                  </span>
                  <div className="progress-track" aria-hidden="true">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.round(((startIndex + paginatedProducts.length) / totalItems) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                <div className="items-per-page-selector">
                  <span className="per-page-label">Show per page:</span>
                  {[12, 24, 48].map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`per-page-chip ${itemsPerPage === size ? 'active' : ''}`}
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                      }}
                      aria-label={`Show ${size} items per page`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Load More Button if remaining items on current page layout */}
              {startIndex + itemsPerPage < totalItems && (
                <div className="load-more-action-wrap">
                  <button
                    type="button"
                    className="btn-load-more"
                    onClick={handleLoadMore}
                    aria-label="Load more creations"
                  >
                    <Sparkles size={15} />
                    <span>Load More Pieces ({totalItems - (startIndex + itemsPerPage)} remaining)</span>
                  </button>
                </div>
              )}

              {/* Classic Numbered Pagination Bar */}
              {totalPages > 1 && (
                <div className="catalogue-pagination-bar" role="navigation" aria-label="Pagination">
                  <button
                    type="button"
                    className="pagination-arrow-btn"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
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
                          aria-current={currentPage === pageNum ? 'page' : undefined}
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
                    aria-label="Go to next page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* 6. Useful No-Results State */}
        {!loading && !error && products.length === 0 && (
          <div className="catalogue-empty-state" role="status">
            <div className="empty-icon-wrap">
              <Sparkles size={32} />
            </div>
            <h3 className="empty-state-title">
              {searchQuery
                ? `No Masterpieces Found for "${searchQuery}"`
                : 'No Pieces Match Your Active Filters'}
            </h3>
            <p className="empty-state-description">
              {searchQuery
                ? `We couldn't locate any handcrafted creations matching "${searchQuery}". Check your spelling or try broader artisan terms.`
                : 'No creations match your current combination of filters. Try widening your price range, toggling in-stock availability, or resetting filters.'}
            </p>

            {/* Search Suggestions Pills */}
            <div className="empty-suggestions-box">
              <span className="suggestions-label">Try searching popular artisan keywords:</span>
              <div className="suggestions-pills-row">
                {['Ceramics', 'Leather', 'Acoustics', 'Brass', 'Minimalist', 'Teapot', 'Handmade'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="suggestion-tag-chip"
                    onClick={() => {
                      if (onSearchChange) onSearchChange(term);
                      if (onSelectCategory) onSelectCategory('All');
                    }}
                  >
                    <Tag size={11} />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="empty-actions-row">
              <button
                type="button"
                className="btn-primary"
                onClick={onResetFilters}
              >
                Reset All Filters
              </button>
              {searchQuery && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClearSearch}
                >
                  Clear Keyword Search
                </button>
              )}
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

            {/* Curated Alternatives in Empty State */}
            {allProducts && allProducts.length > 0 && (
              <div className="empty-recommended-section">
                <div className="empty-recommended-header">
                  <span className="editorial-eyebrow">Curated Alternatives</span>
                  <h4 className="empty-recommended-title">Artisan Highlights You Might Love</h4>
                </div>
                <div className="products-grid empty-curated-grid">
                  {allProducts.slice(0, 4).map((item) => (
                    <ProductCard
                      key={item._id}
                      product={item}
                      onInspect={onInspectProduct}
                      viewMode="grid"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
