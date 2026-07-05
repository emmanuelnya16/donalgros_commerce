/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useAppContext, Product } from './context/AppContext';
import { TopBar, BenefitBar, PromotionalMarquee } from './components/PromoBands';
import { Header } from './components/Header';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, Heart, Package, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';
import { PageLoader, SkeletonSection, SkeletonCategoryRow } from './components/LoadingComponents';
import { getNewArrivals, getBestSellers } from './services/catalogueService';
import { retryWithBackoff } from './services/api';

// ─── Lazy-loaded heavy page components ───
const HeroBanner = React.lazy(() => import('./components/HeroBanner').then(m => ({ default: m.HeroBanner })));
const CategoryGrid = React.lazy(() => import('./components/HeroBanner').then(m => ({ default: m.CategoryGrid })));
const ProductSection = React.lazy(() => import('./components/ProductSection').then(m => ({ default: m.ProductSection })));
const IntermediaryBanner = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.IntermediaryBanner })));
const ApplianceSection = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.ApplianceSection })));
const ReassuranceBlock = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.ReassuranceBlock })));
const Newsletter = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.Newsletter })));
const Footer = React.lazy(() => import('./components/MainLayout').then(m => ({ default: m.Footer })));
const AuthPages = React.lazy(() => import('./components/AuthPages').then(m => ({ default: m.AuthPages })));
const CataloguePage = React.lazy(() => import('./components/CataloguePage').then(m => ({ default: m.CataloguePage })));
const ProductDetailPage = React.lazy(() => import('./components/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CheckoutTunnel = React.lazy(() => import('./components/CheckoutTunnel').then(m => ({ default: m.CheckoutTunnel })));
const CustomerSpace = React.lazy(() => import('./components/CustomerSpace').then(m => ({ default: m.CustomerSpace })));
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));

function HomePage() {
  const { language, catalogLoading } = useAppContext();
  const [newArrivals, setNewArrivals] = React.useState<Product[]>([]);
  const [bestSellers, setBestSellers] = React.useState<Product[]>([]);
  const [sectionsLoading, setSectionsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchSections = async () => {
      try {
        // Décalage de 300ms pour laisser le catalogue se charger en premier
        // et ne pas saturer Symfony avec trop de requêtes simultanées
        await new Promise((r) => setTimeout(r, 300));
        if (!active) return;

        // Retry automatique en cas d'erreur réseau (serveur pas encore prêt)
        const [arrivals, sellers] = await retryWithBackoff(() =>
          Promise.all([
            getNewArrivals(8),
            getBestSellers(8),
          ])
        );
        if (active) {
          setNewArrivals(arrivals);
          setBestSellers(sellers);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des sections accueil (toutes tentatives échouées):', err);
      } finally {
        if (active) setSectionsLoading(false);
      }
    };
    fetchSections();
    return () => { active = false; };
  }, []);

  return (
    <>
      <React.Suspense fallback={<PageLoader message="Chargement…" />}>
        <HeroBanner />
      </React.Suspense>
      <PromotionalMarquee />
      <React.Suspense fallback={<div className="h-40" />}>
        {catalogLoading ? <SkeletonCategoryRow count={7} /> : <CategoryGrid />}
      </React.Suspense>
      
      {sectionsLoading ? (
        <>
          <SkeletonSection count={5} />
          <SkeletonSection count={5} />
        </>
      ) : (
        <>
          <React.Suspense fallback={<SkeletonSection count={5} />}>
            <ProductSection 
              title={language === 'fr' ? "Nouveaux Arrivages" : "New Arrivals"} 
              subtitle={language === 'fr' ? "Les dernières pièces ajoutées au catalogue" : "The latest items added to the catalog"} 
              products={newArrivals} 
              badgeType={language === 'fr' ? "NOUVEAU" : "NEW"}
            />
          </React.Suspense>
          <React.Suspense fallback={<div className="h-60" />}>
            <IntermediaryBanner />
          </React.Suspense>
          <React.Suspense fallback={<SkeletonSection count={5} />}>
            <ProductSection 
              title={language === 'fr' ? "Meilleures Ventes" : "Best Sellers"} 
              subtitle={language === 'fr' ? "Les produits les plus populaires de la semaine" : "The most popular products of the week"} 
              products={bestSellers} 
              badgeType={language === 'fr' ? "TOP VENTE" : "TOP SELLER"}
            />
          </React.Suspense>
        </>
      )}

      <React.Suspense fallback={<div className="h-60" />}>
        <div className="bg-light-gray/30">
          <ApplianceSection />
        </div>
      </React.Suspense>
      <React.Suspense fallback={<div className="h-40" />}>
        <ReassuranceBlock />
        <Newsletter />
      </React.Suspense>
    </>
  );
}


function CartPage() {
  const { cart, removeFromCart, updateQuantity, language } = useAppContext();
  const t = translations[language];
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <ShoppingCart className="w-24 h-24 text-light-gray mx-auto mb-6" />
          <h2 className="text-3xl font-display font-black text-dark-gray mb-4">
            {t.emptyCartTitle}
          </h2>
          <p className="text-medium-gray mb-8">
            {t.emptyCartDesc}
          </p>
          <button onClick={() => window.location.hash = ''} className="h-14 px-10 bg-primary-blue text-white font-bold rounded-lg shadow-xl hover:bg-dark-gray transition-colors">
            {t.discoverProducts}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center gap-2 mb-8">
        <button onClick={() => window.location.hash = ''} className="p-2 hover:bg-light-gray rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-display font-black">
          {t.myCart}{' '}
          <span className="text-medium-gray font-normal">
            ({cart.length} {t.items})
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {cart.map(item => (
            <motion.div 
              layout
              key={`${item.id}-${item.selectedColor || 'no-color'}-${item.selectedSize || 'no-size'}`} 
              className="bg-white p-3 md:p-6 rounded-xl border border-light-gray flex gap-4 md:gap-6 relative group"
            >
              <div className="w-24 md:w-32 h-24 md:h-32 bg-light-gray rounded-lg overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-display font-bold text-sm md:text-lg text-dark-gray truncate">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-medium-gray hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-medium-gray mb-3">{item.brand}</p>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 bg-light-gray h-8 md:h-10 px-1.5 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded transition-colors"><Minus className="w-3 md:w-4 h-3 md:h-4" /></button>
                    <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded transition-colors"><Plus className="w-3 md:w-4 h-3 md:h-4" /></button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] md:text-sm text-medium-gray line-through decoration-red-300">{(item.price * 1.2).toLocaleString()} FCFA</p>
                    <p className="text-base md:text-xl font-display font-bold text-primary-blue">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <button onClick={() => window.location.hash = ''} className="text-primary-blue font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" /> {t.continueShopping}
          </button>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-xl border border-light-gray shadow-sm sticky top-24">
            <h3 className="text-xl font-display font-bold mb-6">{t.summary}</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-medium-gray">
                <span>{t.items} ({cart.length})</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-medium-gray">
                <span>{language === 'fr' ? 'Livraison' : 'Delivery'}</span>
                <span className="text-primary-green font-bold">{t.free}</span>
              </div>
              <div className="pt-4 border-t-2 border-light-gray flex justify-between items-center">
                <span className="font-bold text-dark-gray">{t.totalTTC}</span>
                <span className="text-2xl font-display font-black text-primary-blue">{subtotal.toLocaleString()} FCFA</span>
              </div>
            </div>
            <button 
              onClick={() => window.location.hash = 'checkout'}
              className="w-full h-14 bg-primary-blue text-white font-display font-bold rounded-xl shadow-xl hover:bg-dark-gray transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.checkout}
            </button>
            <div className="mt-8 grid grid-cols-1 gap-4 pt-6 border-t border-light-gray opacity-70">
               <div className="flex items-center gap-3 text-xs font-semibold">
                 <ShieldCheck className="w-4 h-4 text-primary-green" /> {language === 'fr' ? 'Paiement 100% sécurisé' : '100% Secure Payment'}
               </div>
               <div className="flex items-center gap-3 text-xs font-semibold">
                 <Truck className="w-4 h-4 text-primary-blue" /> {language === 'fr' ? 'Livraison partout au Cameroun' : 'Delivery across Cameroon'}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [route, setRoute] = React.useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash.split('?')[0] || 'home';
  });
  const [showBackToTop, setShowBackToTop] = React.useState(false);
  const { cart, authLoading } = useAppContext();

  // Dismiss splash screen once app is mounted and auth is loaded
  React.useEffect(() => {
    if (authLoading) return; // Wait until session is loaded

    // Re-sync route from hash after auth finishes (component returned null during load)
    const hash = window.location.hash.replace('#', '');
    const currentRoute = hash.split('?')[0] || 'home';
    setRoute(currentRoute);

    const splash = document.getElementById('splash-loader');
    if (splash) {
      const timer = setTimeout(() => {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 600);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  React.useEffect(() => {
    if (window.location.hash === '' || window.location.hash === '#') {
      setRoute('home');
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const baseRoute = hash.split('?')[0];
      setRoute(baseRoute || 'home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 1000);
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Early return APRÈS tous les hooks — Rules of Hooks respectées
  if (authLoading) {
    // Return null so the global splash-loader remains visible without rendering a second loader
    return null;
  }

  // Admin routing check
  if (route.startsWith('admin')) {
    return (
      <React.Suspense fallback={<PageLoader message="Chargement du panneau admin…" />}>
        <AdminLayout />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />
      <BenefitBar />
      <main className="min-h-[60vh] pb-20">
        <React.Suspense fallback={<PageLoader message="Chargement…" />}>
          {route === 'home' && <HomePage />}
          {route === 'catalogue' && <CataloguePage />}
          {route === 'cart' && <CartPage />}
          {(route === 'wishlist' || route.startsWith('profile')) && <CustomerSpace />}
          {route === 'checkout' && <CheckoutTunnel />}
          {route.startsWith('produits/') && (
            <ProductDetailPage productId={route.split('/')[1]} />
          )}
          {(route === 'login' || route === 'signup') && (
            <AuthPages 
              mode={route as 'login' | 'signup'} 
              onSwitch={(newMode) => window.location.hash = newMode} 
            />
          )}
        </React.Suspense>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Floating WhatsApp Button */}
        <motion.a
          href="https://wa.me/237696001685?text=Bonjour,%20j'aimerais%20avoir%20des%20informations%20sur%20les%20produits%20de%20Donald%20Gros."
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all transform hover:-translate-y-1"
          title="Nous contacter sur WhatsApp"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.238 1.45 4.82 1.452 5.432 0 9.85-4.42 9.853-9.857.002-2.633-1.02-5.107-2.88-6.968C16.58 1.96 14.103.938 11.999.938c-5.441 0-9.859 4.42-9.863 9.858-.001 1.762.483 3.486 1.4 5.02L2.527 21.1l5.12-1.946zm11.366-6.126c-.3-.15-1.77-.875-2.04-.975-.27-.1-.466-.15-.66.15-.195.3-.755.975-.927 1.17-.172.195-.344.22-.644.07-1.127-.565-1.947-.973-2.705-2.27-.19-.33.19-.307.545-1.013.09-.184.045-.347-.023-.497-.067-.15-.66-1.59-.904-2.18-.24-.575-.48-.495-.66-.504-.17-.008-.363-.01-.557-.01-.19 0-.507.07-.773.356-.265.285-1.012.99-1.012 2.412s1.035 2.784 1.18 2.977c.145.195 2.036 3.11 4.93 4.364.688.3 1.224.478 1.644.612.69.22 1.32.19 1.815.115.55-.083 1.77-.72 2.02-1.417.25-.7 1.02-2.037.93-2.185-.09-.15-.3-.22-.6-.37z"/>
          </svg>
        </motion.a>

        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              className="w-12 h-12 bg-white text-primary-blue rounded-full shadow-2xl border border-light-gray flex items-center justify-center hover:bg-primary-blue hover:text-white transition-all transform hover:-translate-y-1"
            >
              <ArrowLeft className="w-5 h-5 rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
        
        {/* Mobile Float Cart (Only if not on cart page) */}
        <AnimatePresence>
          {route !== 'cart' && cart.length > 0 && (
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              onClick={() => window.location.hash = 'cart'}
              className="lg:hidden w-14 h-14 bg-primary-green text-white rounded-full shadow-2xl flex items-center justify-center relative transform active:scale-95"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <React.Suspense fallback={<div className="h-40 bg-dark-gray" />}>
        <Footer />
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

