import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ToastProvider } from './context/ToastContext';

// Navigation & Structure
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { ValueProps } from './components/ValueProps';
import { VisualCategoryTiles } from './components/VisualCategoryTiles';
import { CategoryBar } from './components/CategoryBar';
import { EditorialCuratedSections } from './components/EditorialCuratedSections';

// Catalogue & Products
import { FilterSidebar } from './components/FilterSidebar';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { RecentlyViewedCatalogueSection } from './components/RecentlyViewedCatalogueSection';

// Dedicated Pages & Storefronts
import { WishlistPage } from './components/WishlistPage';
import { StorefrontPage } from './components/StorefrontPage';
import { ArtisansPage } from './components/ArtisansPage';
import { CollectionsPage } from './components/CollectionsPage';
import { OffersPage } from './components/OffersPage';
import { AccountOrdersPage } from './components/AccountOrdersPage';

// Interactive Discovery Modals
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { GiftFinderModal } from './components/GiftFinderModal';
import { FindMyStyleModal } from './components/FindMyStyleModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { CheckoutModal } from './components/CheckoutModal';
import { InfoModal } from './components/InfoModal';
import { CartDrawer } from './components/CartDrawer';

// API Services
import { fetchProducts, fetchCategories } from './services/api';

const AppContent = () => {
  const getViewFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    const validViews = ['home', 'catalogue', 'product-detail', 'wishlist', 'collections', 'artisans', 'storefront', 'offers', 'account'];
    return validViews.includes(hash) ? hash : 'home';
  };

  // Navigation View: 'home' | 'catalogue' | 'product-detail' | 'wishlist' | 'collections' | 'artisans' | 'storefront' | 'offers' | 'account'
  const [currentView, setCurrentView] = useState(getViewFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      const view = getViewFromHash();
      setCurrentView(view);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Products Data
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Selected Product & Storefront
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStoreSellerId, setSelectedStoreSellerId] = useState(null);

  useEffect(() => {
    if (currentView === 'product-detail' && !selectedProduct && allProducts.length > 0) {
      setSelectedProduct(allProducts[0]);
    }
  }, [currentView, selectedProduct, allProducts]);

  // Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [minRating, setMinRating] = useState('');
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);

  // Modals Visibility
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isGiftFinderOpen, setIsGiftFinderOpen] = useState(false);
  const [isStyleFinderOpen, setIsStyleFinderOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeInfoModalKey, setActiveInfoModalKey] = useState(null);

  // 1. Fetch Categories and Master Products once on mount
  useEffect(() => {
    let isMounted = true;
    const initializeData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          fetchCategories().catch(() => ({
            success: true,
            categories: ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Fitness', 'Other']
          })),
          fetchProducts({ limit: 100 })
        ]);

        if (isMounted) {
          if (catsRes?.categories) setCategories(catsRes.categories);
          if (prodsRes?.products) {
            setAllProducts(prodsRes.products);
          }
        }
      } catch (err) {
        console.error('Initial load error:', err);
      }
    };

    initializeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Filtered Products whenever filters, search, or sorting change
  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchProducts({
        category: selectedCategory,
        keyword: searchQuery,
        sort: sortOption,
        inStock: inStockOnly,
        seller: selectedSeller,
        minPrice,
        maxPrice,
        rating: minRating,
        discounted: discountedOnly,
        featured: sortOption === 'featured' ? undefined : undefined,
        limit: 100
      });

      if (data.success && Array.isArray(data.products)) {
        let prods = data.products;
        if (newArrivalsOnly) {
          prods = [...prods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setProducts(prods);
        if (allProducts.length === 0) {
          setAllProducts(data.products);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Catalogue fetch error:', err);
      setError(
        'Unable to connect to the Cartiva backend server. Please verify the server is running on http://localhost:5001'
      );
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    searchQuery,
    sortOption,
    inStockOnly,
    selectedSeller,
    minPrice,
    maxPrice,
    minRating,
    discountedOnly,
    newArrivalsOnly,
    allProducts.length
  ]);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  // Derive unique approved sellers list from loaded catalogue products
  const uniqueSellers = useMemo(() => {
    const map = new Map();
    allProducts.forEach((p) => {
      const sId = p.seller?._id || p.seller;
      const sName = p.storeName || p.seller?.businessName;
      if (sId && sName && !map.has(sId)) {
        map.set(sId, { _id: sId, businessName: sName });
      }
    });
    return Array.from(map.values());
  }, [allProducts]);

  // Derive counts for categories, sellers, in-stock, and discounts
  const categoryCounts = useMemo(() => {
    const counts = { All: allProducts.length };
    allProducts.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const sellerCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach((p) => {
      const sId = p.seller?._id || p.seller;
      if (sId) {
        counts[sId] = (counts[sId] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const inStockCount = useMemo(() => {
    return allProducts.filter((p) => p.stockCount > 0).length;
  }, [allProducts]);

  const discountedCount = useMemo(() => {
    return allProducts.filter((p) => p.originalPrice && p.originalPrice > p.price).length;
  }, [allProducts]);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== 'All') count++;
    if (searchQuery.trim()) count++;
    if (minPrice || maxPrice) count++;
    if (selectedSeller) count++;
    if (minRating) count++;
    if (inStockOnly) count++;
    if (discountedOnly) count++;
    if (newArrivalsOnly) count++;
    return count;
  }, [
    selectedCategory,
    searchQuery,
    minPrice,
    maxPrice,
    selectedSeller,
    minRating,
    inStockOnly,
    discountedOnly,
    newArrivalsOnly
  ]);

  // Navigation handlers
  const handleNavigate = (view) => {
    window.location.hash = view === 'home' ? '' : `#${view}`;
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (term) => {
    setSearchQuery(term);
    handleNavigate('catalogue');
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    handleNavigate('catalogue');
  };

  const handlePriceChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortOption('featured');
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSelectedSeller('');
    setMinRating('');
    setDiscountedOnly(false);
    setNewArrivalsOnly(false);
  };

  const handleInspectProduct = (prod) => {
    setSelectedProductForModal(prod);
  };

  const handleViewFullDetails = (prod) => {
    setSelectedProduct(prod);
    handleNavigate('product-detail');
  };

  const handleNavigateToStorefront = (sellerId) => {
    setSelectedStoreSellerId(sellerId);
    handleNavigate('storefront');
  };

  const handleExploreCollection = (col) => {
    handleResetFilters();
    if (col.category) {
      setSelectedCategory(col.category);
    }
    if (col.keyword) {
      setSearchQuery(col.keyword);
    }
    handleNavigate('catalogue');
  };

  const handleApplyStyleFilter = (profile) => {
    handleResetFilters();
    if (profile.categories && profile.categories.length > 0) {
      setSelectedCategory(profile.categories[0]);
    }
    if (profile.keywords && profile.keywords.length > 0) {
      setSearchQuery(profile.keywords[0]);
    }
    handleNavigate('catalogue');
  };

  return (
    <div className="cartiva-app">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onOpenGiftFinder={() => setIsGiftFinderOpen(true)}
        onOpenStyleFinder={() => setIsStyleFinderOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        allProducts={allProducts}
        onInspectProduct={handleViewFullDetails}
      />

      {/* 2. Main View Router */}
      <main id="main-content">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="view-home animate-fade-in">
            {/* Multi-Slide Magazine Hero */}
            <HeroSection
              onExploreClick={() => handleNavigate('catalogue')}
              onInspectFeatured={() => handleNavigate('catalogue')}
              onOpenGiftFinder={() => setIsGiftFinderOpen(true)}
            />

            {/* Marketplace Quality Pillars */}
            <ValueProps />

            {/* Visual Craft Category Tiles */}
            <VisualCategoryTiles onSelectCategory={handleSelectCategory} />

            {/* Category Sticky Nav */}
            <CategoryBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />

            {/* Curated Editorial Showcases: Trending, New Arrivals, Best Sellers, Recs, Newsletter */}
            <EditorialCuratedSections
              allProducts={allProducts}
              onInspectProduct={handleViewFullDetails}
              onExploreCategory={handleSelectCategory}
              onExploreCatalogue={() => handleNavigate('catalogue')}
            />
          </div>
        )}

        {/* VIEW: CATALOGUE */}
        {currentView === 'catalogue' && (
          <div className="view-catalogue animate-fade-in container" style={{ padding: '2.5rem 0 5rem' }}>
            <div className="catalogue-wrapper-layout">
              {/* Sidebar Filters */}
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categoryCounts={categoryCounts}
                sellers={uniqueSellers}
                selectedSeller={selectedSeller}
                onSelectSeller={setSelectedSeller}
                sellerCounts={sellerCounts}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={handlePriceChange}
                minRating={minRating}
                onRatingChange={setMinRating}
                inStockOnly={inStockOnly}
                onToggleInStock={setInStockOnly}
                inStockCount={inStockCount}
                discountedOnly={discountedOnly}
                onToggleDiscounted={setDiscountedOnly}
                discountedCount={discountedCount}
                newArrivalsOnly={newArrivalsOnly}
                onToggleNewArrivals={setNewArrivalsOnly}
                onResetFilters={handleResetFilters}
                activeFilterCount={activeFilterCount}
                isOpen={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                totalMatching={products.length}
              />

              {/* Main Product Grid with Controls */}
              <div className="catalogue-main-grid-column">
                <ProductGrid
                  products={products}
                  allProducts={allProducts}
                  loading={loading}
                  error={error}
                  onRetry={loadCatalogue}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClearSearch={() => setSearchQuery('')}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  sortOption={sortOption}
                  onSortChange={setSortOption}
                  inStockOnly={inStockOnly}
                  onToggleInStock={setInStockOnly}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onClearPrice={() => handlePriceChange('', '')}
                  selectedSeller={selectedSeller}
                  sellers={uniqueSellers}
                  onClearSeller={() => setSelectedSeller('')}
                  minRating={minRating}
                  onClearRating={() => setMinRating('')}
                  discountedOnly={discountedOnly}
                  onToggleDiscounted={setDiscountedOnly}
                  newArrivalsOnly={newArrivalsOnly}
                  onToggleNewArrivals={setNewArrivalsOnly}
                  onResetFilters={handleResetFilters}
                  onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
                  onInspectProduct={handleInspectProduct}
                />
              </div>
            </div>

            {/* Recently Viewed Products Discovery Section */}
            <RecentlyViewedCatalogueSection
              onInspectProduct={handleInspectProduct}
              onSelectProduct={handleViewFullDetails}
            />
          </div>
        )}

        {/* VIEW: PRODUCT DETAIL */}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={allProducts}
            onBack={() => handleNavigate('catalogue')}
            onSelectProduct={handleViewFullDetails}
            onNavigateToStorefront={handleNavigateToStorefront}
            onNavigateToCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {/* VIEW: SAVED WISHLIST */}
        {currentView === 'wishlist' && (
          <WishlistPage
            onExploreClick={() => handleNavigate('catalogue')}
            onInspectProduct={handleViewFullDetails}
          />
        )}

        {/* VIEW: CURATED COLLECTIONS */}
        {currentView === 'collections' && (
          <CollectionsPage onExploreCollection={handleExploreCollection} />
        )}

        {/* VIEW: INDEPENDENT ARTISANS DIRECTORY */}
        {currentView === 'artisans' && (
          <ArtisansPage
            onSelectArtisan={(artisanName) => {
              const matched = allProducts.find((p) => p.storeName === artisanName);
              handleNavigateToStorefront(matched?.seller?._id || matched?.seller || artisanName);
            }}
            onExploreCatalogue={() => handleNavigate('catalogue')}
          />
        )}

        {/* VIEW: SELLER STOREFRONT */}
        {currentView === 'storefront' && (
          <StorefrontPage
            sellerId={selectedStoreSellerId}
            onBack={() => handleNavigate('catalogue')}
            onInspectProduct={handleViewFullDetails}
            allProducts={allProducts}
          />
        )}

        {/* VIEW: OFFERS & DISCOUNTS */}
        {currentView === 'offers' && (
          <OffersPage
            allProducts={allProducts}
            onInspectProduct={handleViewFullDetails}
            onExploreCatalogue={() => handleNavigate('catalogue')}
          />
        )}

        {/* VIEW: MY ACCOUNT & ORDERS */}
        {currentView === 'account' && (
          <AccountOrdersPage
            onBack={() => handleNavigate('home')}
            onExploreCatalogue={() => handleNavigate('catalogue')}
          />
        )}
      </main>

      {/* 3. Global Quick View Modal */}
      {selectedProductForModal && (
        <ProductModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onViewFullDetails={handleViewFullDetails}
        />
      )}

      {/* 4. Product Comparison Side-by-Side Modal */}
      <ProductComparisonModal />

      {/* 5. Special Discovery Modals */}
      <GiftFinderModal
        isOpen={isGiftFinderOpen}
        onClose={() => setIsGiftFinderOpen(false)}
        allProducts={allProducts}
        onInspectProduct={handleViewFullDetails}
      />

      <FindMyStyleModal
        isOpen={isStyleFinderOpen}
        onClose={() => setIsStyleFinderOpen(false)}
        onApplyStyleFilter={handleApplyStyleFilter}
      />

      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        allProducts={allProducts}
        onInspectProduct={handleViewFullDetails}
      />

      {/* 6. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={() => handleNavigate('account')}
      />

      {/* 7. Footer Policy Modals */}
      <InfoModal
        infoKey={activeInfoModalKey}
        onClose={() => setActiveInfoModalKey(null)}
      />

      {/* 8. Slide-over Shopping Bag */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* 9. Global Editorial Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenInfo={(key) => setActiveInfoModalKey(key)}
        onSelectCategory={handleSelectCategory}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <ComparisonProvider>
            <RecentlyViewedProvider>
              <AppContent />
            </RecentlyViewedProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
