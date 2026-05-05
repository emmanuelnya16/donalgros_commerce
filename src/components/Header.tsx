import React from 'react';
import { Search, Heart, User, ShoppingCart, Globe, Menu, X, ChevronRight, LogOut, Package, MapPin, Calculator, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

import { SmartSearch } from './SmartSearch';
import { translations } from '../translations';
import logo from '../assets/donalgros.jpg';

export const Header = () => {
  const { cart, wishlist, user, logout, setCart, language } = useAppContext();
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<'user' | 'cart' | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

   const navItems = [
    { label: t.home.toUpperCase(), href: '#', isNew: false, isSale: false },
    { label: language === 'fr' ? 'CATALOGUE' : 'CATALOG', href: '#catalogue', isNew: false, isSale: false },
    { label: language === 'fr' ? 'SOLDES' : 'SALE', href: '#catalogue?filter=sale', isNew: false, isSale: true },
    { label: language === 'fr' ? 'PROMOTIONS' : 'PROMOTIONS', href: '#catalogue?filter=promo', isNew: false, isSale: false },
  ];

  return (
    <>
      <header className={`w-full z-50 transition-all duration-300 ${isScrolled ? 'sticky top-0 bg-white shadow-md py-3' : 'bg-white py-4 md:py-6 border-b border-light-gray'}`}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.hash = ''}>
            {/* Logo Image */}
            <img 
              src={logo} 
              alt="Donald Gros Logo" 
              className="hidden md:block w-14 h-14 object-contain rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <img 
              src={logo} 
              alt="Donald Gros Logo" 
              className="md:hidden w-10 h-10 object-contain rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div className="hidden md:block w-1 h-6 bg-primary-green" />
            <span className="text-xl md:text-2xl font-display font-bold text-primary-blue tracking-tight">
              DONALD <span className="group-hover:text-primary-green transition-colors">GROS</span>
            </span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-[600px] lg:max-w-[700px] mx-4 lg:mx-8">
            <SmartSearch placeholder={t.searchPlaceholder} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            <button className="hidden md:flex items-center gap-1 text-dark-gray hover:text-primary-blue transition-colors relative">
              <Globe className="w-6 h-6" />
            </button>
            
            {/* Search Icon - Mobile Only */}
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden text-dark-gray hover:text-primary-blue transition-colors relative"
            >
              <Search className="w-6 h-6" />
            </button>

            <button 
              onClick={() => window.location.hash = 'profile?tab=favorites'}
              className="relative text-dark-gray hover:text-primary-blue transition-colors group"
            >
              <Heart className={`w-6 h-6 ${wishlist.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div 
              className="relative hidden lg:block"
              onMouseEnter={() => setActiveDropdown('user')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => {
                  if (!user) {
                    window.location.hash = 'login';
                  } else {
                    setActiveDropdown(activeDropdown === 'user' ? null : 'user');
                  }
                }}
                className="flex items-center gap-2 text-dark-gray hover:text-primary-blue transition-colors group"
              >
                <User className="w-6 h-6" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'user' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-light-gray p-4 z-[100]"
                  >
                    {!user ? (
                      <div className="text-center space-y-4">
                        <div className="w-14 h-14 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="w-8 h-8" />
                        </div>
                        <h4 className="font-display font-bold text-dark-gray">{language === 'fr' ? 'Bienvenue chez Donald Gros' : 'Welcome to Donald Gros'}</h4>
                        <p className="text-sm text-medium-gray">{language === 'fr' ? 'Connectez-vous pour accéder à votre compte' : 'Login to access your account'}</p>
                        <button 
                          onClick={() => window.location.hash = 'login'}
                          className="w-full h-11 bg-primary-blue text-white font-bold rounded-lg hover:bg-dark-gray transition-colors"
                        >
                          {language === 'fr' ? 'Se Connecter' : 'Log In'}
                        </button>
                        <button 
                          onClick={() => window.location.hash = 'signup'}
                          className="w-full h-11 border-2 border-primary-blue text-primary-blue font-bold rounded-lg hover:bg-primary-blue hover:text-white transition-all"
                        >
                          {language === 'fr' ? 'Créer un Compte' : 'Create Account'}
                        </button>
                        <div className="flex justify-center gap-4 pt-4 border-t border-light-gray text-xs text-primary-blue">
                          <a href="#" className="hover:underline">Suivi de commande</a>
                          <a href="#" className="hover:underline">Aide & Contact</a>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 pb-4 border-b border-light-gray mb-2">
                          <div className="w-12 h-12 bg-gradient-to-tr from-primary-blue to-primary-green text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {user.name.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-dark-gray truncate">{user.name}</p>
                            <p className="text-xs text-medium-gray truncate">{user.email}</p>
                          </div>
                        </div>
                        <UserMenuItem 
                          icon={<Package className="w-4 h-4" />} 
                          label="Mes Commandes" 
                          onClick={() => { setActiveDropdown(null); window.location.hash = 'profile?tab=orders'; }}
                        />
                        <UserMenuItem 
                          icon={<User className="w-4 h-4" />} 
                          label="Mon Profil" 
                          onClick={() => { setActiveDropdown(null); window.location.hash = 'profile?tab=profile'; }}
                        />
                        <UserMenuItem 
                          icon={<MapPin className="w-4 h-4" />} 
                          label="Mes Adresses" 
                          onClick={() => { setActiveDropdown(null); window.location.hash = 'profile?tab=addresses'; }}
                        />
                        <UserMenuItem 
                          icon={<Heart className="w-4 h-4" />} 
                          label="Mes Favoris" 
                          badge={wishlist.length} 
                          onClick={() => { setActiveDropdown(null); window.location.hash = 'profile?tab=favorites'; }}
                        />
                        <button 
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium mt-2 pt-2 border-t border-light-gray"
                        >
                          <LogOut className="w-4 h-4" />
                          Se Déconnecter
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Dropdown */}
            <div 
              className="relative hidden lg:block"
              onMouseEnter={() => setActiveDropdown('cart')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${cart.length > 0 ? 'bg-primary-blue text-white' : 'text-dark-gray hover:bg-primary-blue/10'}`}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    window.location.hash = 'cart';
                  } else {
                    setActiveDropdown(activeDropdown === 'cart' ? null : 'cart');
                  }
                }}
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-green text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {activeDropdown === 'cart' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl border border-light-gray p-4 z-[100]"
                  >
                    {cart.length === 0 ? (
                      <div className="py-8 text-center space-y-4">
                        <ShoppingCart className="w-16 h-16 text-light-gray mx-auto" />
                        <p className="font-display font-bold text-dark-gray">Votre panier est vide</p>
                        <p className="text-sm text-medium-gray px-4">Découvrez nos produits et ajoutez vos articles préférés</p>
                        <button onClick={() => window.location.hash = ''} className="px-6 py-2 bg-primary-blue text-white rounded-lg font-bold text-sm">
                          Découvrir nos produits
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="font-display font-bold">Mon Panier ({cart.length})</h4>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setCart([]); }} 
                            className="text-xs text-red-500 hover:underline"
                          >
                            Vider le panier
                          </button>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1 no-scrollbar">
                          {cart.map(item => (
                            <div key={item.id} className="flex gap-3 group">
                              <div className="w-16 h-16 bg-light-gray rounded-lg overflow-hidden shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-dark-gray truncate">{item.name}</p>
                                <p className="text-xs text-medium-gray">Qté: {item.quantity}</p>
                                <p className="text-sm font-bold text-primary-blue">{item.price.toLocaleString()} FCFA</p>
                              </div>
                              <button className="text-light-gray hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-medium-gray">Sous-total :</span>
                            <span className="text-xl font-display font-bold text-primary-blue">
                              {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} FCFA
                            </span>
                          </div>
                          <button onClick={() => window.location.hash = 'cart'} className="w-full h-12 bg-primary-blue text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-dark-gray transition-colors">
                            Passer la Commande
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button onClick={() => window.location.hash = 'cart'} className="w-full text-center text-sm text-primary-blue mt-3 hover:underline">
                            Voir le panier complet
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Cart Icon - Mobile Only */}
            <button 
              className="lg:hidden relative text-dark-gray p-2"
              onClick={() => window.location.hash = 'cart'}
            >
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary-blue text-white text-[10px] flex items-center justify-center rounded-full">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-dark-gray"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-7 h-7" />
            </button>
          </div>
        </div>

      {/* Secondary Nav Bar - Desktop */}
      <nav className={`hidden md:block max-w-[1600px] mx-auto px-8 mt-4 transition-all duration-300 ${isScrolled ? 'h-0 overflow-hidden mt-0 opacity-0' : 'h-11 opacity-100'}`}>
          <ul className="flex items-center gap-10">
            {navItems.map((item) => (
              <li key={item.label} className="relative group py-2">
                <a 
                  href={item.href}
                  className={`font-display font-semibold text-[14px] transition-colors ${item.isSale ? 'text-red-600 px-3 py-1 bg-red-50 rounded-md' : 'text-dark-gray group-hover:text-primary-blue'}`}
                >
                  {item.label}
                  {item.isNew && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary-green text-white text-[9px] rounded font-bold uppercase tracking-wider">NEW</span>
                  )}
                </a>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-blue transition-all duration-300 group-hover:w-full" />
              </li>
            ))}
          </ul>
        </nav>
        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-light-gray overflow-hidden"
            >
              <div className="p-4">
                <SmartSearch 
                  autoFocus 
                  placeholder="Rechercher un produit..." 
                  onSearch={() => setIsMobileSearchOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[85%] h-full bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-light-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={logo} 
                    alt="Donald Gros Logo" 
                    className="w-10 h-10 object-contain rounded-lg"
                    onError={(e) => { 
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none'; 
                    }}
                  />
                  <div className="w-12 h-12 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold text-lg ring-4 ring-blue-50">
                    {user ? user.name.charAt(0) : 'DG'}
                  </div>
                  <div>
                    <p className="font-bold">{user ? `Bonjour, ${user.name}` : 'Bienvenue'}</p>
                    <p className="text-sm text-medium-gray">{user ? user.email : 'Mon compte'}</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-medium-gray" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.label} className="border-b border-light-gray last:border-none pb-4 last:pb-0">
                      <a href={item.href} className="flex items-center justify-between font-display font-semibold text-lg">
                        <span className={item.isSale ? 'text-red-600' : ''}>{item.label}</span>
                        <ChevronRight className="w-5 h-5 text-medium-gray" />
                      </a>
                    </li>
                  ))}
                  <li className="pt-4 border-t border-light-gray">
                    <p className="text-xs uppercase font-bold text-medium-gray mb-4 tracking-widest">Compte & Aide</p>
                    <div className="space-y-4">
                      <MobileNavAction icon={<Heart className="w-5 h-5" />} label="Mes Favoris" count={wishlist.length} onClick={() => { setIsMobileMenuOpen(false); window.location.hash = 'profile?tab=favorites'; }} />
                      <MobileNavAction icon={<Package className="w-5 h-5" />} label="Mes Commandes" onClick={() => { setIsMobileMenuOpen(false); window.location.hash = 'profile?tab=orders'; }} />
                      <MobileNavAction icon={<User className="w-5 h-5" />} label="Mon Profil" onClick={() => { setIsMobileMenuOpen(false); window.location.hash = 'profile?tab=profile'; }} />
                      <MobileNavAction icon={<MapPin className="w-5 h-5" />} label="Mes Adresses" onClick={() => { setIsMobileMenuOpen(false); window.location.hash = 'profile?tab=addresses'; }} />
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-light-gray/50 border-t border-light-gray">
                {!user ? (
                   <div className="flex gap-3">
                     <button onClick={() => { setIsMobileMenuOpen(false); window.location.hash = 'login'; }} className="flex-1 h-12 bg-primary-blue text-white rounded-lg font-bold">Connexion</button>
                     <button onClick={() => { setIsMobileMenuOpen(false); window.location.hash = 'signup'; }} className="flex-1 h-12 border-2 border-primary-blue text-primary-blue rounded-lg font-bold">S'inscrire</button>
                   </div>
                ) : (
                   <button onClick={logout} className="w-full h-12 bg-red-50 text-red-600 rounded-lg font-bold flex items-center justify-center gap-2">
                     <LogOut className="w-5 h-5" />
                     Se Déconnecter
                   </button>
                )}
                <p className="text-center text-[10px] text-medium-gray mt-6 uppercase tracking-widest">Donald Gros E-Commerce © 2025</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const UserMenuItem = ({ icon, label, badge, onClick }: { icon: React.ReactNode, label: string, badge?: number, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-dark-gray hover:bg-blue-50 hover:text-primary-blue rounded-lg transition-all group"
  >
    <span className="text-medium-gray group-hover:text-primary-blue">{icon}</span>
    {label}
    {badge !== undefined && badge > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>
    )}
  </button>
);

const MobileNavAction = ({ icon, label, count, onClick }: { icon: React.ReactNode, label: string, count?: number, onClick?: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between text-dark-gray">
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-semibold">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count !== undefined && count > 0 && <span className="text-primary-blue font-bold">{count}</span>}
      <ChevronRight className="w-4 h-4 text-medium-gray" />
    </div>
  </button>
);

