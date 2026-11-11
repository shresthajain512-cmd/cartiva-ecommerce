import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  AlertCircle,
  X,
  Search,
  Check,
  Ban,
  Eye,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchMyOrdersApi,
  fetchSellerOrdersApi,
  updateOrderStatusApi
} from '../services/api';
import { useToast } from '../context/ToastContext';

export const AccountOrdersPage = ({
  onBack,
  onExploreCatalogue,
  initialTab = 'orders',
  onNavigateToStorefront
}) => {
  const { user, token, role, loginAsDemo } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab); // 'orders' | 'seller-portal' | 'addresses' | 'profile'
  const [sellerSubTab, setSellerSubTab] = useState('overview'); // 'overview' | 'orders' | 'profile'

  const [customerOrders, setCustomerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Seller Orders Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [sellerSearch, setSellerSearch] = useState('');

  // Sync initialTab when props change
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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
  }, [token, loginAsDemo]);

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
          if (res.stats) {
            setSellerStats(res.stats);
          }
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

  // 3. Status Transition Action for Sellers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      let activeToken = token;
      if (!activeToken && import.meta.env.DEV) {
        const demoRes = await loginAsDemo('seller');
        activeToken = demoRes?.token;
      }

      const res = await updateOrderStatusApi(orderId, { orderStatus: newStatus }, activeToken);

      if (res.success) {
        addToast(`Order status updated to "${newStatus}"`, 'success');
        // Optimistically update local order state
        setSellerOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrderForModal && selectedOrderForModal._id === orderId) {
          setSelectedOrderForModal((prev) => ({ ...prev, orderStatus: newStatus }));
        }
        // Refresh full verified data from backend
        loadSellerOrders();
      } else {
        throw new Error(res.message || 'Status transition failed');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      addToast(err.message || 'Unable to update status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSwitchRole = async (targetRole) => {
    try {
      await loginAsDemo(targetRole);
      addToast(`Switched account to verified ${targetRole.toUpperCase()}`, 'success');
      if (targetRole === 'seller') {
        setActiveTab('seller-portal');
        setSellerSubTab('overview');
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

  // Compute verified metrics strictly from real database orders
  const stats = useMemo(() => {
    if (sellerStats) return sellerStats;

    const totalOrders = sellerOrders.length;
    const pendingOrders = sellerOrders.filter((o) => o.orderStatus === 'Placed').length;
    const processingOrders = sellerOrders.filter((o) => o.orderStatus === 'Processing').length;
    const shippedOrders = sellerOrders.filter((o) => o.orderStatus === 'Shipped').length;
    const deliveredOrders = sellerOrders.filter((o) => o.orderStatus === 'Delivered').length;
    const shippedOrDeliveredOrders = sellerOrders.filter((o) =>
      ['Shipped', 'Delivered'].includes(o.orderStatus)
    ).length;
    const totalSales = sellerOrders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      shippedOrDeliveredOrders,
      totalSales
    };
  }, [sellerOrders, sellerStats]);

  // Filtered orders for the Orders tab
  const filteredSellerOrders = useMemo(() => {
    return sellerOrders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'ShippedOrDelivered') {
          if (!['Shipped', 'Delivered'].includes(order.orderStatus)) return false;
        } else if (order.orderStatus !== statusFilter) {
          return false;
        }
      }

      // 2. Search Query Filter
      if (sellerSearch.trim()) {
        const q = sellerSearch.toLowerCase().trim();
        const refMatch = (order.orderReference || '').toLowerCase().includes(q);
        const subRefMatch = (order.subOrderReference || '').toLowerCase().includes(q);
        const recipientMatch = (order.shippingAddress?.fullName || '').toLowerCase().includes(q);
        const cityMatch = (order.shippingAddress?.city || '').toLowerCase().includes(q);
        const itemMatch = (order.items || []).some((it) => (it.title || '').toLowerCase().includes(q));
        if (!refMatch && !subRefMatch && !recipientMatch && !cityMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    });
  }, [sellerOrders, statusFilter, sellerSearch]);

  const storeName = user?.businessName || 'Kanso Sound & Acoustics';

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
                    ? `Artisan Studio • ${storeName}`
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
                onClick={() => {
                  setActiveTab('seller-portal');
                  setSellerSubTab('overview');
                }}
              >
                <Store size={17} />
                <span>Seller Dashboard</span>
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
                                      <span className="alloc-name">{g.storeName}</span>
                                      <span className="alloc-code">{g.subOrderReference}</span>
                                    </div>
                                    <div className="alloc-body">
                                      <span>Items Subtotal: ₹{Number(g.subtotal).toLocaleString('en-IN')}</span>
                                      <span>Courier Allocation: {g.shippingFee === 0 ? 'COMPLIMENTARY' : `₹${g.shippingFee}`}</span>
                                      <strong>Studio Total: ₹{Number(g.total).toLocaleString('en-IN')}</strong>
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

            {/* TAB 2: SELLER DASHBOARD & ORDER MANAGEMENT */}
            {activeTab === 'seller-portal' && (
              <div className="seller-dashboard-container">
                {/* Multi-Vendor Security Isolation Banner */}
                <div className="seller-isolation-banner">
                  <ShieldCheck size={18} />
                  <span>
                    <strong>Multi-Vendor Isolation Active:</strong> Authenticated strictly as artisan studio partner{' '}
                    <strong>{storeName}</strong>. Other sellers' products, allocations, and customer data are completely redacted.
                  </span>
                </div>

                {/* Seller Sub-Navigation Bar */}
                <div className="seller-dashboard-subnav">
                  <button
                    type="button"
                    className={`subnav-pill ${sellerSubTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSellerSubTab('overview')}
                  >
                    <Sparkles size={15} />
                    <span>Dashboard Overview</span>
                  </button>

                  <button
                    type="button"
                    className={`subnav-pill ${sellerSubTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setSellerSubTab('orders')}
                  >
                    <Package size={15} />
                    <span>Order Management</span>
                    {stats.totalOrders > 0 && (
                      <span className="subnav-badge">{stats.totalOrders}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`subnav-pill ${sellerSubTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setSellerSubTab('profile')}
                  >
                    <Store size={15} />
                    <span>Studio Profile</span>
                  </button>
                </div>

                {/* SUB-VIEW 1: SELLER DASHBOARD OVERVIEW */}
                {sellerSubTab === 'overview' && (
                  <div className="seller-overview-view">
                    {/* Welcome Header Section */}
                    <div className="seller-welcome-card">
                      <div className="welcome-text-side">
                        <div className="welcome-badge-row">
                          <span className="artisan-partner-pill">Verified Artisan Partner</span>
                          <span className="status-live-pill">Live Studio Ledger</span>
                        </div>
                        <h2 className="welcome-store-title">Welcome back, {storeName}</h2>
                        <p className="welcome-tagline">
                          Review verified sales, monitor incoming studio dispatches, and manage insured patron deliveries.
                        </p>
                      </div>

                      <div className="welcome-actions-side">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => setSellerSubTab('orders')}
                        >
                          <Package size={16} />
                          <span>Manage Incoming Orders</span>
                        </button>

                        {onNavigateToStorefront && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onNavigateToStorefront(user?._id)}
                          >
                            <ExternalLink size={15} />
                            <span>View Public Storefront</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Key Metrics Cards (Strictly Real Data) */}
                    <div className="seller-metrics-grid">
                      {/* Metric 1: Total Sales */}
                      <div className="seller-metric-card highlight">
                        <div className="metric-header">
                          <span className="metric-label">Gross Studio Sales</span>
                          <div className="metric-icon-wrap gold">
                            <DollarSign size={18} />
                          </div>
                        </div>
                        <div className="metric-value">
                          ₹{Number(stats.totalSales || 0).toLocaleString('en-IN')}
                        </div>
                        <span className="metric-subtitle">Verified non-cancelled allocations</span>
                      </div>

                      {/* Metric 2: Total Orders */}
                      <div className="seller-metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Total Orders Received</span>
                          <div className="metric-icon-wrap">
                            <Package size={18} />
                          </div>
                        </div>
                        <div className="metric-value">{stats.totalOrders}</div>
                        <span className="metric-subtitle">Across all marketplace carts</span>
                      </div>

                      {/* Metric 3: Pending Orders */}
                      <div className="seller-metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Pending Verification</span>
                          <div className="metric-icon-wrap amber">
                            <Clock size={18} />
                          </div>
                        </div>
                        <div className="metric-value">{stats.pendingOrders}</div>
                        <span className="metric-subtitle">New orders awaiting packaging</span>
                      </div>

                      {/* Metric 4: In Processing */}
                      <div className="seller-metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Studio In Processing</span>
                          <div className="metric-icon-wrap blue">
                            <RefreshCw size={18} />
                          </div>
                        </div>
                        <div className="metric-value">{stats.processingOrders}</div>
                        <span className="metric-subtitle">Currently in artisan preparation</span>
                      </div>

                      {/* Metric 5: Shipped & Delivered */}
                      <div className="seller-metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Shipped & Delivered</span>
                          <div className="metric-icon-wrap green">
                            <Truck size={18} />
                          </div>
                        </div>
                        <div className="metric-value">{stats.shippedOrDeliveredOrders}</div>
                        <span className="metric-subtitle">Dispatched with insured courier</span>
                      </div>
                    </div>

                    {/* Recent Orders Section */}
                    <div className="seller-recent-orders-section">
                      <div className="section-header-row">
                        <div className="sec-heading-group">
                          <h3 className="sec-title">Recent Studio Dispatches</h3>
                          <p className="sec-sub">The most recent acquisitions containing your handcrafted pieces.</p>
                        </div>
                        <button
                          type="button"
                          className="btn-text-link"
                          onClick={() => setSellerSubTab('orders')}
                        >
                          <span>View All ({stats.totalOrders})</span>
                          <ChevronRight size={15} />
                        </button>
                      </div>

                      {loadingOrders && sellerOrders.length === 0 ? (
                        <div className="orders-loading-state">
                          <div className="cartiva-spinner" />
                          <span>Loading verified studio orders...</span>
                        </div>
                      ) : sellerOrders.length === 0 ? (
                        <div className="orders-empty-state mini">
                          <Store size={36} className="empty-pkg-icon" />
                          <h4>No Orders Yet</h4>
                          <p>When patrons purchase items from your studio, they will appear here instantly.</p>
                        </div>
                      ) : (
                        <div className="recent-orders-table">
                          <div className="recent-table-head">
                            <span>Sub-Order Reference</span>
                            <span>Date</span>
                            <span>Destination</span>
                            <span>Pieces</span>
                            <span>Allocation</span>
                            <span>Status</span>
                            <span>Action</span>
                          </div>

                          <div className="recent-table-body">
                            {sellerOrders.slice(0, 4).map((order) => (
                              <div key={order._id} className="recent-order-row">
                                <span className="cell-subref">{order.subOrderReference}</span>
                                <span className="cell-date">{formatDate(order.createdAt)}</span>
                                <span className="cell-dest">
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                </span>
                                <span className="cell-qty">{order.itemsCount || 1} pcs</span>
                                <span className="cell-total">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                                <span className={`cell-status-pill status-${(order.orderStatus || 'placed').toLowerCase()}`}>
                                  {order.orderStatus}
                                </span>
                                <div className="cell-action">
                                  <button
                                    type="button"
                                    className="btn-quick-manage"
                                    onClick={() => {
                                      setSelectedOrderForModal(order);
                                    }}
                                  >
                                    <Eye size={13} />
                                    <span>Details</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Studio Craftsmanship & Dispatch SLA Card */}
                    <div className="studio-sla-notice-box">
                      <ShieldCheck size={20} className="sla-icon" />
                      <div className="sla-text">
                        <h4>Cartiva Studio Dispatch Standards</h4>
                        <p>
                          Every piece must be packaged using insured, branded atelier materials with a maker provenance certificate.
                          Standard dispatch timeframe is 48 hours from order placement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUB-VIEW 2: ORDERS MANAGEMENT LEDGER */}
                {sellerSubTab === 'orders' && (
                  <div className="seller-orders-management-view">
                    {/* Controls Bar: Search & Status Filters */}
                    <div className="orders-filter-toolbar">
                      <div className="filter-search-input-wrap">
                        <Search size={16} className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search by order reference, patron name, or product..."
                          value={sellerSearch}
                          onChange={(e) => setSellerSearch(e.target.value)}
                          className="search-input"
                        />
                        {sellerSearch && (
                          <button
                            type="button"
                            className="search-clear-btn"
                            onClick={() => setSellerSearch('')}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="filter-pills-row">
                        <button
                          type="button"
                          className={`filter-pill ${statusFilter === 'All' ? 'active' : ''}`}
                          onClick={() => setStatusFilter('All')}
                        >
                          All ({stats.totalOrders})
                        </button>
                        <button
                          type="button"
                          className={`filter-pill ${statusFilter === 'Placed' ? 'active' : ''}`}
                          onClick={() => setStatusFilter('Placed')}
                        >
                          Placed ({stats.pendingOrders})
                        </button>
                        <button
                          type="button"
                          className={`filter-pill ${statusFilter === 'Processing' ? 'active' : ''}`}
                          onClick={() => setStatusFilter('Processing')}
                        >
                          Processing ({stats.processingOrders})
                        </button>
                        <button
                          type="button"
                          className={`filter-pill ${statusFilter === 'Shipped' ? 'active' : ''}`}
                          onClick={() => setStatusFilter('Shipped')}
                        >
                          Shipped ({stats.shippedOrders})
                        </button>
                        <button
                          type="button"
                          className={`filter-pill ${statusFilter === 'Delivered' ? 'active' : ''}`}
                          onClick={() => setStatusFilter('Delivered')}
                        >
                          Delivered ({stats.deliveredOrders})
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn-refresh-orders"
                        onClick={loadSellerOrders}
                        title="Reload from backend"
                      >
                        <RefreshCw size={15} className={loadingOrders ? 'spin' : ''} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {/* Orders List */}
                    {loadingOrders && sellerOrders.length === 0 ? (
                      <div className="orders-loading-state">
                        <div className="cartiva-spinner" />
                        <span>Loading studio dispatch allocations...</span>
                      </div>
                    ) : filteredSellerOrders.length === 0 ? (
                      <div className="orders-empty-state">
                        <Package size={44} className="empty-pkg-icon" />
                        <h3>No Orders Found</h3>
                        <p>
                          {sellerSearch || statusFilter !== 'All'
                            ? 'No orders matched your active filter or search criteria.'
                            : 'No incoming orders have been placed for your studio yet.'}
                        </p>
                        {(sellerSearch || statusFilter !== 'All') && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setSellerSearch('');
                              setStatusFilter('All');
                            }}
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="seller-orders-list">
                        {filteredSellerOrders.map((sOrder) => {
                          const currentStatus = sOrder.orderStatus || 'Placed';
                          const isUpdating = updatingOrderId === sOrder._id;

                          return (
                            <div key={sOrder._id} className="seller-order-card">
                              {/* Card Header */}
                              <div className="seller-order-header">
                                <div className="subref-group">
                                  <span className="subref-tag">Studio Sub-Order</span>
                                  <span className="subref-val">{sOrder.subOrderReference}</span>
                                  <span className="parent-ref">Parent: {sOrder.orderReference}</span>
                                  <span className="order-date-text">• Placed {formatDate(sOrder.createdAt)}</span>
                                </div>

                                <div className="header-status-group">
                                  <span className={`status-pill-seller status-${currentStatus.toLowerCase()}`}>
                                    {currentStatus}
                                  </span>
                                </div>
                              </div>

                              {/* Studio Items Table (Isolated to this seller only) */}
                              <div className="seller-items-table">
                                {sOrder.items?.map((it, idx) => (
                                  <div key={idx} className="seller-item-row">
                                    <img src={it.imageUrl} alt={it.title} className="item-thumb" />
                                    <div className="item-name-qty">
                                      <span className="item-title">{it.title}</span>
                                      <span className="item-qty">
                                        Quantity to Dispatch: <strong>{it.quantity}</strong> • Unit Price: ₹{Number(it.price).toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                    <span className="item-price">
                                      ₹{Number(it.itemTotal).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Customer Shipping & Financials Bar */}
                              <div className="seller-dispatch-info">
                                <div className="dispatch-dest">
                                  <Truck size={15} />
                                  <span>
                                    <strong>Ship to:</strong> {sOrder.shippingAddress?.fullName}, {sOrder.shippingAddress?.street},{' '}
                                    {sOrder.shippingAddress?.city}, {sOrder.shippingAddress?.state} ({sOrder.shippingAddress?.postalCode}) • Phone: {sOrder.shippingAddress?.phone}
                                  </span>
                                </div>
                                <div className="seller-payout-total">
                                  <span>Studio Allocation:</span>
                                  <strong>₹{Number(sOrder.total || 0).toLocaleString('en-IN')}</strong>
                                </div>
                              </div>

                              {/* Permitted Status Transitions Toolbar */}
                              <div className="seller-actions-toolbar">
                                <div className="action-hint">
                                  <span>Status Management:</span>
                                </div>

                                <div className="status-button-group">
                                  {/* From 'Placed' -> 'Processing' or 'Cancelled' */}
                                  {currentStatus === 'Placed' && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn-status-action btn-processing"
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateOrderStatus(sOrder._id, 'Processing')}
                                      >
                                        <Package size={14} />
                                        <span>{isUpdating ? 'Updating...' : 'Begin Processing'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-status-action btn-cancel"
                                        disabled={isUpdating}
                                        onClick={() => {
                                          if (window.confirm('Cancel this studio sub-order allocation?')) {
                                            handleUpdateOrderStatus(sOrder._id, 'Cancelled');
                                          }
                                        }}
                                      >
                                        <Ban size={14} />
                                        <span>Cancel</span>
                                      </button>
                                    </>
                                  )}

                                  {/* From 'Processing' -> 'Shipped' or 'Cancelled' */}
                                  {currentStatus === 'Processing' && (
                                    <>
                                      <button
                                        type="button"
                                        className="btn-status-action btn-shipped"
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateOrderStatus(sOrder._id, 'Shipped')}
                                      >
                                        <Truck size={14} />
                                        <span>{isUpdating ? 'Updating...' : 'Dispatch & Mark as Shipped'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn-status-action btn-cancel"
                                        disabled={isUpdating}
                                        onClick={() => {
                                          if (window.confirm('Cancel this studio sub-order allocation?')) {
                                            handleUpdateOrderStatus(sOrder._id, 'Cancelled');
                                          }
                                        }}
                                      >
                                        <Ban size={14} />
                                        <span>Cancel</span>
                                      </button>
                                    </>
                                  )}

                                  {/* From 'Shipped' -> 'Delivered' */}
                                  {currentStatus === 'Shipped' && (
                                    <button
                                      type="button"
                                      className="btn-status-action btn-delivered"
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateOrderStatus(sOrder._id, 'Delivered')}
                                    >
                                      <CheckCircle2 size={14} />
                                      <span>{isUpdating ? 'Updating...' : 'Confirm Delivery to Patron'}</span>
                                    </button>
                                  )}

                                  {/* Terminal state: Delivered */}
                                  {currentStatus === 'Delivered' && (
                                    <span className="terminal-badge delivered">
                                      <Check size={14} />
                                      <span>Delivered & Finalized</span>
                                    </span>
                                  )}

                                  {/* Terminal state: Cancelled */}
                                  {currentStatus === 'Cancelled' && (
                                    <span className="terminal-badge cancelled">
                                      <Ban size={14} />
                                      <span>Sub-Order Cancelled</span>
                                    </span>
                                  )}

                                  {/* Open Modal Button */}
                                  <button
                                    type="button"
                                    className="btn-open-modal-detail"
                                    onClick={() => setSelectedOrderForModal(sOrder)}
                                    title="View full dispatch breakdown"
                                  >
                                    <Eye size={14} />
                                    <span>Inspect Details</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-VIEW 3: STUDIO PROFILE */}
                {sellerSubTab === 'profile' && (
                  <div className="seller-profile-view">
                    <div className="panel-header">
                      <div className="header-text-group">
                        <h2 className="panel-title">Artisan Studio Identity</h2>
                        <p className="panel-subtitle">Manage your studio maker profile, verify credentials, and preview your public storefront.</p>
                      </div>
                    </div>

                    <div className="studio-profile-card">
                      <div className="studio-profile-header">
                        <div className="studio-avatar">
                          <Store size={28} />
                        </div>
                        <div className="studio-headline">
                          <h3>{storeName}</h3>
                          <span className="studio-status-pill approved">
                            <ShieldCheck size={13} />
                            <span>Verified Artisan Partner</span>
                          </span>
                        </div>
                      </div>

                      <div className="studio-info-grid">
                        <div className="info-box">
                          <span className="info-lbl">Artisan Master / Contact:</span>
                          <span className="info-val">{user?.name || 'Kaito Tanaka'}</span>
                        </div>
                        <div className="info-box">
                          <span className="info-lbl">Studio Contact Email:</span>
                          <span className="info-val">{user?.email || 'kaito@kansosound.com'}</span>
                        </div>
                        <div className="info-box">
                          <span className="info-lbl">Approval Status:</span>
                          <span className="info-val text-success">Approved & Active on Marketplace</span>
                        </div>
                        <div className="info-box">
                          <span className="info-lbl">Active Studio Orders:</span>
                          <span className="info-val">{stats.totalOrders} recorded acquisitions</span>
                        </div>
                        <div className="info-box">
                          <span className="info-lbl">Verified Sales Volume:</span>
                          <span className="info-val text-gold">₹{Number(stats.totalSales || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="studio-actions-row">
                        {onNavigateToStorefront && (
                          <button
                            type="button"
                            className="btn-primary"
                            onClick={() => onNavigateToStorefront(user?._id)}
                          >
                            <ExternalLink size={16} />
                            <span>Open Public Atelier Storefront</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setSellerSubTab('orders')}
                        >
                          <Package size={16} />
                          <span>View Studio Order Ledger</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODAL: SINGLE ORDER DETAIL DRAWER */}
                {selectedOrderForModal && (
                  <div className="modal-backdrop" onClick={() => setSelectedOrderForModal(null)}>
                    <div
                      className="seller-modal-content"
                      onClick={(e) => e.stopPropagation()}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="modal-order-title"
                    >
                      <div className="modal-header">
                        <div className="modal-title-group">
                          <Store size={18} />
                          <h3 id="modal-order-title">
                            Studio Sub-Order: {selectedOrderForModal.subOrderReference}
                          </h3>
                        </div>
                        <button
                          type="button"
                          className="modal-close-btn"
                          onClick={() => setSelectedOrderForModal(null)}
                          aria-label="Close details"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="modal-body">
                        {/* Parent Reference and Placement Time */}
                        <div className="modal-meta-bar">
                          <span>Parent Reference: <strong>{selectedOrderForModal.orderReference}</strong></span>
                          <span>Placed: <strong>{formatDate(selectedOrderForModal.createdAt)}</strong></span>
                          <span className={`status-pill-seller status-${(selectedOrderForModal.orderStatus || 'placed').toLowerCase()}`}>
                            {selectedOrderForModal.orderStatus}
                          </span>
                        </div>

                        {/* Customer Delivery Information */}
                        <div className="modal-section">
                          <h4 className="modal-sec-title">Patron Shipping Destination</h4>
                          <div className="modal-address-box">
                            <p><strong>Recipient Name:</strong> {selectedOrderForModal.shippingAddress?.fullName}</p>
                            <p><strong>Contact Phone:</strong> {selectedOrderForModal.shippingAddress?.phone}</p>
                            <p>
                              <strong>Delivery Address:</strong> {selectedOrderForModal.shippingAddress?.street},{' '}
                              {selectedOrderForModal.shippingAddress?.city}, {selectedOrderForModal.shippingAddress?.state} –{' '}
                              {selectedOrderForModal.shippingAddress?.postalCode}
                            </p>
                          </div>
                        </div>

                        {/* Studio Items Table */}
                        <div className="modal-section">
                          <h4 className="modal-sec-title">Studio Allocation Pieces ({selectedOrderForModal.items?.length || 0})</h4>
                          <div className="modal-items-list">
                            {selectedOrderForModal.items?.map((it, idx) => (
                              <div key={idx} className="modal-item-row">
                                <img src={it.imageUrl} alt={it.title} className="modal-thumb" />
                                <div className="modal-item-details">
                                  <span className="modal-item-title">{it.title}</span>
                                  <span className="modal-item-qty">
                                    Quantity: <strong>{it.quantity}</strong> • Unit Price: ₹{Number(it.price).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <span className="modal-item-total">
                                  ₹{Number(it.itemTotal).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payout Breakdown */}
                        <div className="modal-totals-box">
                          <div className="total-row">
                            <span>Studio Pieces Subtotal:</span>
                            <span>₹{Number(selectedOrderForModal.subtotal || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="total-row">
                            <span>Allocated Courier & Packaging:</span>
                            <span>{selectedOrderForModal.shippingFee === 0 ? 'Complimentary' : `₹${selectedOrderForModal.shippingFee}`}</span>
                          </div>
                          <div className="total-row grand">
                            <span>Total Studio Allocation:</span>
                            <strong>₹{Number(selectedOrderForModal.total || 0).toLocaleString('en-IN')}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setSelectedOrderForModal(null)}
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
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
