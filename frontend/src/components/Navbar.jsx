import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  X,
  Sparkles,
  Store,
  Menu,
  Heart,
  Scale,
  Gift,
  Compass,
  Bot,
  User,
  Tag,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { SmartSearchDropdown } from './SmartSearchDropdown';

export const Navbar = ({
  currentView = 'home',
  onNavigate,
  onSearch,
  searchQuery,
  onOpenGiftFinder,
  onOpenStyleFinder,
  onOpenAIAssistant,
  allProducts = [],
  onInspectProduct
}) => {
  const { totalItems, toggleCart } = useCart();
  const { totalWishlist } = useWishlist();
  const { totalCompared, openCompareModal } = useComparison();
  const { role } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch(localSearch);
    setSearchDropdownOpen(false);
    onNavigate('catalogue');
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  const handleSelectFromDropdown = (prod) => {
    onInspectProduct(prod);
    setSearchDropdownOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        <div className="container announcement-content">
          <div className="announcement-left-group">
            <span className="announcement-badge">
              <Sparkles size={12} />
              <span>Master Edition</span>
            </span>
            <p className="announcement-text">
              Curated Marketplace • 50 Master Pieces Direct from Verified Artisan Studios • Free Delivery over ₹2,999
            </p>
          </div>
          <div className="announcement-right-links">
            <button
              type="button"
              className="top-bar-action-link"
              onClick={onOpenGiftFinder}
            >
              <Gift size={12} />
              <span>Gift Concierge</span>
            </button>
            <button
              type="button"
              className="top-bar-action-link"
              onClick={onOpenAIAssistant}
            >
              <Bot size={12} />
              <span>AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (BRAND + SEARCH + UTILITIES) */}
      <nav className="main-nav" aria-label="Main Navigation">
        <div className="container nav-main-row">
          {/* Brand Mark & Mobile Menu Trigger */}
          <div className="nav-brand-group">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>

            <button
              type="button"
              className="brand-logo-btn"
              onClick={() => onNavigate('home')}
              aria-label="Cartiva Homepage"
            >
              <span className="brand-title">CARTIVA</span>
              <span className="brand-subtitle">Editorial Marketplace</span>
            </button>
          </div>

          {/* Smart Search Bar with Autocomplete Dropdown */}
          <div className="nav-search-container">
            <form className="nav-search-form" onSubmit={handleSearchSubmit} role="search">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search 50 handcrafted master pieces, studios, categories..."
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setSearchDropdownOpen(true);
                  }}
                  onFocus={() => setSearchDropdownOpen(true)}
                  aria-label="Search catalogue"
                />
                {localSearch && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={handleClearSearch}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            <SmartSearchDropdown
              searchQuery={localSearch}
              onSearchChange={setLocalSearch}
              onSearchSubmit={(q) => {
                onSearch(q);
                onNavigate('catalogue');
              }}
              onSelectProduct={handleSelectFromDropdown}
              products={allProducts}
              isOpen={searchDropdownOpen}
              onClose={() => setSearchDropdownOpen(false)}
            />
          </div>

          {/* Utility Action Icons */}
          <div className="nav-utility-actions">
            {/* Comparison Action */}
            <button
              type="button"
              className="icon-action-btn hide-on-mobile"
              onClick={openCompareModal}
              title="Compare Products"
              aria-label={`Product comparison with ${totalCompared} items`}
            >
              <Scale size={18} />
              {totalCompared > 0 && <span className="action-badge gold">{totalCompared}</span>}
              <span className="action-btn-tooltip">Compare</span>
            </button>

            {/* Wishlist Action */}
            <button
              type="button"
              className={`icon-action-btn ${currentView === 'wishlist' ? 'active' : ''}`}
              onClick={() => onNavigate('wishlist')}
              title="Saved Wishlist"
              aria-label={`Wishlist with ${totalWishlist} items`}
            >
              <Heart size={18} />
              {totalWishlist > 0 && <span className="action-badge">{totalWishlist}</span>}
              <span className="action-btn-tooltip">Wishlist</span>
            </button>

            {/* My Account & Orders */}
            <button
              type="button"
              className={`icon-action-btn hide-on-mobile ${currentView === 'account' ? 'active' : ''}`}
              onClick={() => onNavigate('account')}
              title="My Account & Orders"
              aria-label="My Account"
            >
              <User size={18} />
              <span className="action-btn-tooltip">Account</span>
            </button>

            {/* Shopping Bag Button */}
            <button
              type="button"
              className="cart-toggle-btn"
              onClick={toggleCart}
              aria-label={`Shopping bag containing ${totalItems} items`}
            >
              <div className="cart-icon-wrapper">
                <ShoppingBag size={18} />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </div>
              <span className="cart-btn-label">Bag</span>
            </button>
          </div>
        </div>

        {/* 3. EDITORIAL NAVIGATION ROW (DESKTOP) */}
        <div className="nav-editorial-row">
          <div className="container nav-editorial-container">
            <div className="nav-links-menu">
              <button
                type="button"
                className={`nav-menu-link ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => onNavigate('home')}
              >
                Home
              </button>

              <button
                type="button"
                className={`nav-menu-link ${currentView === 'catalogue' ? 'active' : ''}`}
                onClick={() => onNavigate('catalogue')}
              >
                Catalogue
              </button>

              <button
                type="button"
                className={`nav-menu-link ${currentView === 'collections' ? 'active' : ''}`}
                onClick={() => onNavigate('collections')}
              >
                Collections
              </button>

              <button
                type="button"
                className={`nav-menu-link ${currentView === 'artisans' ? 'active' : ''}`}
                onClick={() => onNavigate('artisans')}
              >
                <Store size={14} />
                <span>Artisans</span>
              </button>

              <button
                type="button"
                className={`nav-menu-link ${currentView === 'offers' ? 'active' : ''}`}
                onClick={() => onNavigate('offers')}
              >
                <Tag size={14} />
                <span>Offers</span>
              </button>

              {role === 'admin' && (
                <button
                  type="button"
                  className={`nav-menu-link ${currentView === 'admin' ? 'active' : ''}`}
                  onClick={() => onNavigate('admin')}
                >
                  <ShieldCheck size={14} />
                  <span>Admin Console</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. MOBILE SLIDE-OUT DRAWER NAVIGATION */}
        {mobileMenuOpen && (
          <>
            <div
              className="mobile-nav-backdrop"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
              <div className="mobile-nav-header">
                <div className="mobile-nav-brand">
                  <span className="brand-title">CARTIVA</span>
                  <span className="brand-subtitle">Editorial Marketplace</span>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-nav-links">
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'home' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('home');
                    setMobileMenuOpen(false);
                  }}
                >
                  Home
                </button>
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'catalogue' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('catalogue');
                    setMobileMenuOpen(false);
                  }}
                >
                  Catalogue (50 Master Pieces)
                </button>
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'collections' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('collections');
                    setMobileMenuOpen(false);
                  }}
                >
                  Curated Collections
                </button>
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'artisans' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('artisans');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Store size={15} />
                  <span>Independent Artisans</span>
                </button>
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'offers' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('offers');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Tag size={15} />
                  <span>Special Offers & Promotions</span>
                </button>
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'wishlist' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('wishlist');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Heart size={15} />
                  <span>Saved Wishlist ({totalWishlist})</span>
                </button>
                <button
                  type="button"
                  className="mobile-link"
                  onClick={() => {
                    openCompareModal();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Scale size={15} />
                  <span>Compare Products ({totalCompared})</span>
                </button>
                <button
                  type="button"
                  className={`mobile-link ${currentView === 'account' ? 'active' : ''}`}
                  onClick={() => {
                    onNavigate('account');
                    setMobileMenuOpen(false);
                  }}
                >
                  <User size={15} />
                  <span>My Account & Orders</span>
                </button>

                {role === 'admin' && (
                  <button
                    type="button"
                    className={`mobile-link ${currentView === 'admin' ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>Admin Console</span>
                  </button>
                )}
              </div>

              <div className="mobile-special-actions">
                <button
                  type="button"
                  className="mobile-special-btn"
                  onClick={() => {
                    onOpenGiftFinder();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Gift size={16} />
                  <span>Gift Finder Concierge</span>
                </button>
                <button
                  type="button"
                  className="mobile-special-btn"
                  onClick={() => {
                    onOpenStyleFinder();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Compass size={16} />
                  <span>Find My Aesthetic</span>
                </button>
                <button
                  type="button"
                  className="mobile-special-btn"
                  onClick={() => {
                    onOpenAIAssistant();
                    setMobileMenuOpen(false);
                  }}
                >
                  <Bot size={16} />
                  <span>AI Shopping Concierge</span>
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};
