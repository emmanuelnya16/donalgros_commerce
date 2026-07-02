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

  // If not logged in and not on login page, redirect to admin login
  if (!adminUser && adminTab !== 'login') {
    window.location.hash = 'admin/login';
    return null;
  }

  // If on login page, just show it without layout
  if (adminTab === 'login') {
    return <AdminLogin />;
  }

  const getPageTitle = () => {
    switch (adminTab) {
      case 'dashboard': return 'Tableau de Bord';
      case 'products': return 'Gestion des Produits';
      case 'categories': return 'Arborescence Catalogue';
      case 'stocks': return 'Suivi des Stocks';
      case 'orders': return 'Gestion des Commandes';
      case 'clients': return 'Base de Données Clients';
      case 'promotions': return 'Actions Commerciales';
      case 'reviews': return 'Modération des Avis';
      case 'content': return 'Gestion du Contenu';
      case 'settings': return 'Paramètres Boutique';
      default: return 'Administration';
    }
  };

  const getBreadcrumb = () => `Donald Gros Admin / ${getPageTitle()}`;

  const renderContent = () => {
    switch (adminTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'products': return <AdminCatalog />;
      case 'orders': return <AdminOrders />;
      case 'clients': return <AdminCustomers />;
      case 'promotions': return <AdminPromotions />;
      case 'reviews': return <AdminReviews />;
      case 'content': return <AdminContent />;
      case 'settings': return <AdminSettings />;
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
