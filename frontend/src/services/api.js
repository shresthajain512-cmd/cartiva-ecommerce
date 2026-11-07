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
