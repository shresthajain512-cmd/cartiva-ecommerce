import React from 'react';
import { Heart, ShoppingBag, Trash2, Store, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const WishlistPage = ({ onExploreClick, onInspectProduct }) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleMoveToBag = (product) => {
    const maxStock = typeof product.stockCount === 'number' ? Math.max(0, product.stockCount) : 999;
    if (maxStock === 0) {
      addToast(`"${product.title}" is currently sold out and cannot be moved to bag`, 'warning');
      return;
    }

    addToCart(product, 1);
    removeFromWishlist(product._id || product.id);
    addToast(`Moved "${product.title}" to your shopping bag`, 'success');
  };

  const handleAddAllToBag = () => {
    let addedCount = 0;
    wishlist.forEach((p) => {
      const maxStock = typeof p.stockCount === 'number' ? Math.max(0, p.stockCount) : 999;
      if (maxStock > 0) {
        addToCart(p, 1);
        removeFromWishlist(p._id || p.id);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      addToast(`Moved ${addedCount} in-stock creations to your shopping bag`, 'success');
    } else {
      addToast('No in-stock items available to move', 'info');
    }
  };

  return (
    <div className="wishlist-page animate-fade-in">
      <div className="container">
        {/* Page Header */}
        <div className="wishlist-header">
          <div className="wishlist-title-group">
            <span className="wishlist-eyebrow">Personal Sanctuary</span>
            <h1 className="wishlist-title">Saved Curations ({wishlist.length})</h1>
            <p className="wishlist-subtitle">
              Your private collection of desired artisanal pieces and limited studio runs.
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="wishlist-header-actions">
              <button
                type="button"
                className="btn-secondary btn-move-all-bag"
                onClick={handleAddAllToBag}
              >
                <ShoppingBag size={16} />
                <span>Move In-Stock to Bag</span>
              </button>

              <button
                type="button"
                className="btn-text-danger"
                onClick={() => {
                  clearWishlist();
                  addToast('Cleared all items from your wishlist', 'info');
                }}
              >
                <Trash2 size={14} />
                <span>Clear Wishlist</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items List */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty-state animate-fade-in">
            <div className="empty-heart-wrap">
              <Heart size={44} strokeWidth={1.5} color="var(--color-gold)" />
            </div>
            <h2>Your Saved Sanctuary is Empty</h2>
            <p>
              Explore our master catalogue of 50 handcrafted pieces and tap the heart icon to save
              items to your private curation.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={onExploreClick}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem' }}
            >
              <span>Explore Master Catalogue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const maxStock = typeof item.stockCount === 'number' ? Math.max(0, item.stockCount) : 999;
              const isOutOfStock = maxStock === 0;
              const isLowStock = maxStock > 0 && maxStock <= 5;
              const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.price);

              return (
                <div key={item._id || item.id} className="wishlist-card">
                  <div
                    className="wishlist-image-box"
                    onClick={() => onInspectProduct && onInspectProduct(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${item.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && onInspectProduct) onInspectProduct(item);
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item._id || item.id);
                        addToast(`Removed "${item.title}" from Wishlist`, 'info');
                      }}
                      title="Remove from saved items"
                      aria-label={`Remove ${item.title}`}
                    >
                      ×
                    </button>
                    <span className="wishlist-cat-badge">{item.category}</span>
                  </div>

                  <div className="wishlist-body">
                    <div className="wishlist-store-row">
                      <Store size={13} />
                      <span>{item.storeName || item.seller?.businessName || 'Verified Studio'}</span>
                    </div>

                    <h3
                      className="wishlist-prod-title"
                      onClick={() => onInspectProduct && onInspectProduct(item)}
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Stock Status Pill */}
                    <div className="wishlist-stock-pill-row" style={{ marginBottom: '0.65rem' }}>
                      {isOutOfStock ? (
                        <span className="stock-status-pill out-of-stock" style={{ margin: 0, padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="stock-status-pill low-stock" style={{ margin: 0, padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                          Only {maxStock} left
                        </span>
                      ) : (
                        <span className="stock-status-pill in-stock" style={{ margin: 0, padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                          In Stock ({maxStock})
                        </span>
                      )}
                    </div>

                    <div className="wishlist-price-row">
                      <span className="wishlist-price">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                      {hasDiscount && (
                        <span className="wishlist-original">
                          ₹{Number(item.originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="wishlist-actions-row">
                      <button
                        type="button"
                        className={`btn-primary btn-move-bag ${isOutOfStock ? 'disabled' : ''}`}
                        onClick={() => handleMoveToBag(item)}
                        disabled={isOutOfStock}
                        aria-label={isOutOfStock ? `${item.title} is sold out` : `Move ${item.title} to shopping bag`}
                      >
                        <ShoppingBag size={15} />
                        <span>{isOutOfStock ? 'Sold Out' : 'Move to Bag'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
