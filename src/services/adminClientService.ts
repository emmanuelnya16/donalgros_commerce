/**
 * adminClientService.ts — Donald Gros E-commerce
 *
 * Interactions avec les endpoints /api/admin/clients
 * Miroir exact du AdminClientController Symfony.
 * Le token JWT admin est géré automatiquement par l'interceptor Axios dans api.ts
 */

import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientStatus = 'active' | 'blocked';

/** Item dans la liste des clients */
export interface ClientListItem {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  city: string | null;
  status: ClientStatus;
  createdAt: string;       // ISO 8601
  ordersCount: number;
  totalSpent: number;
}

/** Fiche complète d'un client */
export interface ClientDetail {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  city: string | null;
  status: ClientStatus;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  orders: ClientOrder[];
}

/** Résumé d'une commande dans la fiche client */
export interface ClientOrder {
  id: number;
  orderNumber: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  createdAt: string;
}

/** Réponse liste paginée */
export interface ClientListResponse {
  clients: ClientListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Filtres disponibles pour GET /api/admin/clients */
export interface ClientFilters {
  search?: string;
  status?: ClientStatus | '';
  city?: string;
  page?: number;
  limit?: number;
}

/** Response Symfony générique */
interface SymfonyResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/clients — Liste complète avec filtres
 */
export const fetchClients = async (
  filters: ClientFilters = {}
): Promise<ClientListResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.city)   params.set('city', filters.city);
  if (filters.page)   params.set('page', String(filters.page));
  if (filters.limit)  params.set('limit', String(filters.limit));

  const { data } = await api.get<SymfonyResponse<ClientListResponse>>(
    `/api/admin/clients?${params.toString()}`
  );
  return data.data;
};

/**
 * GET /api/admin/clients/{id} — Fiche client complète avec ses commandes
 */
export const fetchClientDetail = async (id: number): Promise<ClientDetail> => {
  const { data } = await api.get<SymfonyResponse<ClientDetail>>(
    `/api/admin/clients/${id}`
  );
  return data.data;
};

/**
 * PATCH /api/admin/clients/{id}/block — Bloquer un compte client
 */
export const blockClient = async (
  id: number
): Promise<{ id: number; status: ClientStatus }> => {
  const { data } = await api.patch<
    SymfonyResponse<{ id: number; status: ClientStatus }>
  >(`/api/admin/clients/${id}/block`);
  return data.data;
};

/**
 * PATCH /api/admin/clients/{id}/unblock — Débloquer un compte client
 */
export const unblockClient = async (
  id: number
): Promise<{ id: number; status: ClientStatus }> => {
  const { data } = await api.patch<
    SymfonyResponse<{ id: number; status: ClientStatus }>
  >(`/api/admin/clients/${id}/unblock`);
  return data.data;
};
