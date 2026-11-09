import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Package,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Store,
  Truck,
  RefreshCw,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrdersApi, fetchSellerOrdersApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AccountOrdersPage = ({ onBack, onExploreCatalogue }) => {
  const { user, token, role, loginAsDemo, logout, ensureAuthenticatedSession } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'seller-portal' | 'addresses' | 'profile'
  const [customerOrders, setCustomerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch Customer Orders
  const loadCustomerOrders = useCallback(async () => {
    setLoadingOrders(true);
    setErrorMsg('');
    try {
      let activeToken = token;
      if (!activeToken && import.meta.env.DEV) {
        const demoRes = await loginAsDemo('customer').catch(() => null);
        activeToken = demoRes?.token || null;
      }

      if (activeToken) {
        const res = await fetchMyOrdersApi(activeToken);
        if (res.success && Array.isArray(res.orders)) {
          setCustomerOrders(res.orders);
        }
      }
    } catch (err) {
      setErrorMsg('Unable to retrieve recent orders from Cartiva server.');
    } finally {
      setLoadingOrders(false);
    }
  }, [token, ensureAuthenticatedSession]);

  // 2. Fetch Seller Orders (Isolated to seller's products only)
  const loadSellerOrders = useCallback(async () => {
    setLoadingOrders(true);
    setErrorMsg('');
    try {
      let activeToken = token;
      // If current user is not a seller, allow dev demo switching in development only
      if (!activeToken || role !== 'seller') {
        if (import.meta.env.DEV) {
          const demoRes = await loginAsDemo('seller');
          activeToken = demoRes?.token;
        } else {
          setErrorMsg('Artisan studio seller account required. Please log in with approved seller credentials.');
          setLoadingOrders(false);
          return;
        }
      }

      if (activeToken) {
        const res = await fetchSellerOrdersApi(activeToken);
        if (res.success && Array.isArray(res.orders)) {
          setSellerOrders(res.orders);
        }
      }
    } catch (err) {
      setErrorMsg('Unable to retrieve studio orders. Ensure your seller account is approved.');
    } finally {
      setLoadingOrders(false);
    }
  }, [token, role, loginAsDemo]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadCustomerOrders();
    } else if (activeTab === 'seller-portal') {
      loadSellerOrders();
    }
  }, [activeTab, loadCustomerOrders, loadSellerOrders]);

  const toggleExpandOrder = (id) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const handleSwitchRole = async (targetRole) => {
    try {
      await loginAsDemo(targetRole);
      addToast(`Switched account to verified ${targetRole.toUpperCase()}`, 'success');
      if (targetRole === 'seller') {
        setActiveTab('seller-portal');
      } else {
        setActiveTab('orders');
      }
    } catch (err) {
      addToast(`Failed to switch role: ${err.message}`, 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="account-orders-page">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div className="account-nav-bar">
          <button type="button" className="breadcrumb-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Shopping</span>
          </button>
        </div>

        {/* Layout */}
        <div className="account-layout">
          {/* Left Navigation Sidebar */}
          <aside className="account-sidebar">
            <div className="account-profile-summary">
              <div className="account-avatar">
                <User size={24} />
              </div>
              <div className="account-profile-text">
                <h3 className="account-user-name">
                  {user?.name || 'Patron of Craft'}
                </h3>
                <span className="account-membership">
                  {role === 'seller'
                    ? `Artisan Studio • ${user?.businessName || 'Verified'}`
                    : role === 'admin'
                    ? 'Cartiva Curator Admin'
                    : 'Cartiva Collector Member'}
                </span>
              </div>
            </div>

            <nav className="account-tabs-list">
              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={17} />
                <span>My Acquisitions</span>
                {customerOrders.length > 0 && (
                  <span className="tab-badge">{customerOrders.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'seller-portal' ? 'active' : ''}`}
                onClick={() => setActiveTab('seller-portal')}
              >
                <Store size={17} />
                <span>Artisan Studio Orders</span>
                <span className="role-tag-mini">Seller</span>
              </button>

              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={17} />
                <span>Shipping Destinations</span>
              </button>

              <button
                type="button"
                className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <ShieldCheck size={17} />
                <span>Account & Roles</span>
              </button>
            </nav>

            {/* Quick Demo Role Switcher Box for Development Testing Only */}
            {import.meta.env.DEV && (
              <div className="demo-role-switcher-card">
                <div className="switcher-header">
                  <Sparkles size={14} />
                  <span>Test Role Persona (Dev Only)</span>
                </div>
                <p className="switcher-sub">
                  Switch identity to test customer checkout, seller order isolation, or admin views.
                </p>
                <div className="switcher-btns-col">
                  <button
                    type="button"
                    className={`btn-persona ${role === 'customer' ? 'active' : ''}`}
                    onClick={() => handleSwitchRole('customer')}
                  >
                    Patron (Customer)
                  </button>
                  <button
                    type="button"
                    className={`btn-persona ${role === 'seller' ? 'active' : ''}`}
                    onClick={() => handleSwitchRole('seller')}
                  >
                    Kanso Sound (Seller)
                  </button>
                  <button
                    type="button"
                    className={`btn-persona ${role === 'admin' ? 'active' : ''}`}
                    onClick={() => handleSwitchRole('admin')}
                  >
                    Marketplace Admin
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Right Main Content Panel */}
          <main className="account-main-panel">
            {/* TAB 1: CUSTOMER ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="account-orders-view">
                <div className="panel-header">
                  <div className="header-text-group">
                    <h2 className="panel-title">Your Order History</h2>
                    <p className="panel-subtitle">
                      Review studio provenances, monitor artisan packaging, and track insured couriers.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-refresh-orders"
                    onClick={loadCustomerOrders}
                    title="Refresh orders"
                  >
                    <RefreshCw size={15} className={loadingOrders ? 'spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {loadingOrders && customerOrders.length === 0 ? (
                  <div className="orders-loading-state">
                    <div className="cartiva-spinner" />
                    <span>Retrieving verified artisan orders from Cartiva ledger...</span>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="orders-empty-state">
                    <Package size={48} className="empty-pkg-icon" />
                    <h3>No Master Acquisitions Yet</h3>
                    <p>
                      Your private collection is waiting. Explore 50 handcrafted master pieces
                      curated directly from our verified artisan studios.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={onExploreCatalogue}
                    >
                      Explore Curated Catalogue
                    </button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {customerOrders.map((order) => {
                      const isExpanded = expandedOrderId === order._id;
                      const orderRef = order.orderReference || `CTV-${order._id?.slice(-6)}`;
                      const totalPieces = order.orderItems?.reduce(
                        (acc, it) => acc + it.quantity,
                        0
                      ) || 0;

                      return (
                        <div key={order._id} className="order-history-card">
                          <div className="order-card-header">
                            <div className="order-id-date">
                              <span className="order-id">{orderRef}</span>
                              <span className="order-date">Placed on {formatDate(order.createdAt)}</span>
                            </div>
                            <div className="order-status-badge">
                              <CheckCircle2 size={14} />
                              <span>{order.orderStatus || 'Placed'}</span>
                            </div>
                          </div>

                          {/* Multi-Vendor Studio Badges */}
                          {order.sellerGroups && order.sellerGroups.length > 0 && (
                            <div className="order-seller-groups-strip">
                              <span className="studios-label">Artisan Studios:</span>
                              <div className="studio-pills-row">
                                {order.sellerGroups.map((g, idx) => (
                                  <span key={idx} className="studio-pill">
                                    <Store size={12} />
                                    <span>{g.storeName}</span>
                                    <span className="subref-code">({g.subOrderReference})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Items Preview */}
                          <div className="order-items-list">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="order-item-row">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="order-item-thumb"
                                />
                                <div className="order-item-info">
                                  <span className="order-item-store">
                                    {item.storeName || 'Artisan Studio Direct'}
                                  </span>
                                  <h4 className="order-item-title">{item.title}</h4>
                                  <div className="order-item-quant">
                                    <span>Qty: {item.quantity}</span>
                                    <span>•</span>
                                    <span>₹{Number(item.price).toLocaleString('en-IN')} each</span>
                                  </div>
                                </div>
                                <div className="order-item-price">
                                  <span>
                                    ₹{Number((item.itemTotal || item.price * item.quantity)).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Expandable Order Details Panel */}
                          {isExpanded && (
                            <div className="order-expanded-details">
                              <div className="expanded-section">
                                <h4>Insured Delivery Destination:</h4>
                                <p>
                                  {order.shippingAddress?.fullName}<br />
                                  {order.shippingAddress?.street}, {order.shippingAddress?.city},<br />
                                  {order.shippingAddress?.state} – {order.shippingAddress?.postalCode}<br />
                                  Phone: {order.shippingAddress?.phone}
                                </p>
                              </div>

                              <div className="expanded-section">
                                <h4>Studio Allocation Breakdown:</h4>
                                {order.sellerGroups?.map((g, idx) => (
                                  <div key={idx} className="alloc-group-box">
                                    <div className="alloc-header">
                                      <strong>{g.storeName}</strong>
                                      <span>Ref: {g.subOrderReference}</span>
                                      <span className="status-tag">{g.status}</span>
                                    </div>
                                    <div className="alloc-math">
                                      <span>Items Subtotal: ₹{Number(g.subtotal).toLocaleString('en-IN')}</span>
                                      <span>• Courier: {g.shippingFee === 0 ? 'Complimentary' : `₹${g.shippingFee}`}</span>
                                      <span>• Total: ₹{Number(g.total).toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Card Footer */}
                          <div className="order-card-footer">
                            <button
                              type="button"
                              className="btn-toggle-details"
                              onClick={() => toggleExpandOrder(order._id)}
                            >
                              <span>{isExpanded ? 'Hide Allocation Details' : 'View Allocation Details'}</span>
                              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            <div className="order-total-group">
                              <span className="total-label">Grand Total:</span>
                              <span className="total-val">
                                ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SELLER ORDER ISOLATION PORTAL */}
            {activeTab === 'seller-portal' && (
              <div className="account-seller-orders-view">
                <div className="panel-header">
                  <div className="header-text-group">
                    <h2 className="panel-title">Artisan Studio Order Allocation</h2>
                    <p className="panel-subtitle">
                      Multi-Vendor Isolation: Displays exclusively orders containing your studio's handcrafted pieces.
                      Other sellers' products and financials are completely redacted.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-refresh-orders"
                    onClick={loadSellerOrders}
                  >
                    <RefreshCw size={15} className={loadingOrders ? 'spin' : ''} />
                    <span>Refresh Studio Orders</span>
                  </button>
                </div>

                <div className="seller-isolation-banner">
                  <ShieldCheck size={18} />
                  <span>
                    <strong>Multi-Vendor Isolation Active:</strong> Viewing strictly as studio partner{' '}
                    <strong>{user?.businessName || 'Kanso Sound & Acoustics'}</strong>.
                  </span>
                </div>

                {loadingOrders && sellerOrders.length === 0 ? (
                  <div className="orders-loading-state">
                    <div className="cartiva-spinner" />
                    <span>Loading studio dispatch allocations...</span>
                  </div>
                ) : sellerOrders.length === 0 ? (
                  <div className="orders-empty-state">
                    <Store size={48} className="empty-pkg-icon" />
                    <h3>No Incoming Studio Orders</h3>
                    <p>
                      As patrons check out multi-vendor bags, your studio pieces will automatically
                      appear here with dedicated sub-order dispatch codes.
                    </p>
                  </div>
                ) : (
                  <div className="seller-orders-list">
                    {sellerOrders.map((sOrder) => (
                      <div key={sOrder._id} className="seller-order-card">
                        <div className="seller-order-header">
                          <div className="subref-group">
                            <span className="subref-tag">Studio Sub-Order</span>
                            <span className="subref-val">{sOrder.subOrderReference}</span>
                            <span className="parent-ref">Parent: {sOrder.orderReference}</span>
                          </div>
                          <span className="status-pill-seller">{sOrder.orderStatus}</span>
                        </div>

                        {/* Studio Items Only */}
                        <div className="seller-items-table">
                          {sOrder.items?.map((it, idx) => (
                            <div key={idx} className="seller-item-row">
                              <img src={it.imageUrl} alt={it.title} className="item-thumb" />
                              <div className="item-name-qty">
                                <span className="item-title">{it.title}</span>
                                <span className="item-qty">Quantity to Dispatch: <strong>{it.quantity}</strong></span>
                              </div>
                              <span className="item-price">₹{Number(it.itemTotal).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>

                        {/* Customer Shipping Destination for Dispatch */}
                        <div className="seller-dispatch-info">
                          <div className="dispatch-dest">
                            <Truck size={15} />
                            <span>
                              <strong>Ship to:</strong> {sOrder.shippingAddress?.fullName}, {sOrder.shippingAddress?.city},{' '}
                              {sOrder.shippingAddress?.state} ({sOrder.shippingAddress?.postalCode})
                            </span>
                          </div>
                          <div className="seller-payout-total">
                            <span>Studio Allocation:</span>
                            <strong>₹{Number(sOrder.total || 0).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="account-addresses-view">
                <div className="panel-header">
                  <h2 className="panel-title">Saved Shipping Destinations</h2>
                  <p className="panel-subtitle">Primary destinations for your handcrafted deliveries.</p>
                </div>

                <div className="addresses-grid">
                  <div className="address-card default">
                    <span className="default-pill">Default Delivery Address</span>
                    <h4 className="addr-name">{user?.name || 'Editorial Resident'}</h4>
                    <p className="addr-text">
                      Flat 402, Lotus Courtyard, Indiranagar 100ft Road<br />
                      Bengaluru, Karnataka – 560038<br />
                      Phone: +91 98765 43210
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROFILE & ROLE MANAGEMENT */}
            {activeTab === 'profile' && (
              <div className="account-profile-view">
                <div className="panel-header">
                  <h2 className="panel-title">Account & Security</h2>
                  <p className="panel-subtitle">Manage your personal credentials, studio identity, and active tokens.</p>
                </div>

                <div className="profile-details-card">
                  <div className="profile-row">
                    <span className="row-label">Full Name:</span>
                    <span className="row-val">{user?.name || 'Patron of Craft'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="row-label">Email:</span>
                    <span className="row-val">{user?.email || 'Not signed in'}</span>
                  </div>
                  <div className="profile-row">
                    <span className="row-label">Current Role:</span>
                    <span className="row-val capitalize">{role}</span>
                  </div>
                  {user?.businessName && (
                    <div className="profile-row">
                      <span className="row-label">Studio Business:</span>
                      <span className="row-val">{user.businessName}</span>
                    </div>
                  )}
                  <div className="profile-row">
                    <span className="row-label">JWT Authentication:</span>
                    <span className="row-val text-success">Active & Cryptographically Verified</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};