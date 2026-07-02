import api from './api';
import { Product, Category } from '../context/AppContext';

// ─── Interfaces de réponses de l'API Symfony ───────────────────────────────

interface SymfonyResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedProducts {
  products: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Mappers de conversion Backend -> Frontend ────────────────────────────────

export const mapCategoryFromBackend = (bCat: any): Category => {
  return {
    id: String(bCat.id),
    name: bCat.name,
    slug: bCat.slug,
    parentId: bCat.parent ? String(bCat.parent.id) : null,
    image: bCat.image || undefined,
    description: bCat.nameEn || undefined,
    productCount: bCat.productCount || 0,
  };
};

export const mapProductFromBackend = (bProd: any): Product => {
  // Images
  const images = Array.isArray(bProd.images)
    ? bProd.images.map((img: any) => img.url)
    : [];

  const image = bProd.mainImage
    ? (typeof bProd.mainImage === 'string' ? bProd.mainImage : bProd.mainImage.url)
    : (images[0] || '/placeholder.png');

  // Variantes / Tailles / Couleurs
  const sizesSet = new Set<string>();
  const colorsMap = new Map<string, string>(); // name -> hex

  if (Array.isArray(bProd.variants)) {
    bProd.variants.forEach((v: any) => {
      if (v.size) sizesSet.add(v.size);
      if (v.color && v.colorHex) {
        colorsMap.set(v.color, v.colorHex);
      }
    });
  } else {
    if (Array.isArray(bProd.availableSizes)) {
      bProd.availableSizes.forEach((s: string) => sizesSet.add(s));
    }
    if (Array.isArray(bProd.availableColors)) {
      bProd.availableColors.forEach((c: any) => {
        if (c && typeof c === 'object') {
          colorsMap.set(c.name, c.hex);
        } else if (typeof c === 'string') {
          colorsMap.set(c, '#000000');
        }
      });
    }
  }

  const variations = {
    sizes: Array.from(sizesSet),
    colors: Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }))
  };

  return {
    id: String(bProd.id),
    slug: bProd.slug,
    name: bProd.name,
    brand: 'Donald Gros', // Par défaut
    price: bProd.currentPrice ?? bProd.basePrice,
    originalPrice: bProd.isOnSale ? bProd.basePrice : undefined,
    rating: bProd.averageRating || 0,
    reviewsCount: bProd.reviewCount || 0,
    badge: bProd.isOnSale ? `-${bProd.discountPercent}%` : undefined,
    badgeColor: bProd.isOnSale ? 'bg-red-500' : undefined,
    image,
    images: images.length > 0 ? images : [image],
    stock: bProd.totalStock ?? (bProd.isInStock ? 50 : 0),
    category: bProd.category ? (typeof bProd.category === 'string' ? bProd.category : bProd.category.name) : '',
    description: bProd.shortDescription || bProd.longDescription || '',
    specifications: {},
    variations,
    variants: bProd.variants || [],
    status: bProd.status || 'draft',
  };
};

// ─── Fonctions API Publiques ──────────────────────────────────────────────────

export const getPublicCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>('/api/categories');
  
  const flatten = (cats: any[]): any[] => {
    let result: any[] = [];
    for (const c of cats) {
      result.push(c);
      if (c.children && Array.isArray(c.children)) {
        result = result.concat(flatten(c.children));
      }
    }
    return result;
  };
  
  return flatten(data.data || []).map(mapCategoryFromBackend);
};

export const getPublicProducts = async (params: {
  categorySlug?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStockOnly?: boolean;
  minRating?: number;
  search?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ products: Product[]; total: number; totalPages: number }> => {
  const { data } = await api.get<SymfonyResponse<PaginatedProducts>>('/api/products', { params });
  return {
    products: data.data.products.map(mapProductFromBackend),
    total: data.data.total,
    totalPages: data.data.totalPages,
  };
};

export const getPublicProductDetail = async (slug: string): Promise<Product> => {
  const { data } = await api.get<SymfonyResponse<any>>(`/api/products/${slug}`);
  return mapProductFromBackend(data.data);
};

export const getSimilarProducts = async (slug: string): Promise<Product[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>(`/api/products/${slug}/similar`);
  return data.data.map(mapProductFromBackend);
};

export const getNewArrivals = async (limit = 8): Promise<Product[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>(`/api/products/section/new-arrivals`, {
    params: { limit }
  });
  return data.data.map(mapProductFromBackend);
};

export const getBestSellers = async (limit = 8): Promise<Product[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>(`/api/products/section/best-sellers`, {
    params: { limit }
  });
  return data.data.map(mapProductFromBackend);
};

export const getOnSaleProducts = async (limit = 8): Promise<Product[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>(`/api/products/section/on-sale`, {
    params: { limit }
  });
  return data.data.map(mapProductFromBackend);
};

// ─── Fonctions API Admin ─────────────────────────────────────────────────────

export interface CategoryPayload {
  name: string;
  nameEn?: string;
  slug?: string;
  parentId?: number | null;
  position?: number;
  isActive?: boolean;
}

export interface ProductPayload {
  name: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  basePrice: number;
  promoPrice?: number | null;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
  categoryId: number;
  status?: 'active' | 'draft' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  variants?: Array<{
    size?: string;
    color?: string;
    colorHex?: string;
    stock?: number;
    alertThreshold?: number;
    extraPrice?: number;
    sku?: string;
    isActive?: boolean;
  }>;
}

export const getAdminCategories = async (): Promise<any[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>('/api/admin/categories');
  return data.data;
};

export const createAdminCategory = async (payload: CategoryPayload): Promise<any> => {
  const { data } = await api.post<SymfonyResponse<any>>('/api/admin/categories', payload);
  return data.data;
};

export const updateAdminCategory = async (id: number, payload: CategoryPayload): Promise<any> => {
  const { data } = await api.put<SymfonyResponse<any>>(`/api/admin/categories/${id}`, payload);
  return data.data;
};

export const deleteAdminCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/categories/${id}`);
};

export const getAdminProducts = async (): Promise<Product[]> => {
  const { data } = await api.get<SymfonyResponse<any[]>>('/api/admin/products');
  return data.data.map(mapProductFromBackend);
};

export const getAdminProductDetail = async (id: number): Promise<any> => {
  const { data } = await api.get<SymfonyResponse<any>>(`/api/admin/products/${id}`);
  return data.data;
};

export const createAdminProduct = async (payload: ProductPayload): Promise<Product> => {
  const { data } = await api.post<SymfonyResponse<any>>('/api/admin/products', payload);
  return mapProductFromBackend(data.data);
};

export const updateAdminProduct = async (id: number, payload: ProductPayload): Promise<Product> => {
  const { data } = await api.put<SymfonyResponse<any>>(`/api/admin/products/${id}`, payload);
  return mapProductFromBackend(data.data);
};

export const archiveAdminProduct = async (id: number): Promise<Product> => {
  const { data } = await api.patch<SymfonyResponse<any>>(`/api/admin/products/${id}/archive`);
  return mapProductFromBackend(data.data);
};

export const publishAdminProduct = async (id: number): Promise<Product> => {
  const { data } = await api.patch<SymfonyResponse<any>>(`/api/admin/products/${id}/publish`);
  return mapProductFromBackend(data.data);
};

// Gestion des images
export const uploadProductImage = async (productId: number, file: File, color?: string, isMain?: boolean): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);
  if (color) formData.append('color', color);
  if (isMain !== undefined) formData.append('isMain', String(isMain));

  const { data } = await api.post<SymfonyResponse<any>>(`/api/admin/products/${productId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};

export const setMainProductImage = async (productId: number, imageId: number): Promise<void> => {
  await api.patch(`/api/admin/products/${productId}/images/${imageId}/main`);
};

export const deleteProductImage = async (productId: number, imageId: number): Promise<void> => {
  await api.delete(`/api/admin/products/${productId}/images/${imageId}`);
};

export const reorderProductImages = async (productId: number, imageIds: number[]): Promise<void> => {
  await api.patch(`/api/admin/products/${productId}/images/reorder`, { order: imageIds });
};

// ─── Interfaces Commande ──────────────────────────────────────────────────────

export interface DeliveryAddressPayload {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  street?: string;
  instructions?: string;
}

export interface CreateOrderPayload {
  items: { variantId: number; quantity: number }[];
  paymentMethod: 'mtn_momo' | 'orange_money' | 'cash_on_delivery';
  payerPhone?: string | null;
  promoCode?: string | null;
  deliveryAddress: DeliveryAddressPayload;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  statusLabel: string;
  paymentMethod: string;
  itemsTotal: number;
  deliveryFee: number;
  paymentFee: number;
  discountAmount: number;
  totalAmount: number;
  promoCodeUsed: string | null;
  createdAt: string;
  items: {
    productName: string;
    variantLabel: string | null;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  deliveryAddress: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    street: string | null;
    instructions: string | null;
    formatted: string;
  } | null;
}

export interface PaymentStatusResponse {
  isFinal: boolean;
  orderStatus: string;
  paymentStatus: string | null;
  orderNumber: string;
  failureMessage: string | null;
  statusInfo: {
    title: string;
    message: string;
    color: 'info' | 'success' | 'error' | 'warning';
    instruction?: string;
  };
}

// ─── Fonctions API Commandes ──────────────────────────────────────────────────

/**
 * Crée une commande. Retourne { order, requiresPolling }.
 * Si requiresPolling = true → paiement mobile en cours → démarrer le polling.
 * Si requiresPolling = false → cash on delivery → afficher succès directement.
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<{
  order: OrderResponse;
  requiresPolling: boolean;
}> => {
  const { data } = await api.post<SymfonyResponse<{ order: OrderResponse; requiresPolling: boolean }>>(
    '/api/orders',
    payload
  );
  return data.data;
};

/**
 * Vérifie le statut du paiement mobile auprès de PawaPay.
 * Appelé en boucle (polling toutes les 3s) jusqu'à ce que isFinal = true.
 */
export const getPaymentStatus = async (orderId: number): Promise<PaymentStatusResponse> => {
  const { data } = await api.get<SymfonyResponse<PaymentStatusResponse>>(
    `/api/orders/${orderId}/payment-status`
  );
  return data.data;
};

/**
 * Récupère l'historique des commandes de l'utilisateur connecté.
 */
export const getMyOrderHistory = async (): Promise<OrderResponse[]> => {
  const { data } = await api.get<SymfonyResponse<{ orders: OrderResponse[] }>>(
    '/api/orders/me/history'
  );
  return data.data.orders || [];
};
