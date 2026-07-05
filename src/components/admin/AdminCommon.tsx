import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Ticket, 
  Star, 
  Monitor, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  User
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fetchOrders } from '../../services/adminOrderService';

// --- SIDEBAR COMPONENT ---
export const AdminSidebar = ({ isCollapsed, setIsCollapsed, activeTab, setActiveTab }: { 
  isCollapsed: boolean, 
  setIsCollapsed: (v: boolean) => void,
  activeTab: string,
  setActiveTab: (t: string) => void
}) => {
  const { adminLogout, adminUser, reviews } = useAppContext();
  const [ordersBadge, setOrdersBadge] = React.useState<number>(0);

  // Charger le compteur de commandes en attente d'action
  React.useEffect(() => {
    if (!adminUser) return;
    let active = true;

    const loadOrderStats = async () => {
      try {
        const res = await fetchOrders({ limit: 1 });
        if (!active) return;
        
        // On compte les commandes qui requièrent une attention
        // (confirmées, en préparation, paiement à la livraison, en attente de paiement)
        const stats = res.stats;
        if (stats) {
          const totalPending = 
            (stats.confirmed || 0) + 
            (stats.processing || 0) + 
            (stats.pending_cod || 0) +
            (stats.pending_payment || 0);
          setOrdersBadge(totalPending);
        } else {
          setOrdersBadge(res.total || 0);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques de commandes pour la sidebar:', err);
      }
    };

    loadOrderStats();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadOrderStats, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [adminUser]);

  // Avis en attente (pending)
  const pendingReviewsCount = reviews.length > 0
    ? reviews.filter(r => r.status === 'pending').length
    : 2; // Valeur simulée par défaut s'il n'y a pas d'avis réels chargés

  const menuItems = [
    { section: 'GENERAL', items: [
      { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    ]},
    { section: 'CATALOGUE', items: [
      { id: 'products', label: 'Produits', icon: Package },
      { id: 'categories', label: 'Catégories', icon: Menu },
      { id: 'stocks', label: 'Stocks', icon: Package },
    ]},
    { section: 'VENTES', items: [
      { id: 'orders', label: 'Commandes', icon: ShoppingCart, badge: ordersBadge > 0 ? ordersBadge : undefined },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'promotions', label: 'Promotions', icon: Ticket },
    ]},
    { section: 'CONTENU', items: [
      { id: 'reviews', label: 'Avis Clients', icon: Star, badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined },
      { id: 'content', label: 'Gestion Site', icon: Monitor },
    ]},
    { section: 'SYSTEME', items: [
      { id: 'settings', label: 'Paramètres', icon: Settings },
    ]}
  ];

  return (
    <div className={`fixed left-0 top-0 bottom-0 bg-[#0F172A] text-white transition-all duration-300 z-[100] flex flex-col 
      ${isCollapsed ? 'w-[72px] -translate-x-full md:translate-x-0' : 'w-[260px] translate-x-0'}
    `}>
      {/* Zone Logo */}
      <div className="h-[72px] flex items-center px-5 border-b border-white/10 shrink-0">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tighter">DONALD GROS</span>
            <span className="text-[10px] bg-primary-blue px-2 py-0.5 rounded-full font-bold self-start mt-0.5">ADMIN</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        {menuItems.map((section, idx) => (
          <div key={section.section} className={idx > 0 ? 'mt-6' : ''}>
            {!isCollapsed && (
              <p className="px-5 text-[11px] font-black text-white/40 uppercase tracking-widest mb-2">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.location.hash = `admin/${item.id}`;
                  }}
                  className={`w-full h-12 flex items-center px-5 transition-all relative group
                    ${activeTab === item.id 
                      ? 'bg-primary-blue text-white border-l-[3px] border-white' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="ml-4 font-sans font-medium text-sm">{item.label}</span>}
                  
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-dark-gray text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Zone Utilisateur */}
      <div className="h-[72px] border-t border-white/10 px-4 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary-blue/20 border border-primary-blue/30 flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-primary-blue" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-sm font-bold truncate">{adminUser?.name || 'Admin'}</p>
            <p className="text-[10px] text-white/50 uppercase font-black">{adminUser?.role === 'super_admin' ? 'Super Admin' : 'Gestionnaire'}</p>
          </div>
        )}
        <button 
          onClick={() => {
             adminLogout();
             window.location.hash = 'admin/login';
          }}
          className={`p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- HEADER COMPONENT ---
export const AdminHeader = ({ title, breadcrumb, onMenuClick }: { title: string, breadcrumb: string, onMenuClick?: () => void }) => {
  return (
    <header className="h-[64px] bg-white border-b border-light-gray flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 md:hidden text-dark-gray hover:bg-light-gray rounded-lg transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h2 className="font-display font-bold text-base md:text-xl text-dark-gray truncate max-w-[150px] sm:max-w-none">{title}</h2>
          <p className="hidden sm:block text-[10px] md:text-[11px] text-medium-gray font-sans uppercase tracking-widest">{breadcrumb}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
          <input 
            type="text" 
            placeholder="Recherche globale..."
            className="h-9 w-64 pl-10 pr-4 bg-light-gray/50 border border-light-gray rounded-lg text-sm outline-none focus:border-primary-blue focus:bg-white transition-all"
          />
        </div>
        
        <button className="relative p-2 text-medium-gray hover:bg-light-gray rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-9 h-9 rounded-full bg-light-gray border border-light-gray overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-blue transition-all">
           <img 
             src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
             className="w-full h-full object-cover" 
             alt="Admin"
           />
        </div>
      </div>
    </header>
  );
};
