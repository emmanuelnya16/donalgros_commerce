import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
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
}

interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager';
}

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
  user: { name: string; email: string } | null;
  adminUser: AdminUser | null;
  orders: Order[];
  addresses: Address[];
  reviews: Review[];
  categories: Category[];
  promotions: Promotion[];
  settings: StoreSettings;
  language: Language;
  
  // Client Actions
  setLanguage: (lang: Language) => void;
  addToCart: (product: Product, quantity?: number, options?: { color?: string; size?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  toggleWishlist: (product: Product) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  getProductById: (id: string) => Product | undefined;
  clearCart: () => void;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;

  // Admin Actions
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  moderateReview: (reviewId: string, status: 'approved' | 'rejected') => void;
  upsertPromotion: (promotion: Promotion) => void;
  updateSettings: (settings: StoreSettings) => void;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'c1',
    name: 'Chemise Slim Fit Premium',
    brand: 'Donald Gros',
    price: 25000,
    originalPrice: 32000,
    rating: 4.5,
    reviewsCount: 28,
    image: 'https://images.unsplash.com/photo-1596755094514-f87034a764c1?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87034a764c1?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 15,
    category: 'homme',
    description: "Une chemise élégante conçue pour l'homme moderne.",
    specifications: { "Matière": "100% Coton", "Coupe": "Slim Fit" },
    variations: {
      colors: [{ name: 'Blanc', hex: '#FFFFFF' }, { name: 'Bleu', hex: '#1e3a8a' }],
      sizes: ['S', 'M', 'L', 'XL']
    }
  },
  {
    id: 'c2',
    name: 'T-shirt Graphic Essentials',
    brand: 'Adidas',
    price: 15000,
    rating: 4.2,
    reviewsCount: 12,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop'],
    stock: 50,
    category: 'homme',
    description: "Confortable et stylé pour un look décontracté.",
    specifications: { "Matière": "Coton", "Style": "Casual" }
  },
  {
    id: 'c3',
    name: 'Nike Air Max 270',
    brand: 'Nike',
    price: 95000,
    originalPrice: 110000,
    rating: 4.9,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop'],
    stock: 20,
    category: 'chaussures',
    description: "L'icône du confort et du style urbain.",
    specifications: { "Matière": "Synthétique", "Usage": "Sport/Lifestyle" },
    variations: { sizes: ['40', '41', '42', '43', '44'] }
  },
  {
    id: 'c4',
    name: 'Réfrigérateur Smart LG Side-by-Side',
    brand: 'LG',
    price: 450000,
    rating: 4.7,
    reviewsCount: 45,
    image: 'https://images.unsplash.com/photo-1571175484658-5121485ff363?q=80&w=1200&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1571175484658-5121485ff363?q=80&w=1200&auto=format&fit=crop'],
    stock: 5,
    category: 'electromenager',
    description: "Innovation technologique pour votre cuisine.",
    specifications: { "Capacité": "600 Litres", "Classe": "A++" }
  },
  {
    id: 'c5',
    name: 'Blazer Élégant Femme',
    brand: 'Zara',
    price: 45000,
    rating: 4.6,
    reviewsCount: 22,
    image: 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=1200&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=1200&auto=format&fit=crop'],
    stock: 12,
    category: 'femme',
    description: "Le must-have pour vos soirées et rendez-vous professionnels.",
    specifications: { "Matière": "Polyester/Laine", "Coupe": "Cintrée" },
    variations: { sizes: ['36', '38', '40', '42'] }
  },
  {
    id: 'c6',
    name: 'Machine à laver Samsung EcoBubble',
    brand: 'Samsung',
    price: 320000,
    rating: 4.5,
    reviewsCount: 30,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop'],
    stock: 8,
    category: 'electromenager',
    description: "Lavage efficace à basse température.",
    specifications: { "Capacité": "9kg", "Classe": "A+++" }
  },
  {
    id: 'c7',
    name: 'Jeans Slim Fit Dark Blue',
    brand: 'Massimo Dutti',
    price: 35000,
    rating: 4.4,
    reviewsCount: 18,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200&auto=format&fit=crop'],
    stock: 25,
    category: 'homme',
    description: "Un classique indémodable pour toutes les occasions.",
    specifications: { "Matière": "Denim", "Coupe": "Slim" },
    variations: { sizes: ['30', '32', '34', '36'] }
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '#DG-2025-4512',
      date: '12 Janvier 2025, 14:30',
      items: [
        { ...INITIAL_PRODUCTS[0], quantity: 1, selectedSize: 'M', selectedColor: 'Bleu' },
        { ...INITIAL_PRODUCTS[2], quantity: 1, selectedSize: '42' }
      ],
      total: 121500,
      status: 'Livré',
      paymentMode: 'now',
      paymentStatus: 'payé',
      address: { city: 'Douala', district: 'Akwa', details: 'Face Boulangerie Z' }
    },
    {
      id: '#DG-2025-8901',
      date: '02 Février 2025, 10:15',
      items: [
        { ...INITIAL_PRODUCTS[1], quantity: 2 }
      ],
      total: 31500,
      status: 'En préparation',
      paymentMode: 'delivery',
      paymentStatus: 'en attente',
      address: { city: 'Yaoundé', district: 'Bastos', details: 'Immeuble ABC' }
    }
  ]);
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 'addr-1', label: 'Domicile', name: 'Jean Dupont', phone: '677000000', city: 'Douala', district: 'Bonapriso', details: 'Rue 1.234' },
    { id: 'addr-2', label: 'Bureau', name: 'Jean Dupont', phone: '699000000', city: 'Douala', district: 'Akwa', details: 'Immeuble Liberté' }
  ]);
  const [reviews, setReviews] = useState<Review[]>([
    { id: 'rev-1', productId: 'c1', productName: 'Chemise Slim Fit', userName: 'Marc A.', rating: 5, title: 'Superbe !', comment: 'Qualité au rendez-vous.', date: '12/01/2025', status: 'approved', isVerifiedPurchase: true },
    { id: 'rev-2', productId: 'c3', productName: 'Nike Air Max 270', userName: 'Saliou B.', rating: 4, title: 'Top', comment: 'Très confortable.', date: '15/01/2025', status: 'pending', isVerifiedPurchase: true }
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'homme', name: 'Homme', parentId: null, productCount: 3 },
    { id: 'femme', name: 'Femme', parentId: null, productCount: 1 },
    { id: 'chaussures', name: 'Chaussures', parentId: null, productCount: 1 },
    { id: 'electromenager', name: 'Électroménager', parentId: null, productCount: 2 },
  ]);
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 'promo-1', code: 'BONJOUR25', type: 'percentage', value: 10, currentUses: 45, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active' }
  ]);
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

  const getProductById = (id: string) => products.find(p => p.id === id);

  const addToCart = (product: Product, quantity: number = 1, options?: { color?: string; size?: string }) => {
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
      return [...prev, { 
        ...product, 
        quantity, 
        selectedColor: options?.color, 
        selectedSize: options?.size 
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

  const login = (name: string, email: string) => setUser({ name, email });
  const logout = () => setUser(null);

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
  const adminLogin = (email: string, password: string) => {
    if (email === 'admin@donaldgros.com' && password === 'admin123') {
      setAdminUser({ id: 'adm1', name: 'Donald Gros', email, role: 'super_admin' });
      return true;
    }
    return false;
  };

  const adminLogout = () => setAdminUser(null);

  const upsertProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.map(p => p.id === product.id ? product : p);
      return [product, ...prev];
    });
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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

  return (
    <AppContext.Provider value={{ 
      cart, wishlist, user, adminUser, products,
      orders, addresses, reviews, categories, promotions, settings, language,
      setLanguage,
      addToCart, removeFromCart, updateQuantity, 
      toggleWishlist, login, logout, getProductById,
      clearCart, addOrder, addAddress, removeAddress,
      adminLogin, adminLogout, upsertProduct, deleteProduct,
      updateOrderStatus, moderateReview, upsertPromotion, updateSettings
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
