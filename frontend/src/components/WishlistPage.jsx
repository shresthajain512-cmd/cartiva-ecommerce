import React from 'react';
import { Heart, ShoppingBag, Trash2, Store } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const WishlistPage = ({ onExploreClick, onInspectProduct }) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleMoveToBag = (product) => {
    if (product.stockCount === 0) return;
    addToCart(product, 1);
    removeFromWishlist(product._id);
    addToast(`Moved "${product.title}" to your shopping bag`, 'success');
  };

  const handleAddAllToBag = () => {
    let addedCount = 0;
    wishlist.forEach((p) => {
      if (p.stockCount > 0) {
        addToCart(p, 1);
        addedCount++;
      }
    });
    addToast(`Added ${addedCount} items to your shopping bag`, 'success');
  };

  return (
    <div className="wishlist-page">
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
                className="btn-secondary"
                onClick={handleAddAllToBag}
              >
                <ShoppingBag size={16} />
                <span>Move In-Stock to Bag</span>
              </button>

              <button
                type="button"
                className="btn-text-danger"
                onClick={clearWishlist}
              >
                <Trash2 size={14} />
                <span>Clear Wishlist</span>
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Items List */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty-state">
            <div className="empty-heart-wrap">
              <Heart size={42} />
            </div>
            <h2>Your Wishlist is Empty</h2>
            <p>
              Explore our master catalogue of 50 handcrafted pieces and tap the heart icon to save
              items to your private curation.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={onExploreClick}
            >
              <span>Explore Master Catalogue</span>
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => {
              const isOutOfStock = item.stockCount === 0;
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;

              return (
                <div key={item._id} className="wishlist-card">
                  <div
                    className="wishlist-image-box"
                    onClick={() => onInspectProduct(item)}
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
                        removeFromWishlist(item._id);
                        addToast(`Removed from Wishlist`, 'info');
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
                      onClick={() => onInspectProduct(item)}
                    >
                      {item.title}
                    </h3>

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
