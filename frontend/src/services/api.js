/**
 * Cartiva API Service
 * Communicates with the Express & MongoDB backend on http://localhost:5001
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Fetch public catalogue products with optional filters, search, sorting, and pagination
 */
export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.category && params.category !== 'All') {
    query.append('category', params.category);
  }
  if (params.keyword && params.keyword.trim()) {
    query.append('keyword', params.keyword.trim());
  }
  if (params.sort) {
    query.append('sort', params.sort);
  }
  if (params.inStock) {
    query.append('inStock', 'true');
  }
  if (params.seller) {
    query.append('seller', params.seller);
  }
  if (params.minPrice !== undefined && params.minPrice !== '' && !isNaN(params.minPrice)) {
    query.append('minPrice', params.minPrice);
  }
  if (params.maxPrice !== undefined && params.maxPrice !== '' && !isNaN(params.maxPrice)) {
    query.append('maxPrice', params.maxPrice);
  }
  if (params.rating) {
    query.append('rating', params.rating);
  }
  if (params.featured) {
    query.append('featured', 'true');
  }
  if (params.discounted) {
    query.append('discounted', 'true');
  }
  if (params.page) {
    query.append('page', params.page);
  }
  if (params.limit) {
    query.append('limit', params.limit);
  }

  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch catalogue (HTTP ${response.status})`);
  }
  return await response.json();
};

/**
 * Fetch allowable product categories
 */
export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products/categories`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories (HTTP ${response.status})`);
  }
  return await response.json();
};

/**
 * Fetch detailed specifications for a single product
 */
export const fetchProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Product not found');
  }
  return await response.json();
};

/**
 * Fetch storefront catalogue for a specific approved seller
 */
export const fetchStorefront = async (sellerId) => {
  const response = await fetch(`${API_BASE_URL}/api/products/store/${sellerId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Storefront not found');
  }
  return await response.json();
};

/**
 * Health check
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
};

/**
 * ========================================================
 * ORDERS & CHECKOUT API SERVICES (DAY 11)
 * ========================================================
 */

/**
 * Submit verified checkout order to backend
 */
export const createOrderApi = async (orderPayload, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderPayload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to create order (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch customer's personal order history
 */
export const fetchMyOrdersApi = async (token) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch order history (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch a single order by MongoDB ObjectId or human-readable orderReference
 */
export const fetchOrderByIdApi = async (idOrRef, token) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/${idOrRef}`, {
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Order not found (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch incoming orders isolated to authenticated seller's products only
 */
export const fetchSellerOrdersApi = async (token) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/seller/my-orders`, {
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch seller orders (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Update order status (Admin or participating seller)
 */
export const updateOrderStatusApi = async (orderId, updateData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to update status (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Authenticate user login
 */
export const loginApi = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

/**
 * Register new customer or seller
 */
export const registerApi = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

/**
 * Fetch platform-wide aggregated metrics (Admin only)
 */
export const fetchAdminMetricsApi = async (token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/admin/metrics`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch admin metrics (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch seller applications and roster with status/search filters (Admin only)
 */
export const fetchAdminSellersApi = async (params = {}, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.q) query.append('q', params.q);

  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/sellers${qs ? `?${qs}` : ''}`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch sellers (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Update seller application approval status (Admin only)
 */
export const updateSellerApprovalApi = async (sellerId, status, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/admin/sellers/${sellerId}/approval`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to update seller status (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch user directory with role/status filters and search (Admin only)
 */
export const fetchAdminUsersApi = async (params = {}, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const query = new URLSearchParams();
  if (params.role && params.role !== 'all') query.append('role', params.role);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.q) query.append('q', params.q);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/users${qs ? `?${qs}` : ''}`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch users (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Update user account standing (active/suspended) (Admin only)
 */
export const updateUserStatusApi = async (userId, accountStatus, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ accountStatus })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to update user status (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch marketplace products for admin moderation (Admin only)
 */
export const fetchAdminProductsApi = async (params = {}, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.seller) query.append('seller', params.seller);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString();
  const response = await fetch(`${API_BASE_URL}/api/admin/products${qs ? `?${qs}` : ''}`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch admin products (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Moderate a product (archive, publish, feature) (Admin only)
 */
export const moderateProductApi = async (productId, updateData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}/moderate`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updateData)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to moderate product (HTTP ${response.status})`);
  }
  return data;
};

/**
 * Fetch all platform orders (Admin only)
 */
export const fetchAllOrdersApi = async (token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/orders`, { headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Failed to fetch platform orders (HTTP ${response.status})`);
  }
  return data;
};
