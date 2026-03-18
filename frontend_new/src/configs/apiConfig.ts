// API Configuration

interface ProcessEnv {
  VITE_API_URL?: string;
}

declare const process: {
  env: ProcessEnv;
};

export interface APIEndpoints {
  REGISTER: string;
  LOGIN: string;
  ME: string;
  TOKEN: string;
  USERS_LIST: string;
  USER_DETAIL: (id: number) => string;
  USER_UPDATE: (id: number) => string;
  USER_DELETE: (id: number) => string;
  ADMIN_REGISTER: string;
  SWEETS_LIST: string;
  SWEETS_SEARCH: string;
  SWEET_DETAIL: (id: number) => string;
  SWEET_CREATE: string;
  SWEET_UPDATE: (id: number) => string;
  SWEET_DELETE: (id: number) => string;
  SWEET_BY_CATEGORY: (category: string) => string;
  SWEET_PURCHASE: (id: number) => string;
  SWEET_RESTOCK: (id: number) => string;
  SWEET_IMAGE_UPDATE: (id: number) => string;
  SWEET_IMAGE_DELETE: (id: number) => string;
}

const API_BASE_URL: string = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

const API_ENDPOINTS: APIEndpoints = {
  // Auth endpoints (v1)
  REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
  LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
  ME: `${API_BASE_URL}/api/v1/auth/me`,
  TOKEN: `${API_BASE_URL}/api/v1/auth/token`,
  USERS_LIST: `${API_BASE_URL}/api/v1/auth/users`,
  USER_DETAIL: (id: number) => `${API_BASE_URL}/api/v1/auth/users/${id}`,
  USER_UPDATE: (id: number) => `${API_BASE_URL}/api/v1/auth/users/${id}`,
  USER_DELETE: (id: number) => `${API_BASE_URL}/api/v1/auth/users/${id}`,
  ADMIN_REGISTER: `${API_BASE_URL}/api/v1/auth/admins/register`,
  
  // Sweets endpoints (v1)
  SWEETS_LIST: `${API_BASE_URL}/api/v1/sweets`,
  SWEETS_SEARCH: `${API_BASE_URL}/api/v1/sweets/search`,
  SWEET_DETAIL: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}`,
  SWEET_CREATE: `${API_BASE_URL}/api/v1/sweets`,
  SWEET_UPDATE: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}`,
  SWEET_DELETE: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}`,
  SWEET_BY_CATEGORY: (category: string) => `${API_BASE_URL}/api/v1/sweets/category/${category}`,
  SWEET_PURCHASE: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}/purchase`,
  SWEET_RESTOCK: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}/restock`,
  SWEET_IMAGE_UPDATE: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}/image`,
  SWEET_IMAGE_DELETE: (id: number) => `${API_BASE_URL}/api/v1/sweets/${id}/image`,
};

export { API_BASE_URL, API_ENDPOINTS };
