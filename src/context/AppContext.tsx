import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, userLogin, userRegister, userLogout, getMe, LoginPayload, RegisterPayload } from '../services/authService';
import { AuthAdmin, adminLogin as apiAdminLogin, adminLogout as apiAdminLogout, AdminLoginPayload, getAdminMe } from '../services/adminAuthService';
import { getPublicCategories, getPublicProducts, archiveAdminProduct } from '../services/catalogueService';
import api, { tokenStore } from '../services/api';

export interface Product {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeColor?: string;
  image: string;
  images: string[];
  stock: number;
  category: string;
  description: string;
  specifications: { [key: string]: string };
  variations?: {
    colors?: { name: string; hex: string }[];
    sizes?: string[];
  };
  variants?: {
    id: number;
    size?: string;
    color?: string;
    colorHex?: string;
    stock: number;
    effectivePrice: number;
    isInStock: boolean;
    isLowStock: boolean;
    label?: string;
  }[];
  status?: 'active' | 'draft' | 'archived';
}

interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  /** ID numérique de la variante Symfony — requis pour POST /api/orders */
  variantId?: number;
}

export type { CartItem };

export type OrderStatus = 'En attente' | 'Confirmé' | 'En préparation' | 'Expédié' | 'Livré' | 'Annulé' | 'Paiement échoué';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMode: 'now' | 'delivery';
  paymentStatus: 'payé' | 'en attente' | 'échoué';
  address: {
    city: string;
    district: string;
    details: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parentId: string | null;
  image?: string;
  description?: string;
  productCount: number;
}

export interface Promotion {
  id: string;
  code?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxUses?: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'inactive';
  target?: { type: 'category' | 'product' | 'all'; id?: string };
}

export type AdminUser = AuthAdmin;

export interface StoreSettings {
  name: string;
  logo: string;
  email: string;
  phone: string;
  address: string;
  shipping: { city: string; price: number; delay: string }[];
  deliveryFreeThreshold: number;
  paymentKeys: { mtn: string; orange: string };
  socials: { facebook: string; instagram: string; whatsapp: string; tiktok: string };
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  city: string;
  district: string;
  details: string;
}

export type Language = 'fr' | 'en';

interface AppContextType {
  cart: CartItem[];
  wishlist: Product[];
  products: Product[];
  /** Utilisateur client connecté — données réelles du backend Symfony */
  user: AuthUser | null;
  adminUser: AdminUser | null;
  orders: Order[];
  addresses: Address[];
  reviews: Review[];
  categories: Category[];
  promotions: Promotion[];
  settings: StoreSettings;
  language: Language;
  /** true pendant la tentative de restauration de session au démarrage */
  authLoading: boolean;
  
  // Client Actions
  setLanguage: (lang: Language) => void;
  addToCart: (product: Product, quantity?: number, options?: { color?: string; size?: string; variantId?: number }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleWishlist: (product: Product) => void;
  /** Connexion réelle : appelle POST /api/auth/login */
  login: (payload: LoginPayload) => Promise<void>;
  /** Inscription réelle : appelle POST /api/auth/register */
  register: (payload: RegisterPayload) => Promise<void>;
  /** Déconnexion réelle : appelle POST /api/auth/logout */
  logout: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  clearCart: () => void;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;

  // Admin Actions
  /** Connexion admin réelle : appelle POST /api/admin/auth/login */
  adminLogin: (payload: AdminLoginPayload) => Promise<void>;
  /** Déconnexion admin réelle : appelle POST /api/admin/auth/logout */
  adminLogout: () => Promise<void>;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  moderateReview: (reviewId: string, status: 'approved' | 'rejected') => void;
  upsertPromotion: (promotion: Promotion) => void;
  updateSettings: (settings: StoreSettings) => void;
  refreshCatalog: () => Promise<void>;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [language, setLanguage] = useState<Language>('fr');
  const [settings, setSettings] = useState<StoreSettings>({
    name: 'Donald Gros',
    logo: '/logo.png',
    email: 'contact@donaldgros.com',
    phone: '+237 600 000 000',
    address: 'Douala, Cameroun',
    shipping: [
      { city: 'Douala', price: 1500, delay: '1-2 jours' },
      { city: 'Yaoundé', price: 3000, delay: '2-3 jours' },
      { city: 'Bafoussam', price: 4500, delay: '3-4 jours' },
    ],
    deliveryFreeThreshold: 200000,
    paymentKeys: { mtn: '***', orange: '***' },
    socials: { facebook: '#', instagram: '#', whatsapp: '#', tiktok: '#' }
  });

  // ─── Restauration de session au démarrage ───────────────────────────────────────────
  // Stratégie : UN SEUL appel POST /api/auth/refresh au démarrage.
  // Le backend retourne soit { user, accessToken } soit { admin, accessToken }.
  // On détecte le type et on évite la double-révocation du cookie.
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      try {
        // Appel unique au refresh — récupère le nouveau token + type d'utilisateur
        const { data: refreshData } = await api.post<{
          success: boolean;
          data: { accessToken: string; user?: AuthUser; admin?: AuthAdmin };
        }>('/api/auth/refresh');

        const { accessToken, user: restoredUser, admin: restoredAdmin } = refreshData.data;
        tokenStore.set(accessToken);

        if (!cancelled) {
          if (restoredUser) {
            // C'est un utilisateur client
            setUser(restoredUser);
          } else if (restoredAdmin) {
            // C'est un administrateur — on récupère le profil admin complet
            setAdminUser(restoredAdmin);
          }
        }
      } catch {
        // Pas de cookie valide — l'utilisateur n'est pas connecté, c'est normal
        tokenStore.clear();
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    };
    restore();

    // Écoute les événements de déconnexion forcée (ex: refresh token expiré)
    const handleForceLogout = () => {
      setUser(null);
      setAdminUser(null);
    };
    window.addEventListener('auth:logout', handleForceLogout);

    return () => {
      cancelled = true;
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, []);

  // ─── Chargement initial du catalogue (produits & catégories) ────────────
  useEffect(() => {
    let cancelled = false;
    const loadCatalog = async () => {
      try {
        const [cats, prodData] = await Promise.all([
          getPublicCategories(),
          getPublicProducts({ limit: 100 })
        ]);
        if (!cancelled) {
          setCategories(cats);
          setProducts(prodData.products);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du catalogue:', err);
      }
    };
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const getProductById = (idOrSlug: string) => products.find(p => p.id === idOrSlug || p.slug === idOrSlug);

  const addToCart = (product: Product, quantity: number = 1, options?: { color?: string; size?: string; variantId?: number }) => {
    setCart(prev => {
      const existing = prev.find(item =>
        item.id === product.id &&
        item.selectedColor === options?.color &&
        item.selectedSize === options?.size
      );
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedColor === options?.color && item.selectedSize === options?.size)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // ─── Résolution du variantId ──────────────────────────────────────
      // Si le variantId n'est pas fourni explicitement (ex: ajout rapide
      // depuis la liste de produits), on cherche la variante correspondante
      // dans product.variants. Sinon, on prend la première disponible.
      let resolvedVariantId = options?.variantId;
      if (!resolvedVariantId && product.variants && product.variants.length > 0) {
        const matched = product.variants.find(v =>
          (!options?.color || v.color === options.color) &&
          (!options?.size  || v.size  === options.size)
        );
        resolvedVariantId = (matched ?? product.variants[0]).id;
      }

      return [...prev, {
        ...product,
        quantity,
        selectedColor: options?.color,
        selectedSize: options?.size,
        variantId: resolvedVariantId,
      }];
    });
  };


  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  /**
   * Connexion cliente réelle — appelle POST /api/auth/login
   * Lance une exception en cas d'erreur (gérée dans AuthPages)
   */
  const login = useCallback(async (payload: LoginPayload): Promise<void> => {
    const authUser = await userLogin(payload);
    setUser(authUser);
  }, []);

  /**
   * Inscription cliente réelle — appelle POST /api/auth/register
   */
  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    const authUser = await userRegister(payload);
    setUser(authUser);
  }, []);

  /**
   * Déconnexion réelle — révoque le refresh token en base + efface le cookie
   */
  const logout = useCallback(async (): Promise<void> => {
    await userLogout();
    setUser(null);
    setCart([]);
  }, []);

  const clearCart = () => setCart([]);

  const addOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `#DG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'En attente'
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addressData,
      id: `ADDR-${Math.floor(Math.random() * 1000000)}`
    };
    setAddresses(prev => [...prev, newAddress]);
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  // ADMIN ACTIONS
  const adminLoginFn = useCallback(async (payload: AdminLoginPayload): Promise<void> => {
    const admin = await apiAdminLogin(payload);
    setAdminUser(admin);
  }, []);

  const adminLogoutFn = useCallback(async (): Promise<void> => {
    await apiAdminLogout();
    setAdminUser(null);
  }, []);

  const upsertProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.map(p => p.id === product.id ? product : p);
      return [product, ...prev];
    });
  };

  const deleteProduct = async (id: string) => {
    try {
      await archiveAdminProduct(Number(id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Erreur lors de l'archivage du produit:", err);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const moderateReview = (reviewId: string, status: 'approved' | 'rejected') => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
  };

  const upsertPromotion = (promo: Promotion) => {
    setPromotions(prev => {
      const exists = prev.find(p => p.id === promo.id);
      if (exists) return prev.map(p => p.id === promo.id ? promo : p);
      return [promo, ...prev];
    });
  };

  const updateSettings = (newSettings: StoreSettings) => setSettings(newSettings);

  const refreshCatalog = async () => {
    try {
      const [cats, prodData] = await Promise.all([
        getPublicCategories(),
        getPublicProducts({ limit: 100 })
      ]);
      setCategories(cats);
      setProducts(prodData.products);
    } catch (err) {
      console.error('Erreur lors du rechargement du catalogue:', err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      cart, wishlist, user, adminUser, products,
      orders, addresses, reviews, categories, promotions, settings, language,
      authLoading,
      setLanguage,
      addToCart, removeFromCart, updateQuantity, 
      toggleWishlist, login, register, logout, getProductById,
      clearCart, addOrder, addAddress, removeAddress,
      adminLogin: adminLoginFn, adminLogout: adminLogoutFn, upsertProduct, deleteProduct,
      updateOrderStatus, moderateReview, upsertPromotion, updateSettings, refreshCatalog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
