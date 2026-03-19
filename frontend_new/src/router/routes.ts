/**
 * Route definitions for the application
 * This array can be used for dynamic route generation or navigation
 */

export interface RouteDefinition {
  path: string;
  name: string;
  element?: string;
  requiredRole?: 'user' | 'admin';
  isPublic?: boolean;
  meta?: {
    title?: string;
    description?: string;
  };
}

/**
 * Application routes array
 */
export const routes: RouteDefinition[] = [
  // Public Routes
  {
    path: '/',
    name: 'Home',
    isPublic: true,
    meta: {
      title: 'Sweet Shop Management System',
      description: 'Welcome to Sweet Shop Management',
    },
  },
  {
    path: '/auth',
    name: 'Authentication',
    isPublic: true,
    meta: {
      title: 'Login / Signup',
      description: 'Authenticate to access the system',
    },
  },

  // Protected Routes - Admin
  {
    path: '/admin',
    name: 'Admin Dashboard',
    element: 'AdminDashboard',
    requiredRole: 'admin',
    meta: {
      title: 'Admin Dashboard',
      description: 'Admin control panel',
    },
  },
  {
    path: '/admin/inventory',
    name: 'Inventory Management',
    element: 'InventoryManagement',
    requiredRole: 'admin',
    meta: {
      title: 'Inventory',
      description: 'Manage sweets inventory',
    },
  },
  {
    path: '/admin/users',
    name: 'User Management',
    element: 'UserManagement',
    requiredRole: 'admin',
    meta: {
      title: 'Users',
      description: 'Manage system users',
    },
  },
  {
    path: '/admin/transactions',
    name: 'Transactions',
    element: 'Transactions',
    requiredRole: 'admin',
    meta: {
      title: 'Transactions',
      description: 'View all transactions',
    },
  },

  // Protected Routes - User
  {
    path: '/dashboard',
    name: 'User Dashboard',
    element: 'UserDashboard',
    requiredRole: 'user',
    meta: {
      title: 'Dashboard',
      description: 'User dashboard',
    },
  },
  {
    path: '/dashboard/browse',
    name: 'Browse Sweets',
    element: 'BrowseSweets',
    requiredRole: 'user',
    meta: {
      title: 'Browse Sweets',
      description: 'Browse available sweets',
    },
  },
  {
    path: '/dashboard/purchases',
    name: 'My Purchases',
    element: 'MyPurchases',
    requiredRole: 'user',
    meta: {
      title: 'My Purchases',
      description: 'View your purchase history',
    },
  },

  // Error Routes
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    isPublic: true,
    meta: {
      title: 'Unauthorized',
      description: 'You do not have permission to access this page',
    },
  },
  {
    path: '*',
    name: 'Not Found',
    isPublic: true,
    meta: {
      title: '404 - Not Found',
      description: 'The page you are looking for does not exist',
    },
  },
];

/**
 * Get route by path
 */
export const getRouteByPath = (path: string): RouteDefinition | undefined => {
  return routes.find((route) => route.path === path);
};

/**
 * Get route by name
 */
export const getRouteByName = (name: string): RouteDefinition | undefined => {
  return routes.find((route) => route.name === name);
};

/**
 * Get public routes
 */
export const getPublicRoutes = (): RouteDefinition[] => {
  return routes.filter((route) => route.isPublic);
};

/**
 * Get protected routes by role
 */
export const getProtectedRoutes = (role: 'user' | 'admin'): RouteDefinition[] => {
  return routes.filter((route) => !route.isPublic && route.requiredRole === role);
};
