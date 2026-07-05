import api from './api';
import { Review } from '../context/AppContext';

export interface PublicReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number | null;
  distribution: { [key: number]: number };
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Mappe un avis du format Backend Symfony vers le format attendu par le Frontend.
 * Fait la transition entre 'body' (backend), 'comment' (AdminReviews) et 'text' (ProductDetailPage).
 * Mappe aussi 'published' (backend) vers 'approved' (frontend).
 */
export const mapReviewFromBackend = (bReview: any): Review => {
  const isVerifiedPurchase = !!bReview.purchasedVariant;

  return {
    id: String(bReview.id),
    productId: bReview.product ? String(bReview.product.id) : '',
    productName: bReview.product ? bReview.product.name : '',
    userName: bReview.author ? bReview.author.name || bReview.author.fullName : 'Client anonyme',
    rating: Number(bReview.rating),
    title: bReview.title || '',
    comment: bReview.body || '', // pour AdminReviews
    text: bReview.body || '',    // pour ProductDetailPage
    date: bReview.createdAt || '',
    status: bReview.status === 'published' ? 'approved' : bReview.status,
    isVerifiedPurchase,
    purchasedVariant: bReview.purchasedVariant || null,
    rejectionReason: bReview.rejectionReason || null,
    helpfulVotes: Number(bReview.helpfulVotes || 0),
  };
};

/**
 * Récupère les avis publiés pour un produit.
 */
export const getProductReviews = async (slug: string, page = 1, limit = 10): Promise<PublicReviewsResponse> => {
  const { data } = await api.get(`/api/products/${slug}/reviews`, {
    params: { page, limit },
  });

  const responseData = data.data;

  return {
    reviews: Array.isArray(responseData.reviews) ? responseData.reviews.map(mapReviewFromBackend) : [],
    total: Number(responseData.total || 0),
    averageRating: responseData.averageRating ? Number(responseData.averageRating) : null,
    distribution: responseData.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    page: Number(responseData.page || 1),
    limit: Number(responseData.limit || 10),
    totalPages: Number(responseData.totalPages || 0),
  };
};

/**
 * Soumet un nouvel avis client sur un produit.
 */
export const submitReview = async (
  productId: number,
  rating: number,
  title: string,
  body: string
): Promise<{ success: boolean; message: string; reviewId: string; status: string }> => {
  const { data } = await api.post('/api/reviews', {
    productId,
    rating,
    title,
    body,
  });

  return {
    success: data.success,
    message: data.message,
    reviewId: String(data.data.id),
    status: data.data.status,
  };
};

/**
 * Ajoute un vote "utile" à un avis.
 */
export const voteHelpful = async (reviewId: number): Promise<number> => {
  const { data } = await api.post(`/api/reviews/${reviewId}/helpful`);
  return Number(data.data.helpfulVotes);
};
