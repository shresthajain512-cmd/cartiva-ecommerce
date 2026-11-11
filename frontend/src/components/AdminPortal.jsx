import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  Truck,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Eye,
  Check,
  X,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  fetchAdminMetricsApi,
  fetchAdminSellersApi,
  updateSellerApprovalApi,
  fetchAdminUsersApi,
  updateUserStatusApi,
  fetchAdminProductsApi,
  moderateProductApi,
  fetchAllOrdersApi,
  updateOrderStatusApi
} from '../services/api';

export const AdminPortal = ({
  token,
  user,
  role,
  onExploreCatalogue,
  onNavigateToStorefront,
  addToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'sellers' | 'users' | 'products' | 'orders'
  const [loading, setLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // 1. Metrics State
  const [metrics, setMetrics] = useState(null);

  // 2. Sellers State
  const [sellers, setSellers] = useState([]);
  const [sellerStatusFilter, setSellerStatusFilter] = useState('all');
  const [sellerSearch, setSellerSearch] = useState('');
  const [updatingSellerId, setUpdatingSellerId] = useState(null);

  // 3. Users State
  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // 4. Products State
  const [productsList, setProductsList] = useState([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [moderatingProductId, setModeratingProductId] = useState(null);

  // 5. Orders State
  const [ordersList, setOrdersList] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Load Metrics
  const loadMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchAdminMetricsApi(token);
      if (res.success && res.metrics) {
        setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      addToast(err.message || 'Failed to retrieve platform metrics', 'error');
    }
  }, [token, addToast]);

  // Load Sellers
  const loadSellers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchAdminSellersApi(
        { status: sellerStatusFilter, q: sellerSearch },
        token
      );
      if (res.success && Array.isArray(res.sellers)) {
        setSellers(res.sellers);
      }
    } catch (err) {
      console.error('Failed to load sellers:', err);
      addToast(err.message || 'Failed to retrieve sellers list', 'error');
    }
  }, [token, sellerStatusFilter, sellerSearch, addToast]);

  // Load Users
  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchAdminUsersApi(
        { role: userRoleFilter, status: userStatusFilter, q: userSearch, limit: 50 },
        token
      );
      if (res.success && Array.isArray(res.users)) {
        setUsersList(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      addToast(err.message || 'Failed to retrieve users directory', 'error');
    }
  }, [token, userRoleFilter, userStatusFilter, userSearch, addToast]);

  // Load Products
  const loadProducts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchAdminProductsApi(
        {
          category: productCategoryFilter,
          status: productStatusFilter,
          keyword: productSearch,
          limit: 50
        },
        token
      );
      if (res.success && Array.isArray(res.products)) {
        setProductsList(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      addToast(err.message || 'Failed to retrieve products', 'error');
    }
  }, [token, productCategoryFilter, productStatusFilter, productSearch, addToast]);

  // Load Orders
  const loadOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetchAllOrdersApi(token);
      if (res.success && Array.isArray(res.orders)) {
        setOrdersList(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      addToast(err.message || 'Failed to retrieve platform orders', 'error');
    }
  }, [token, addToast]);

  // Unified Refresh
  const handleRefreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadMetrics(),
      loadSellers(),
      loadUsers(),
      loadProducts(),
      loadOrders()
    ]);
    setLoading(false);
  }, [loadMetrics, loadSellers, loadUsers, loadProducts, loadOrders]);

  useEffect(() => {
    handleRefreshAll();
  }, [handleRefreshAll, refreshIndex]);

  // Re-fetch individual tabs on filter changes
  useEffect(() => {
    if (activeSubTab === 'sellers') loadSellers();
  }, [activeSubTab, sellerStatusFilter, loadSellers]);

  useEffect(() => {
    if (activeSubTab === 'users') loadUsers();
  }, [activeSubTab, userRoleFilter, userStatusFilter, loadUsers]);

  useEffect(() => {
    if (activeSubTab === 'products') loadProducts();
  }, [activeSubTab, productCategoryFilter, productStatusFilter, loadProducts]);

  // Handlers for Seller Approval
  const handleUpdateSellerApproval = async (sellerId, newStatus) => {
    setUpdatingSellerId(sellerId);
    try {
      const res = await updateSellerApprovalApi(sellerId, newStatus, token);
      if (res.success) {
        addToast(`Seller application set to "${newStatus.toUpperCase()}"`, 'success');
        setSellers((prev) =>
          prev.map((s) =>
            s._id === sellerId ? { ...s, sellerApprovalStatus: newStatus } : s
          )
        );
        loadMetrics();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update seller status', 'error');
    } finally {
      setUpdatingSellerId(null);
    }
  };

  // Handlers for User Standing (active/suspended)
  const handleUpdateUserStatus = async (userId, newStatus) => {
    const currentAdminId = user?._id || user?.id;
    if (userId === currentAdminId) {
      addToast('Administrators cannot suspend their own account.', 'warning');
      return;
    }
    setUpdatingUserId(userId);
    try {
      const res = await updateUserStatusApi(userId, newStatus, token);
      if (res.success) {
        addToast(`User standing updated to "${newStatus.toUpperCase()}"`, 'success');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, accountStatus: newStatus } : u))
        );
        loadMetrics();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Handlers for Product Moderation
  const handleModerateProduct = async (productId, updateData) => {
    setModeratingProductId(productId);
    try {
      const res = await moderateProductApi(productId, updateData, token);
      if (res.success) {
        addToast('Product moderation updated successfully', 'success');
        setProductsList((prev) =>
          prev.map((p) => (p._id === productId ? { ...p, ...updateData } : p))
        );
        loadMetrics();
      }
    } catch (err) {
      addToast(err.message || 'Failed to moderate product', 'error');
    } finally {
      setModeratingProductId(null);
    }
  };

  // Handlers for Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await updateOrderStatusApi(orderId, { orderStatus: newStatus }, token);
      if (res.success) {
        addToast(`Order reference updated to "${newStatus}"`, 'success');
        setOrdersList((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrderModal && selectedOrderModal._id === orderId) {
          setSelectedOrderModal((prev) => ({ ...prev, orderStatus: newStatus }));
        }
        loadMetrics();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper date formatter
  const formatDate = (iso) => {
    if (!iso) return 'Recent';
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Filtered Orders for the Orders sub-tab
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      if (orderStatusFilter !== 'All' && o.orderStatus !== orderStatusFilter) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const refMatch = (o.orderReference || '').toLowerCase().includes(q);
        const nameMatch = (o.customerInfo?.name || '').toLowerCase().includes(q);
        const cityMatch = (o.shippingAddress?.city || '').toLowerCase().includes(q);
        if (!refMatch && !nameMatch && !cityMatch) return false;
      }
      return true;
    });
  }, [ordersList, orderStatusFilter, orderSearch]);

  const pendingSellersCount = metrics?.sellers?.pending || 0;

  return (
    <div className="admin-portal-wrapper">
      {/* 1. Header & Navigation */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <div className="admin-badge-wrap">
            <span className="admin-super-badge">
              <ShieldCheck size={14} />
              <span>Cartiva Supervisory Command</span>
            </span>
          </div>
          <h2 className="admin-title">Marketplace Governance & Platform Oversight</h2>
          <p className="admin-subtitle">
            Administer artisan onboarding, moderate curated masterworks, oversee registered collectors,
            and monitor all multi-vendor logistics.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="btn-admin-refresh"
            onClick={() => setRefreshIndex((c) => c + 1)}
            disabled={loading}
            title="Refresh verified platform data"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-tab Navigation Pills */}
      <div className="admin-subtabs-nav">
        <button
          type="button"
          className={`admin-subtab-pill ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          <SlidersHorizontal size={15} />
          <span>Platform Overview</span>
        </button>

        <button
          type="button"
          className={`admin-subtab-pill ${activeSubTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('sellers')}
        >
          <Store size={15} />
          <span>Artisan Applications</span>
          {pendingSellersCount > 0 && (
            <span className="admin-pill-alert-badge">{pendingSellersCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`admin-subtab-pill ${activeSubTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('users')}
        >
          <Users size={15} />
          <span>User Directory</span>
        </button>

        <button
          type="button"
          className={`admin-subtab-pill ${activeSubTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('products')}
        >
          <Package size={15} />
          <span>Catalogue Moderation</span>
        </button>

        <button
          type="button"
          className={`admin-subtab-pill ${activeSubTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('orders')}
        >
          <Truck size={15} />
          <span>Platform Orders</span>
          {ordersList.length > 0 && (
            <span className="admin-pill-count-badge">{ordersList.length}</span>
          )}
        </button>
      </div>

      {/* 3. SUBTAB: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="admin-overview-view animate-fade-in">
          {/* Pending Applications Alert Banner */}
          {pendingSellersCount > 0 && (
            <div className="admin-alert-banner">
              <div className="alert-banner-left">
                <AlertCircle size={20} className="alert-icon" />
                <div>
                  <h4 className="alert-heading">
                    {pendingSellersCount} Artisan Studio {pendingSellersCount === 1 ? 'Application' : 'Applications'} Pending Review
                  </h4>
                  <p className="alert-body">
                    Independent studios have registered their business credentials. Review applications to authorize catalog publication.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-alert-action"
                onClick={() => setActiveSubTab('sellers')}
              >
                <span>Review Applications</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          )}

          {/* KPI Stat Cards Grid */}
          <div className="admin-metrics-grid">
            {/* Metric 1: Platform Gross Volume */}
            <div className="admin-stat-card highlight">
              <div className="stat-card-top">
                <span className="stat-label">Platform Gross Merchandise Value</span>
                <DollarSign size={18} className="stat-icon" />
              </div>
              <div className="stat-main-val">
                ₹{Number(metrics?.orders?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="stat-footnote">
                From verified active client orders across all studios
              </div>
            </div>

            {/* Metric 2: Total Registered Users */}
            <div className="admin-stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Registered Collectors & Accounts</span>
                <Users size={18} className="stat-icon" />
              </div>
              <div className="stat-main-val">{metrics?.users?.total || 0}</div>
              <div className="stat-breakdown-tags">
                <span className="mini-tag">{metrics?.users?.customers || 0} Patrons</span>
                <span className="mini-tag">{metrics?.users?.sellers || 0} Studios</span>
                <span className="mini-tag">{metrics?.users?.admins || 0} Curators</span>
                {metrics?.users?.suspended > 0 && (
                  <span className="mini-tag alert">{metrics.users.suspended} Suspended</span>
                )}
              </div>
            </div>

            {/* Metric 3: Seller Applications & Roster */}
            <div className="admin-stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Artisan Studios Roster</span>
                <Store size={18} className="stat-icon" />
              </div>
              <div className="stat-main-val">{metrics?.sellers?.total || 0}</div>
              <div className="stat-breakdown-tags">
                <span className="mini-tag success">{metrics?.sellers?.approved || 0} Approved</span>
                <span className="mini-tag warning">{metrics?.sellers?.pending || 0} Pending</span>
                <span className="mini-tag danger">{metrics?.sellers?.suspended || 0} Suspended</span>
              </div>
            </div>

            {/* Metric 4: Marketplace Products */}
            <div className="admin-stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Marketplace Pieces</span>
                <Package size={18} className="stat-icon" />
              </div>
              <div className="stat-main-val">{metrics?.products?.total || 0}</div>
              <div className="stat-breakdown-tags">
                <span className="mini-tag success">{metrics?.products?.active || 0} Active Online</span>
                <span className="mini-tag muted">{metrics?.products?.archived || 0} Archived</span>
              </div>
            </div>

            {/* Metric 5: Platform Orders */}
            <div className="admin-stat-card">
              <div className="stat-card-top">
                <span className="stat-label">Platform Orders Overview</span>
                <Truck size={18} className="stat-icon" />
              </div>
              <div className="stat-main-val">{metrics?.orders?.total || 0}</div>
              <div className="stat-breakdown-tags">
                <span className="mini-tag">{metrics?.orders?.placed || 0} Placed</span>
                <span className="mini-tag">{metrics?.orders?.processing || 0} Processing</span>
                <span className="mini-tag">{metrics?.orders?.shipped || 0} Shipped</span>
                <span className="mini-tag success">{metrics?.orders?.delivered || 0} Delivered</span>
              </div>
            </div>
          </div>

          {/* 2-Column Split: Recent Orders & Recent Sellers */}
          <div className="admin-overview-split-row">
            {/* Left: Recent Orders */}
            <div className="overview-split-card">
              <div className="split-card-header">
                <div className="split-title-group">
                  <Truck size={16} />
                  <h3>Recent Marketplace Orders</h3>
                </div>
                <button
                  type="button"
                  className="btn-view-all-link"
                  onClick={() => setActiveSubTab('orders')}
                >
                  View All Orders
                </button>
              </div>

              <div className="split-table-wrap">
                {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                  <table className="admin-compact-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Client</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentOrders.map((ord) => (
                        <tr key={ord._id}>
                          <td>
                            <strong className="order-ref-code">{ord.orderReference}</strong>
                          </td>
                          <td>{ord.customerInfo?.name || ord.user?.name || 'Patron'}</td>
                          <td>₹{Number(ord.totalAmount).toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`status-pill status-${(ord.orderStatus || 'placed').toLowerCase()}`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="text-muted">{formatDate(ord.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-split-text">No orders placed yet.</p>
                )}
              </div>
            </div>

            {/* Right: Recent Seller Inquiries */}
            <div className="overview-split-card">
              <div className="split-card-header">
                <div className="split-title-group">
                  <Store size={16} />
                  <h3>Recent Studio Registrations</h3>
                </div>
                <button
                  type="button"
                  className="btn-view-all-link"
                  onClick={() => setActiveSubTab('sellers')}
                >
                  Manage Roster
                </button>
              </div>

              <div className="split-table-wrap">
                {metrics?.recentSellers && metrics.recentSellers.length > 0 ? (
                  <table className="admin-compact-table">
                    <thead>
                      <tr>
                        <th>Studio Name</th>
                        <th>Applicant</th>
                        <th>Standing</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentSellers.map((sel) => (
                        <tr key={sel._id}>
                          <td>
                            <strong>{sel.businessName || 'Independent Studio'}</strong>
                          </td>
                          <td>
                            <div className="applicant-cell">
                              <span>{sel.name}</span>
                              <small className="text-muted">{sel.email}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill status-${sel.sellerApprovalStatus || 'pending'}`}>
                              {sel.sellerApprovalStatus || 'pending'}
                            </span>
                          </td>
                          <td>
                            {sel.sellerApprovalStatus === 'pending' ? (
                              <button
                                type="button"
                                className="btn-table-action approve"
                                onClick={() => handleUpdateSellerApproval(sel._id, 'approved')}
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => setActiveSubTab('sellers')}
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-split-text">No seller registrations yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: SELLERS (Artisan Applications & Roster) */}
      {activeSubTab === 'sellers' && (
        <div className="admin-sellers-view animate-fade-in">
          <div className="table-controls-bar">
            {/* Filter Pills */}
            <div className="filter-pills-row">
              {['all', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`filter-pill-btn ${sellerStatusFilter === st ? 'active' : ''}`}
                  onClick={() => setSellerStatusFilter(st)}
                >
                  <span className="capitalize">{st}</span>
                  {st === 'pending' && pendingSellersCount > 0 && (
                    <span className="pill-badge">{pendingSellersCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="table-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search studio name, owner, or email..."
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
              />
              {sellerSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSellerSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Sellers Ledger Table */}
          <div className="admin-table-container">
            <table className="admin-main-table">
              <thead>
                <tr>
                  <th>Studio Business</th>
                  <th>Applicant Details</th>
                  <th>Applied On</th>
                  <th>Approval Standing</th>
                  <th>Curatorial Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length > 0 ? (
                  sellers.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <div className="studio-col">
                          <strong className="studio-name">{s.businessName || 'Studio'}</strong>
                          <span className="studio-id text-muted">ID: {s._id.slice(-6)}</span>
                        </div>
                      </td>
                      <td>
                        <div className="applicant-details">
                          <span className="applicant-name">{s.name}</span>
                          <span className="applicant-email text-muted">{s.email}</span>
                        </div>
                      </td>
                      <td className="text-muted">{formatDate(s.createdAt)}</td>
                      <td>
                        <span className={`status-pill status-${s.sellerApprovalStatus || 'pending'}`}>
                          {s.sellerApprovalStatus || 'pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          {s.sellerApprovalStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                className="btn-action-emerald"
                                disabled={updatingSellerId === s._id}
                                onClick={() => handleUpdateSellerApproval(s._id, 'approved')}
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                className="btn-action-rose"
                                disabled={updatingSellerId === s._id}
                                onClick={() => handleUpdateSellerApproval(s._id, 'rejected')}
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {s.sellerApprovalStatus === 'approved' && (
                            <>
                              <button
                                type="button"
                                className="btn-action-amber"
                                disabled={updatingSellerId === s._id}
                                onClick={() => handleUpdateSellerApproval(s._id, 'suspended')}
                              >
                                <Ban size={14} />
                                <span>Suspend Studio</span>
                              </button>
                              <button
                                type="button"
                                className="btn-action-ghost"
                                onClick={() => onNavigateToStorefront(s._id)}
                              >
                                <ExternalLink size={13} />
                                <span>View Store</span>
                              </button>
                            </>
                          )}

                          {s.sellerApprovalStatus === 'suspended' && (
                            <button
                              type="button"
                              className="btn-action-emerald"
                              disabled={updatingSellerId === s._id}
                              onClick={() => handleUpdateSellerApproval(s._id, 'approved')}
                            >
                              <CheckCircle2 size={14} />
                              <span>Reactivate Studio</span>
                            </button>
                          )}

                          {s.sellerApprovalStatus === 'rejected' && (
                            <button
                              type="button"
                              className="btn-action-ghost"
                              disabled={updatingSellerId === s._id}
                              onClick={() => handleUpdateSellerApproval(s._id, 'approved')}
                            >
                              <span>Reconsider & Approve</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">
                      No artisan studio applications found matching "{sellerStatusFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: USERS (User Directory & Standing) */}
      {activeSubTab === 'users' && (
        <div className="admin-users-view animate-fade-in">
          <div className="table-controls-bar">
            {/* Role Filter */}
            <div className="filter-pills-row">
              <span className="filter-group-label">Role:</span>
              {['all', 'customer', 'seller', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`filter-pill-btn ${userRoleFilter === r ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter(r)}
                >
                  <span className="capitalize">{r}</span>
                </button>
              ))}
            </div>

            {/* Standing Filter */}
            <div className="filter-pills-row">
              <span className="filter-group-label">Standing:</span>
              {['all', 'active', 'suspended'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`filter-pill-btn ${userStatusFilter === st ? 'active' : ''}`}
                  onClick={() => setUserStatusFilter(st)}
                >
                  <span className="capitalize">{st}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="table-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or business..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setUserSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-table-container">
            <table className="admin-main-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Marketplace Role</th>
                  <th>Studio / Affiliation</th>
                  <th>Standing</th>
                  <th>Registered</th>
                  <th>Administrative Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length > 0 ? (
                  usersList.map((u) => {
                    const isSelf =
                      u._id === (user?._id || user?.id) ||
                      (user?.email && u.email?.toLowerCase() === user?.email?.toLowerCase());
                    const isSuspended = u.accountStatus === 'suspended';

                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="user-identity-cell">
                            <strong>{u.name}</strong>
                            <small className="text-muted">{u.email}</small>
                            {isSelf && <span className="self-badge">You</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          {u.businessName ? (
                            <span className="business-cell-text">{u.businessName}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill status-${isSuspended ? 'suspended' : 'approved'}`}>
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="text-muted">{formatDate(u.createdAt)}</td>
                        <td>
                          {isSelf ? (
                            <button
                              type="button"
                              className="btn-action-disabled"
                              disabled
                              title="Administrators cannot suspend their own account"
                            >
                              Self Protection
                            </button>
                          ) : isSuspended ? (
                            <button
                              type="button"
                              className="btn-action-emerald"
                              disabled={updatingUserId === u._id}
                              onClick={() => handleUpdateUserStatus(u._id, 'active')}
                            >
                              <CheckCircle2 size={14} />
                              <span>Reactivate Account</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-rose"
                              disabled={updatingUserId === u._id}
                              onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                            >
                              <Ban size={14} />
                              <span>Suspend Account</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">
                      No users found matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SUBTAB: PRODUCTS (Catalogue Moderation) */}
      {activeSubTab === 'products' && (
        <div className="admin-products-view animate-fade-in">
          <div className="table-controls-bar">
            {/* Status Filter */}
            <div className="filter-pills-row">
              <span className="filter-group-label">Catalog State:</span>
              {[
                { id: 'all', label: 'All Catalog' },
                { id: 'active', label: 'Active Online' },
                { id: 'archived', label: 'Archived / Soft-Deleted' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  className={`filter-pill-btn ${productStatusFilter === st.id ? 'active' : ''}`}
                  onClick={() => setProductStatusFilter(st.id)}
                >
                  <span>{st.label}</span>
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="admin-select-wrap">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="admin-select"
              >
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Books">Books</option>
                <option value="Fitness">Fitness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="table-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search product title, studio, or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {productSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setProductSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="admin-table-container">
            <table className="admin-main-table">
              <thead>
                <tr>
                  <th>Piece Title</th>
                  <th>Artisan Studio</th>
                  <th>Category</th>
                  <th>Price & Stock</th>
                  <th>Catalogue Standing</th>
                  <th>Moderation Controls</th>
                </tr>
              </thead>
              <tbody>
                {productsList.length > 0 ? (
                  productsList.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="product-thumb-title-cell">
                          <img src={p.imageUrl} alt={p.title} className="product-admin-thumb" />
                          <div className="product-title-group">
                            <strong className="prod-title">{p.title}</strong>
                            {p.isFeatured && (
                              <span className="featured-badge-mini">
                                <Sparkles size={11} />
                                <span>Featured</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="studio-col-text">
                          {p.storeName || p.seller?.businessName || 'Independent Studio'}
                        </span>
                      </td>
                      <td>
                        <span className="category-tag">{p.category}</span>
                      </td>
                      <td>
                        <div className="price-stock-cell">
                          <strong className="prod-price">₹{Number(p.price).toLocaleString('en-IN')}</strong>
                          <small className="text-muted">{p.stockCount} in studio stock</small>
                        </div>
                      </td>
                      <td>
                        {p.isArchived ? (
                          <span className="status-pill status-archived">Archived</span>
                        ) : p.isPublished ? (
                          <span className="status-pill status-approved">Active Online</span>
                        ) : (
                          <span className="status-pill status-pending">Unpublished</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          {p.isArchived ? (
                            <button
                              type="button"
                              className="btn-action-emerald"
                              disabled={moderatingProductId === p._id}
                              onClick={() =>
                                handleModerateProduct(p._id, {
                                  isArchived: false,
                                  isPublished: true
                                })
                              }
                            >
                              <CheckCircle2 size={14} />
                              <span>Restore to Catalog</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-action-rose"
                              disabled={moderatingProductId === p._id}
                              onClick={() =>
                                handleModerateProduct(p._id, {
                                  isArchived: true,
                                  isPublished: false
                                })
                              }
                            >
                              <Ban size={14} />
                              <span>Archive Piece</span>
                            </button>
                          )}

                          <button
                            type="button"
                            className={`btn-action-ghost ${p.isFeatured ? 'active' : ''}`}
                            disabled={moderatingProductId === p._id}
                            onClick={() =>
                              handleModerateProduct(p._id, { isFeatured: !p.isFeatured })
                            }
                            title="Toggle spotlight visibility"
                          >
                            <Sparkles size={13} />
                            <span>{p.isFeatured ? 'Unfeature' : 'Spotlight'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">
                      No products found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SUBTAB: ORDERS (Platform Orders Oversight) */}
      {activeSubTab === 'orders' && (
        <div className="admin-orders-view animate-fade-in">
          <div className="table-controls-bar">
            {/* Status Filter */}
            <div className="filter-pills-row">
              <span className="filter-group-label">Status:</span>
              {['All', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`filter-pill-btn ${orderStatusFilter === st ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter(st)}
                >
                  <span>{st}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="table-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by order reference, client, or city..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              {orderSearch && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setOrderSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="admin-table-container">
            <table className="admin-main-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Patron Details</th>
                  <th>Studio Allocations</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Supervisory Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td>
                        <div className="order-ref-cell">
                          <strong className="order-ref-code">{ord.orderReference}</strong>
                          <small className="text-muted">{formatDate(ord.createdAt)}</small>
                        </div>
                      </td>
                      <td>
                        <div className="patron-cell">
                          <span className="patron-name">{ord.customerInfo?.name || 'Patron'}</span>
                          <span className="patron-city text-muted">
                            {ord.shippingAddress?.city}, {ord.shippingAddress?.state}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="seller-groups-list">
                          {ord.sellerGroups?.map((g, idx) => (
                            <span key={idx} className="seller-group-pill">
                              {g.storeName} ({g.items?.length || 0}) • {g.status}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <strong className="order-amount">
                          ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className={`status-pill status-${(ord.orderStatus || 'placed').toLowerCase()}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            type="button"
                            className="btn-action-ghost"
                            onClick={() => setSelectedOrderModal(ord)}
                          >
                            <Eye size={14} />
                            <span>Inspect</span>
                          </button>

                          <div className="status-select-wrap">
                            <select
                              value={ord.orderStatus}
                              disabled={updatingOrderId === ord._id}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                              className="admin-status-dropdown"
                            >
                              <option value="Placed">Placed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">
                      No platform orders found matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. SINGLE ORDER DETAIL MODAL */}
      {selectedOrderModal && (
        <div className="modal-backdrop" onClick={() => setSelectedOrderModal(null)}>
          <div
            className="seller-modal-content admin-modal-wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <ShieldCheck size={20} />
                <h3>Platform Order Oversight: {selectedOrderModal.orderReference}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOrderModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Meta details */}
              <div className="modal-meta-bar">
                <span>Placed: <strong>{formatDate(selectedOrderModal.createdAt)}</strong></span>
                <span>Payment: <strong>{selectedOrderModal.paymentMethod?.toUpperCase()}</strong></span>
                <span className={`status-pill status-${(selectedOrderModal.orderStatus || 'placed').toLowerCase()}`}>
                  {selectedOrderModal.orderStatus}
                </span>
              </div>

              {/* Patron & Destination */}
              <div className="modal-section">
                <h4 className="modal-sec-title">Patron & Delivery Destination</h4>
                <div className="modal-address-box">
                  <p><strong>Recipient Name:</strong> {selectedOrderModal.shippingAddress?.fullName}</p>
                  <p><strong>Contact Phone:</strong> {selectedOrderModal.shippingAddress?.phone}</p>
                  <p>
                    <strong>Address:</strong> {selectedOrderModal.shippingAddress?.street},{' '}
                    {selectedOrderModal.shippingAddress?.city}, {selectedOrderModal.shippingAddress?.state} –{' '}
                    {selectedOrderModal.shippingAddress?.postalCode}
                  </p>
                </div>
              </div>

              {/* Multi-Vendor Seller Sub-Order Groups */}
              <div className="modal-section">
                <h4 className="modal-sec-title">
                  Artisan Studio Allocations ({selectedOrderModal.sellerGroups?.length || 0} Studios)
                </h4>
                <div className="admin-modal-seller-groups">
                  {selectedOrderModal.sellerGroups?.map((group, gIdx) => (
                    <div key={gIdx} className="admin-seller-group-card">
                      <div className="group-card-header">
                        <div>
                          <strong>{group.storeName}</strong>
                          <small className="sub-ref text-muted">Sub-Order: {group.subOrderReference}</small>
                        </div>
                        <span className={`status-pill status-${(group.status || 'placed').toLowerCase()}`}>
                          {group.status}
                        </span>
                      </div>

                      <div className="group-items-list">
                        {group.items?.map((it, iIdx) => (
                          <div key={iIdx} className="modal-item-row">
                            <img src={it.imageUrl} alt={it.title} className="modal-thumb" />
                            <div className="modal-item-details">
                              <span className="modal-item-title">{it.title}</span>
                              <span className="modal-item-qty">
                                Qty: {it.quantity} • Unit: ₹{Number(it.price).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span className="modal-item-total">
                              ₹{Number(it.itemTotal).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="group-subtotal-row">
                        <span>Studio Total:</span>
                        <strong>₹{Number(group.total).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="modal-totals-box">
                <div className="total-row">
                  <span>Items Subtotal:</span>
                  <span>₹{Number(selectedOrderModal.itemsSubtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="total-row">
                  <span>Courier & Packaging:</span>
                  <span>
                    {selectedOrderModal.shippingFee === 0
                      ? 'Complimentary'
                      : `₹${selectedOrderModal.shippingFee}`}
                  </span>
                </div>
                <div className="total-row grand">
                  <span>Grand Total Paid:</span>
                  <strong>₹{Number(selectedOrderModal.totalAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedOrderModal(null)}
              >
                Close Oversight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
