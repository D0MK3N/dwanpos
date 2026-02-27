// types/dashboard.ts

export interface Payment {
  id: string;
  user_id: string;
  plan_type: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  litecoin_tx_id?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  is_active: boolean;
  expires_at: string;
  payment_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecentActivity {
  title: string;
  time: string;
}

export interface PricingOverview {
  free: number;
  standard: number;
  premium: number;
  totalRevenue: number;
}
