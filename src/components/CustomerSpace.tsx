import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, User, MapPin, Heart, LogOut, ChevronRight, 
  ShoppingBag, Clock, CheckCircle2, Truck, Plus, Trash2,
  Edit, Globe, Smartphone, ShieldCheck
} from 'lucide-react';
import { useAppContext, Order, Address } from '../context/AppContext';
import { translations } from '../translations';

export const CustomerSpace = () => {
  const { user, orders, addresses, wishlist, logout, toggleWishlist, removeAddress, addAddress, language } = useAppContext();
  const t = translations[language];
  const [activeTab, setActiveTab] = React.useState(() => {
    if (window.location.hash.startsWith('#wishlist')) return 'favorites';
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return params.get('tab') || 'orders';
  });
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState({
    label: '',
    name: user?.name || '',
    phone: '',
    city: 'Douala',
    district: '',
    details: ''
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#wishlist')) {
        setActiveTab('favorites');
        return;
      }
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const tab = params.get('tab');
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!user) {
    window.location.hash = 'login';
    return null;
  }

  const tabs = [
    { id: 'orders', label: t.myOrdersTab, icon: <Package className="w-5 h-5" /> },
    { id: 'profile', label: t.myProfileTab, icon: <User className="w-5 h-5" /> },
    { id: 'favorites', label: t.myFavoritesTab, icon: <Heart className="w-5 h-5" /> },
    { id: 'addresses', label: t.myAddressesTab, icon: <MapPin className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-3xl border border-light-gray p-6 space-y-8 sticky top-24 shadow-sm">
            {/* User Info Card */}
            <div className="flex items-center gap-4 border-b border-light-gray pb-6">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary-blue to-primary-green text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                {user.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-display font-black text-dark-gray truncate">{user.name}</h2>
                <p className="text-sm text-medium-gray truncate">{user.email}</p>
                <span className="text-[10px] font-black uppercase text-primary-green bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">{t.premiumClient}</span>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="flex flex-col gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.location.hash = `profile?tab=${tab.id}`;
                  }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all text-left ${activeTab === tab.id ? 'bg-primary-blue text-white shadow-xl shadow-primary-blue/20' : 'text-medium-gray hover:bg-light-gray hover:text-dark-gray'}`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-primary-blue'}>{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'favorites' && wishlist.length > 0 && (
                    <span className={`ml-auto w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-white text-primary-blue' : 'bg-red-500 text-white'}`}>
                      {wishlist.length}
                    </span>
                  )}
                  {tab.id === 'orders' && orders.length > 0 && (
                    <span className={`ml-auto w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-white text-primary-blue' : 'bg-primary-blue text-white'}`}>
                      {orders.length}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 ml-auto ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </nav>

            <button 
              onClick={logout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all text-left border-t border-light-gray pt-6"
            >
              <LogOut className="w-5 h-5" />
              {t.logout}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div 
                key="orders" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-display font-black text-dark-gray">{t.myOrdersTab}</h1>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-light-gray text-medium-gray text-[10px] font-black rounded-full uppercase tracking-widest">{orders.length} {language === 'fr' ? 'total' : 'total'}</span>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-light-gray py-20 text-center space-y-6">
                    <Package className="w-20 h-20 text-light-gray mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-dark-gray">{t.noOrdersYet}</h3>
                      <p className="text-medium-gray max-w-sm mx-auto">{t.noOrdersDesc}</p>
                    </div>
                    <button 
                      onClick={() => window.location.hash = 'catalogue'}
                      className="px-8 h-12 bg-primary-blue text-white font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                      {t.exploreCatalogue}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <h1 className="text-3xl font-display font-black text-dark-gray">{t.myProfileTab}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-light-gray shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg">{t.personalInfo}</h3>
                      <button className="text-primary-blue hover:underline font-bold text-sm flex items-center gap-1">
                        <Edit className="w-4 h-4" /> {t.edit}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <InfoGroup label={t.fullName} value={user.name} />
                      <InfoGroup label={t.emailAddress} value={user.email} />
                      <InfoGroup label={t.phone} value={t.notProvided} />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-light-gray shadow-sm space-y-6">
                    <h3 className="font-display font-bold text-lg">{t.accountSecurity}</h3>
                    <div className="space-y-4">
                      <button className="w-full h-12 border border-light-gray rounded-xl flex items-center justify-between px-6 hover:bg-light-gray transition-colors">
                        <span className="text-sm font-bold text-dark-gray">{t.changePassword}</span>
                        <ChevronRight className="w-4 h-4 text-medium-gray" />
                      </button>
                      <button className="w-full h-12 border border-light-gray rounded-xl flex items-center justify-between px-6 hover:bg-light-gray transition-colors">
                        <span className="text-sm font-bold text-dark-gray">{t.twoFactor}</span>
                        <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-black uppercase text-[min-width: 65px]">{language === 'fr' ? 'Désactivé' : 'Disabled'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-blue/5 p-8 rounded-3xl border border-primary-blue/10 flex flex-col md:flex-row items-center gap-6">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary-blue shadow-sm shrink-0">
                      <ShieldCheck className="w-10 h-10" />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h4 className="font-display font-bold text-lg text-dark-gray">{t.protectionActive}</h4>
                      <p className="text-sm text-medium-gray">{t.protectionDesc}</p>
                   </div>
                   <button className="px-6 py-2 bg-primary-blue text-white rounded-lg font-bold text-sm">{t.learnMore}</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div 
                key="favorites" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-display font-black text-dark-gray">{t.myFavoritesTab}</h1>
                  <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black rounded-full uppercase tracking-widest">{wishlist.length} {language === 'fr' ? 'articles' : 'items'}</span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-light-gray py-20 text-center space-y-6">
                    <Heart className="w-20 h-20 text-light-gray mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold text-dark-gray">{t.noFavoriteYet}</h3>
                      <p className="text-medium-gray max-w-sm mx-auto">{t.noFavoriteDesc}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlist.map(product => (
                      <div key={product.id} className="bg-white border border-light-gray rounded-2xl overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
                         <div className="relative aspect-square overflow-hidden bg-light-gray">
                            <img src={product.image} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                            <button 
                              onClick={() => toggleWishlist(product)}
                              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-sm"
                            >
                               <Heart className="w-4 h-4 fill-current" />
                            </button>
                         </div>
                         <div className="p-4 flex flex-col flex-1">
                            <p className="text-[10px] font-bold text-medium-gray uppercase mb-1">{product.brand}</p>
                            <h4 className="font-bold text-sm text-dark-gray truncate mb-2">{product.name}</h4>
                            <div className="mt-auto flex items-center justify-between">
                               <p className="font-display font-black text-primary-blue">{product.price.toLocaleString()} F</p>
                               <button 
                                 onClick={() => window.location.hash = `product/${product.id}`}
                                 className="text-[10px] font-black uppercase text-primary-blue hover:underline"
                               >
                                 {language === 'fr' ? 'Voir' : 'View'}
                               </button>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div 
                key="addresses" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-display font-black text-dark-gray">{t.myAddressesTab}</h1>
                  <button 
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-2 px-6 h-12 bg-primary-blue text-white rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    <Plus className="w-5 h-5" /> {t.addAddress}
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-dashed border-light-gray py-20 text-center">
                    <MapPin className="w-20 h-20 text-light-gray mx-auto mb-6" />
                    <h3 className="text-2xl font-display font-bold text-dark-gray mb-2">{t.noAddressYet}</h3>
                    <p className="text-medium-gray mb-8">{t.noAddressDesc}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map(addr => (
                      <div key={addr.id} className="bg-white p-8 rounded-3xl border border-light-gray shadow-sm relative group">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                             <span className="w-10 h-10 bg-blue-50 text-primary-blue rounded-xl flex items-center justify-center">
                               <MapPin className="w-5 h-5" />
                             </span>
                             <h4 className="font-display font-bold text-lg">{addr.label}</h4>
                           </div>
                           <button 
                             onClick={() => removeAddress(addr.id)}
                             className="p-2 text-medium-gray hover:text-red-500 transition-colors"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                        <div className="space-y-2 text-sm">
                           <p className="font-bold text-dark-gray">{addr.name}</p>
                           <p className="text-medium-gray flex items-center gap-2"><Smartphone className="w-4 h-4" /> {addr.phone}</p>
                           <p className="text-medium-gray flex items-center gap-2"><Globe className="w-4 h-4" /> {addr.city}, {addr.district}</p>
                           <p className="text-medium-gray italic mt-2">{addr.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl p-8 md:p-12 overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-3xl font-display font-black text-dark-gray mb-8">{t.newAddressTitle}</h2>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  addAddress(newAddress);
                  setShowAddressModal(false);
                  setNewAddress({ label: '', name: user.name, phone: '', city: 'Douala', district: '', details: '' });
                }} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-dark-gray italic uppercase tracking-tighter">{t.addressLabel}</label>
                  <input 
                    required
                    className="w-full h-12 bg-light-gray/50 rounded-xl px-6 outline-none border border-transparent focus:border-primary-blue transition-all font-medium"
                    value={newAddress.label}
                    onChange={e => setNewAddress({...newAddress, label: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray italic uppercase tracking-tighter">{t.recipient}</label>
                    <input 
                      required
                      className="w-full h-12 bg-light-gray/50 rounded-xl px-6 outline-none border border-transparent focus:border-primary-blue transition-all font-medium"
                      value={newAddress.name}
                      onChange={e => setNewAddress({...newAddress, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray italic uppercase tracking-tighter">{t.phone}</label>
                    <input 
                      required
                      className="w-full h-12 bg-light-gray/50 rounded-xl px-6 outline-none border border-transparent focus:border-primary-blue transition-all font-medium"
                      placeholder="+237 ..."
                      value={newAddress.phone}
                      onChange={e => setNewAddress({...newAddress, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray italic uppercase tracking-tighter">{t.city}</label>
                    <select 
                      className="w-full h-12 bg-light-gray/50 rounded-xl px-6 outline-none border border-transparent focus:border-primary-blue transition-all font-medium"
                      value={newAddress.city}
                      onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                    >
                      <option>Douala</option>
                      <option>Yaoundé</option>
                      <option>Bafoussam</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray italic uppercase tracking-tighter">{language === 'fr' ? 'Quartier' : 'District'}</label>
                    <input 
                      required
                      className="w-full h-12 bg-light-gray/50 rounded-xl px-6 outline-none border border-transparent focus:border-primary-blue transition-all font-medium"
                      value={newAddress.district}
                      onChange={e => setNewAddress({...newAddress, district: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-dark-gray italic uppercase tracking-tighter">{language === 'fr' ? 'Détails (Précisions)' : 'Details (Precision)'}</label>
                  <textarea 
                    className="w-full h-24 bg-light-gray/50 rounded-xl p-6 outline-none border border-transparent focus:border-primary-blue transition-all font-medium resize-none"
                    placeholder={language === 'fr' ? "Ex: Face boulangerie, portail bleu..." : "Ex: Facing bakery, blue gate..."}
                    value={newAddress.details}
                    onChange={e => setNewAddress({...newAddress, details: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full h-14 bg-primary-blue text-white rounded-2xl font-display font-bold shadow-xl shadow-primary-blue/20">
                  {t.saveAddress}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const { language } = useAppContext();
  const t = translations[language];
  const [isOpen, setIsOpen] = React.useState(false);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Livré': return t.orderStatus.delivered;
      case 'En cours de livraison': return t.orderStatus.shipping;
      case 'En attente': return t.orderStatus.pending;
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-light-gray overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
             order.status === 'Livré' ? 'bg-green-50 text-primary-green' : 
             order.status === 'En cours de livraison' ? 'bg-blue-50 text-primary-blue' : 
             'bg-orange-50 text-orange-600'
           }`}>
             <Package className="w-8 h-8" />
           </div>
           <div>
             <h4 className="font-display font-black text-xl text-dark-gray italic uppercase tracking-tighter">Commande {order.id}</h4>
             <p className="text-sm text-medium-gray font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> {order.date}
             </p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <div className="text-right">
              <p className="text-2xl font-display font-black text-primary-blue italic">{order.total.toLocaleString()} FCFA</p>
              <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest mt-1">
                 <span className={order.paymentStatus === 'payé' ? 'text-primary-green' : 'text-red-500'}>
                   {order.paymentStatus === 'payé' ? (language === 'fr' ? 'Payé' : 'Paid') : (language === 'fr' ? 'Paiement à la livraison' : 'Cash on delivery')}
                 </span>
                 <span className="w-1 h-1 bg-light-gray rounded-full" />
                 <span className="text-medium-gray">{order.items.length} {language === 'fr' ? 'articles' : 'items'}</span>
              </div>
           </div>
           <button 
             onClick={() => setIsOpen(!isOpen)}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-dark-gray text-white rotate-180' : 'bg-light-gray text-dark-gray'}`}
           >
              <ChevronRight className="w-5 h-5 -rotate-90" />
           </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-light-gray overflow-hidden"
          >
             <div className="p-6 md:p-8 space-y-8 bg-light-gray/10">
                {/* Timeline */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative md:px-12">
                   <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-light-gray -translate-y-1/2 z-0 hidden md:block" />
                   <StatusPoint active icon={<CheckCircle2 className="w-5 h-5" />} label={t.orderStatus.confirmed} sub={language === 'fr' ? 'Votre commande est validée' : 'Your order is validated'} />
                   <StatusPoint active={order.status !== 'En attente'} icon={<ShoppingBag className="w-5 h-5" />} label={t.orderStatus.preparation} sub={order.status === 'En attente' ? (language === 'fr' ? 'À venir' : 'To come') : (language === 'fr' ? 'Fini' : 'Finished')} />
                   <StatusPoint active={['En cours de livraison', 'Livré'].includes(order.status)} icon={<Truck className="w-5 h-5" />} label={t.orderStatus.shipped} sub={order.status === 'En cours de livraison' ? (language === 'fr' ? 'En cours' : 'In progress') : (language === 'fr' ? 'À venir' : 'To come')} />
                   <StatusPoint active={order.status === 'Livré'} icon={<CheckCircle2 className="w-5 h-5" />} label={t.orderStatus.deliveredPoint} sub={order.status === 'Livré' ? (language === 'fr' ? 'Effectué' : 'Completed') : (language === 'fr' ? 'À venir' : 'To come')} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                   <div className="space-y-4">
                      <h5 className="font-black uppercase tracking-widest text-[11px] text-medium-gray italic">{language === 'fr' ? 'Articles de la commande' : 'Order Items'}</h5>
                      <div className="space-y-3">
                         {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-light-gray/50">
                               <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />
                               <div className="flex-1 min-w-0">
                                  <p className="font-bold text-dark-gray truncate">{item.name}</p>
                                  <p className="text-[10px] text-medium-gray font-bold">{language === 'fr' ? 'Qté:' : 'Qty:'} {item.quantity} {item.selectedSize ? `| ${language === 'fr' ? 'Taille' : 'Size'}: ${item.selectedSize}` : ''}</p>
                               </div>
                               <p className="font-black text-primary-blue">{(item.price * item.quantity).toLocaleString()} F</p>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-4">
                        <h5 className="font-black uppercase tracking-widest text-[11px] text-medium-gray italic">{language === 'fr' ? 'Informations de livraison' : 'Delivery Information'}</h5>
                        <div className="bg-white p-4 rounded-2xl border border-light-gray/50 space-y-2">
                           <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-blue" /> <span className="font-bold">{order.address.city}, {order.address.district}</span></p>
                           <p className="text-medium-gray text-xs pl-6">{order.address.details}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                         <button className="flex-1 h-12 bg-white border border-light-gray text-dark-gray rounded-xl font-bold hover:bg-light-gray transition-colors text-xs">{language === 'fr' ? 'Aide commande' : 'Order help'}</button>
                         <button className="flex-1 h-12 bg-white border border-light-gray text-dark-gray rounded-xl font-bold hover:bg-light-gray transition-colors text-xs">{language === 'fr' ? 'Suivre le livreur' : 'Track delivery'}</button>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusPoint = ({ active, icon, label, sub }: any) => (
  <div className="flex items-center md:flex-col gap-4 md:text-center relative z-10">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-primary-green text-white ring-8 ring-green-50 shadow-lg' : 'bg-white border-2 border-light-gray text-light-gray'}`}>
      {icon}
    </div>
    <div className="flex flex-col">
       <span className={`text-[11px] font-black uppercase tracking-tighter ${active ? 'text-dark-gray italic' : 'text-medium-gray'}`}>{label}</span>
       <span className="text-[9px] font-bold text-medium-gray md:hidden lg:block">{sub}</span>
    </div>
  </div>
);

const InfoGroup = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black uppercase tracking-widest text-medium-gray italic">{label}</p>
    <p className="font-bold text-dark-gray">{value}</p>
  </div>
);
