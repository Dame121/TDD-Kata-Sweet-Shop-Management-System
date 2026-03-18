import type { User } from '@auth/jwtService';

/**
 * Message types for UI notifications
 */
export type MessageType = 'success' | 'error' | 'info' | 'warning' | '';

/**
 * Sweet product interface
 */
export interface Sweet {
  id?: number;
  sweet_id?: number;
  name: string;
  category: string;
  price: number;
  quantity_in_stock: number;
  image?: string;
  image_url?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Dashboard component props
 */
export interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}
