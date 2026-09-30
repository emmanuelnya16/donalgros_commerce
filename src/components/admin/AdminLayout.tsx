import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../../context/AppContext';
import { AdminSidebar, AdminHeader } from './AdminCommon';
import { AdminDashboard } from './AdminDashboard';
import { AdminCatalog } from './AdminCatalog';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminPromotions } from './AdminPromotions';
import { AdminReviews } from './AdminReviews';
import { AdminContent } from './AdminContent';
import { AdminSettings } from './AdminSettings';
import { AdminLogin } from './AdminLogin';
import { AdminCategories } from './AdminCategories';
import { AdminActivate } from './AdminActivate';
import { AdminTeam } from './AdminTeam';
import { AdminAnalytics } from './AdminAnalytics';

const AdminForbidden = () => (
  <div className="bg-white p-12 text-center rounded-3xl border border-red-100 shadow-xl max-w-lg mx-auto my-12 space-y-6">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <div>
      <h3 className="font-display font-black text-xl text-dark-gray uppercase tracking-tighter mb-2">Accès Refusé</h3>
      <p className="text-sm text-medium-gray font-medium">Vous ne disposez pas des autorisations nécessaires pour accéder à cette page.</p>
    </div>
    <button
      onClick={() => { window.location.hash = 'admin/products'; }}
      className="h-11 px-6 bg-primary-blue text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-dark-gray transition-colors"
    >
      Retourner au catalogue
    </button>
  </div>
);

export const AdminLayout = () => {
  const { adminUser } = useAppContext();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  
  // Hash-based sub-routing for admin
  const getTabFromHash = () => {
    const full = window.location.hash.split('?')[0]; // e.g. '#admin/login'
    if (full.startsWith('#admin/')) return full.slice('#admin/'.length) || 'dashboard';
    if (full === '#admin') return 'dashboard';
    return 'login'; // fallback safe default
  };

  const [adminTab, setAdminTab] = React.useState(getTabFromHash);

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#admin')) {
        setAdminTab(getTabFromHash());
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If not logged in and not on login or activate page, redirect to admin login
  if (!adminUser && adminTab !== 'login' && adminTab !== 'activate') {
    window.location.hash = 'admin/login';
    return null;
  }

  // If on login page, just show it without layout
  if (adminTab === 'login') {
    return <AdminLogin />;
  }

  // If on activate page, just show it without layout
  if (adminTab === 'activate') {
    return <AdminActivate />;
  }

  const getPageTitle = () => {
    switch (adminTab) {
      case 'dashboard': return 'Tableau de Bord';
      case 'analytics': return 'Analytiques GA4';
      case 'products': return 'Gestion des Produits';
      case 'categories': return 'Arborescence Catalogue';
      case 'stocks': return 'Suivi des Stocks';
      case 'orders': return 'Gestion des Commandes';
      case 'clients': return 'Base de Données Clients';
      case 'promotions': return 'Actions Commerciales';
      case 'reviews': return 'Modération des Avis';
      case 'content': return 'Gestion du Contenu';
      case 'settings': return 'Paramètres Boutique';
      case 'team': return "Gestion de l'Équipe";
      case 'forbidden': return 'Accès Refusé';
      default: return 'Administration';
    }
  };

  const getBreadcrumb = () => `Donald Gros Admin / ${getPageTitle()}`;

  const renderContent = () => {
    // Si l'utilisateur est simple admin (ROLE_MANAGER), restreindre l'accès
    const isManager = adminUser?.role === 'ROLE_MANAGER';
    if (isManager && !['products', 'categories', 'forbidden'].includes(adminTab)) {
      return <AdminForbidden />;
    }

    switch (adminTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'analytics': return <AdminAnalytics />;
      case 'products': return <AdminCatalog />;
      case 'orders': return <AdminOrders />;
      case 'clients': return <AdminCustomers />;
      case 'promotions': return <AdminPromotions />;
      case 'reviews': return <AdminReviews />;
      case 'content': return <AdminContent />;
      case 'settings': return <AdminSettings />;
      case 'team': return <AdminTeam />;
      case 'forbidden': return <AdminForbidden />;
      // Categories and Stocks share Catalog or have simplified views
      case 'categories': return <AdminCategories />;
      case 'stocks': return <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-light-gray">Page de suivi des stocks (Détail Module 3.3)</div>;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-dark-gray selection:bg-primary-blue selection:text-white">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        activeTab={adminTab}
        setActiveTab={setAdminTab}
      />

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarCollapsed(true)}
            className="fixed inset-0 bg-black/50 z-[90] md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'} ml-0`}>
        <AdminHeader 
          title={getPageTitle()} 
          breadcrumb={getBreadcrumb()} 
          onMenuClick={() => setIsSidebarCollapsed(false)}
        />
        
        <main className="flex-1 p-4 md:p-8 max-w-[1800px] mx-auto w-full">
           <AnimatePresence mode="wait">
             <motion.div
               key={adminTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {renderContent()}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
