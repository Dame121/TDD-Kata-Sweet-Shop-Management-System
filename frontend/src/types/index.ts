// Shared types for dashboard components

import { User } from '../auth/jwtService';

export interface Sweet {
  sweet_id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  quantity_in_stock: number;
  image_url?: string;
  image_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  transaction_id: number;
  sweet_id: number;
  user_id?: number;
  transaction_type: 'purchase' | 'restock';
  quantity: number;
  price_at_time: number;
  created_at: string;
}

export interface DashboardProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export type MessageType = 'success' | 'error' | 'info' | '';
