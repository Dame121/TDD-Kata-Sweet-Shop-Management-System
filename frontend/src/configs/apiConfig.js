// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  ME: `${API_BASE_URL}/api/auth/me`,
  TOKEN: `${API_BASE_URL}/api/auth/token`,
  
  // Sweets endpoints
  SWEETS_LIST: `${API_BASE_URL}/api/sweets`,
  SWEETS_SEARCH: `${API_BASE_URL}/api/sweets/search`,
  SWEET_DETAIL: (id) => `${API_BASE_URL}/api/sweets/${id}`,
  SWEET_CREATE: `${API_BASE_URL}/api/sweets`,
  SWEET_UPDATE: (id) => `${API_BASE_URL}/api/sweets/${id}`,
  SWEET_DELETE: (id) => `${API_BASE_URL}/api/sweets/${id}`,
  SWEET_PURCHASE: `${API_BASE_URL}/api/sweets/purchase`,
  SWEET_RESTOCK: `${API_BASE_URL}/api/sweets/restock`,
};

export { API_BASE_URL, API_ENDPOINTS };
