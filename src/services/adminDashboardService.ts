/**
 * adminDashboardService.ts — Donald Gros E-commerce
 * Appelle GET /api/admin/dashboard pour récupérer toutes les métriques réelles.
 */

import api from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  revenueToday: number;
  revenueYesterday: number;
  ordersToday: number;
  newClientsThisMonth: number;
  outOfStock: number;
  lowStock: number;
  avgOrderValue: number;
  mobilePaymentRate: number;
}

export interface OrdersByStatus {
  pending_payment: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  pending_cod: number;
  payment_failed: number;
}

export interface RevenuePoint {
  day: string;
  label: string;
  amount: number;
}

export interface LatestOrder {
  id: number;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  client: { fullName: string; phone: string } | null;
  paymentStatus: string | null;
}

export interface TopProduct {
  id: number;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  salesCount: number;
  category: string | null;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  ordersByStatus: OrdersByStatus;
  revenueChart: RevenuePoint[];
  latestOrders: LatestOrder[];
  topProducts: TopProduct[];
}

interface SymfonyResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<SymfonyResponse<DashboardData>>('/api/admin/dashboard');
  return data.data;
};
