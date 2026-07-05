/**
 * adminOrderService.ts — Donald Gros E-commerce
 *
 * Toutes les interactions avec les endpoints /api/admin/orders
 * Le token JWT admin est géré automatiquement par l'interceptor Axios dans api.ts
 */

import api from './api';

// ─── Types miroir du backend ──────────────────────────────────────────────────

export type OrderStatus =
  | 'pending_payment'
  | 'payment_failed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'pending_cod';

export interface OrderTransition {
  status: OrderStatus;
  label: string;
}

export interface OrderClient {
  fullName: string;
  phone: string;
  city: string;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentMethod: string;
  totalAmount: number;
  itemsCount: number;
  createdAt: string;
  client: OrderClient | null;
  paymentStatus: string | null;
  isCod: boolean;
}

export interface OrderStats {
  pending_payment: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  pending_cod: number;
  payment_failed: number;
}

export interface OrderListResponse {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: OrderStats;
}

// ─── Détail complet d'une commande ───────────────────────────────────────────

export interface OrderDetailItem {
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDeliveryAddress {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string | null;
  instructions: string | null;
  formatted: string;
}

export interface OrderPayment {
  provider: string;
  providerLabel: string;
  amount: number;
  status: string;
  depositId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  confirmedAt: string | null;
}

export interface OrderUser {
  id: number;
  fullName: string;
  phone: string;
}

export interface OrderDetail {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  paymentMethod: string;
  itemsTotal: number;
  deliveryFee: number;
  paymentFee: number;
  discountAmount: number;
  totalAmount: number;
  promoCodeUsed: string | null;
  adminNotes: string | null;
  createdAt: string;
  availableTransitions: OrderTransition[];
  items: OrderDetailItem[];
  deliveryAddress: OrderDeliveryAddress | null;
  payment: OrderPayment | null;
  user: OrderUser | null;
}

// ─── Filtres ─────────────────────────────────────────────────────────────────

export interface OrderFilters {
  status?: string;
  paymentMethod?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ─── Response Symfony générique ───────────────────────────────────────────────

interface SymfonyResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * GET /api/admin/orders — Liste paginée avec filtres
 */
export const fetchOrders = async (filters: OrderFilters = {}): Promise<OrderListResponse> => {
  const params = new URLSearchParams();
  if (filters.status)        params.set('status', filters.status);
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
  if (filters.search)        params.set('search', filters.search);
  if (filters.dateFrom)      params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo)        params.set('dateTo', filters.dateTo);
  if (filters.page)          params.set('page', String(filters.page));
  if (filters.limit)         params.set('limit', String(filters.limit));

  const { data } = await api.get<SymfonyResponse<OrderListResponse>>(
    `/api/admin/orders?${params.toString()}`
  );
  return data.data;
};

/**
 * GET /api/admin/orders/{id} — Détail complet
 */
export const fetchOrderDetail = async (id: number): Promise<OrderDetail> => {
  const { data } = await api.get<SymfonyResponse<OrderDetail>>(`/api/admin/orders/${id}`);
  return data.data;
};

/**
 * PATCH /api/admin/orders/{id}/status — Changer le statut
 */
export const updateOrderStatus = async (
  id: number,
  status: OrderStatus,
  note?: string
): Promise<{ id: number; orderNumber: string; status: OrderStatus; statusLabel: string }> => {
  const { data } = await api.patch<SymfonyResponse<{
    id: number;
    orderNumber: string;
    status: OrderStatus;
    statusLabel: string;
  }>>(`/api/admin/orders/${id}/status`, { status, ...(note ? { note } : {}) });
  return data.data;
};

/**
 * PATCH /api/admin/orders/{id}/notes — Mettre à jour les notes internes
 */
export const updateOrderNotes = async (id: number, notes: string): Promise<void> => {
  await api.patch(`/api/admin/orders/${id}/notes`, { notes });
};

/**
 * PATCH /api/admin/orders/{id}/confirm-cod — Confirmer un paiement à la livraison
 */
export const confirmCodOrder = async (id: number): Promise<void> => {
  await api.patch(`/api/admin/orders/${id}/confirm-cod`);
};
