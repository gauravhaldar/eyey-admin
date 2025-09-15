// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  ADMIN_LOGOUT: `${API_BASE_URL}/api/admin/logout`,
  ADMIN_ME: `${API_BASE_URL}/api/admin/me`,
  ADMIN_CUSTOMERS: `${API_BASE_URL}/api/admin/customers`,
  ADMIN_COUPONS: `${API_BASE_URL}/api/admin/coupons`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,

  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,

  // Shipping endpoints
  SHIPPING: `${API_BASE_URL}/api/shipping`,
  SHIPPING_ADD: `${API_BASE_URL}/api/shipping/add`,

  // User endpoints
  USERS_SIGNUP: `${API_BASE_URL}/api/users/signup`,
  USERS_LOGIN: `${API_BASE_URL}/api/users/login`,
  USERS_LOGOUT: `${API_BASE_URL}/api/users/logout`,
  USERS_ME: `${API_BASE_URL}/api/users/me`,
  USERS_PROFILE: `${API_BASE_URL}/api/users/profile`,

  // Cart endpoints
  CART_ADD: `${API_BASE_URL}/api/cart/add`,
  CART_UPDATE: `${API_BASE_URL}/api/cart/update`,
  CART_REMOVE: `${API_BASE_URL}/api/cart/remove`,
  CART_CLEAR: `${API_BASE_URL}/api/cart/clear`,

  // Contact endpoints
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,
};

// Helper function to get API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
