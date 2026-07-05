import api from './api';
import { Review } from '../context/AppContext';
import { mapReviewFromBackend } from './reviewService';

export interface AdminReviewsListResponse {
  reviews: Review[];
  total: number;
  pendingCount: number;
}

/**
 * Récupère tous les avis pour l'administration (avec filtres de statut et produit).
 * status peut être 'pending', 'published', 'rejected'.
 */
export const getAdminReviews = async (
  status = 'pending',
  productId?: number
): Promise<AdminReviewsListResponse> => {
  const params: any = { status };
  if (productId) params.productId = productId;

  const { data } = await api.get('/api/admin/reviews', { params });
  const responseData = data.data;

  return {
    reviews: Array.isArray(responseData.reviews) ? responseData.reviews.map(mapReviewFromBackend) : [],
    total: Number(responseData.total || 0),
    pendingCount: Number(responseData.pendingCount || 0),
  };
};

/**
 * Publie un avis client (le rend visible sur la fiche produit publique).
 */
export const publishReview = async (
  reviewId: number
): Promise<{ id: string; status: string }> => {
  const { data } = await api.patch(`/api/admin/reviews/${reviewId}/publish`);
  return {
    id: String(data.data.id),
    status: data.data.status,
  };
};

/**
 * Rejette un avis client (raison facultative).
 */
export const rejectReview = async (
  reviewId: number,
  reason?: string
): Promise<{ id: string; status: string }> => {
  const { data } = await api.patch(`/api/admin/reviews/${reviewId}/reject`, {
    reason,
  });
  return {
    id: String(data.data.id),
    status: data.data.status,
  };
};

/**
 * Supprime définitivement un avis de la base (Super Admin).
 */
export const deleteReview = async (reviewId: number): Promise<boolean> => {
  const { data } = await api.delete(`/api/admin/reviews/${reviewId}`);
  return !!data.success;
};
