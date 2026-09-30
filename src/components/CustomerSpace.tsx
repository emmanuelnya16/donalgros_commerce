import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, User, MapPin, Heart, LogOut, ChevronRight, 
  ShoppingBag, Clock, CheckCircle2, Truck, Plus, Trash2,
  Edit, Globe, Smartphone, ShieldCheck, RefreshCw, AlertCircle,
  Gift, Trophy, Crown, Sparkles, Award, Store, ArrowRight, Star, Check
} from 'lucide-react';
import { useAppContext, Order, Address } from '../context/AppContext';
import { translations } from '../translations';
import { getMyOrderHistory, type OrderResponse } from '../services/catalogueService';
import { calculateLoyaltyProfile, calculateOrderPoints, calculatePointsValue, GIFT_MILESTONES, type GiftMilestone } from '../utils/loyalty';

export const CustomerSpace = () => {
  const { user, orders, addresses, wishlist, logout, toggleWishlist, removeAddress, addAddress, language } = useAppContext();
  const t = translations[language];
  const [activeTab, setActiveTab] = React.useState(() => {
    if (window.location.hash.startsWith('#wishlist')) return 'favorites';
    if (window.location.hash.startsWith('#loyalty') || window.location.hash.startsWith('#fidelite')) return 'loyalty';
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return params.get('tab') || 'orders';
  });
  const [showAddressModal, setShowAddressModal] = React.useState(false);
  
  // Historique commandes depuis le backend
  const [apiOrders, setApiOrders] = React.useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState('');
  const [newAddress, setNewAddress] = React.useState({
    label: '',
    name: user ? user.fullName : '',
    phone: user?.phone || '',
    city: 'Douala',
    district: '',
    details: ''
  });

  // Charger les commandes depuis le backend dès que l'utilisateur est connecté
  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const result = await getMyOrderHistory();
        if (!cancelled) setApiOrders(result);
      } catch (err: any) {
        if (!cancelled) {
          setOrdersError(
            language === 'fr' 
              ? 'Impossible de charger vos commandes. Veuillez réessayer.' 
              : 'Unable to load your orders. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Calcul du profil fidélité réactif basé sur les commandes réelles
  const loyaltyProfile = React.useMemo(() => {
    return calculateLoyaltyProfile(apiOrders, orders);
  }, [apiOrders, orders]);

  React.useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#wishlist')) {
        setActiveTab('favorites');
        return;
      }
      if (window.location.hash.startsWith('#loyalty') || window.location.hash.startsWith('#fidelite')) {
        setActiveTab('loyalty');
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
    { id: 'loyalty', label: t.loyaltyTab, icon: <Gift className="w-5 h-5 text-amber-500" /> },
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
                {user.firstName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-display font-black text-dark-gray truncate">{user.fullName}</h2>
                <p className="text-sm text-medium-gray truncate">{user.phone}</p>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${user.status === 'active' ? 'text-primary-green bg-green-50' : 'text-red-500 bg-red-50'}`}>{user.status === 'active' ? t.premiumClient : (language === 'fr' ? 'Suspendu' : 'Suspended')}</span>
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
                  <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'loyalty' && loyaltyProfile.totalPoints > 0 && (
                    <span className={`ml-auto px-2 py-0.5 rounded-full text-[11px] font-black ${activeTab === tab.id ? 'bg-white text-primary-blue' : 'bg-amber-100 text-amber-800'}`}>
                      {loyaltyProfile.totalPoints} pts ({loyaltyProfile.totalRewardFcfa.toLocaleString()} F)
                    </span>
                  )}
                  {tab.id === 'favorites' && wishlist.length > 0 && (
                    <span className={`ml-auto w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-white text-primary-blue' : 'bg-red-500 text-white'}`}>
                      {wishlist.length}
                    </span>
                  )}
                  {tab.id === 'orders' && (apiOrders.length > 0 || orders.length > 0) && (
                    <span className={`ml-auto w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-white text-primary-blue' : 'bg-primary-blue text-white'}`}>
                      {apiOrders.length || orders.length}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 ml-auto ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </nav>

            <button 
              onClick={() => logout()}
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
                    <span className="px-3 py-1 bg-light-gray text-medium-gray text-[10px] font-black rounded-full uppercase tracking-widest">
                      {apiOrders.length} {language === 'fr' ? 'total' : 'total'}
                    </span>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="bg-white rounded-3xl border border-light-gray py-20 flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-primary-blue animate-spin" />
                    <p className="text-medium-gray font-medium">
                      {language === 'fr' ? 'Chargement de vos commandes...' : 'Loading your orders...'}
                    </p>
                  </div>
                ) : ordersError ? (
                  <div className="bg-red-50 rounded-3xl border border-red-200 py-12 flex flex-col items-center gap-4 text-center px-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                    <p className="text-red-600 font-medium">{ordersError}</p>
                    <button
                      onClick={() => setActiveTab('_reload_orders')}
                      className="px-6 h-10 bg-primary-blue text-white rounded-xl font-bold text-sm hover:brightness-110"
                    >
                      {language === 'fr' ? 'Réessayer' : 'Retry'}
                    </button>
                  </div>
                ) : apiOrders.length === 0 ? (
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
                    {apiOrders.map(order => (
                      <ApiOrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Onglet Fidélité & Cadeaux */}
            {activeTab === 'loyalty' && (
              <motion.div 
                key="loyalty" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-3xl font-display font-black text-dark-gray flex items-center gap-3">
                    <Gift className="w-8 h-8 text-amber-500" />
                    {t.loyaltyTitle}
                  </h1>
                  <p className="text-medium-gray mt-1">{t.loyaltySub}</p>
                </div>

                {/* Carte VIP Virtuelle de Luxe */}
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-8 md:p-10 shadow-2xl border border-amber-500/20">
                  {/* Motifs géométriques & lueurs dorées */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-blue/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col justify-between gap-8 min-h-[220px]">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg text-slate-950 font-black">
                          <Crown className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-amber-300/80 font-bold">Donald Gros Club</p>
                          <h3 className="font-display font-black text-xl text-white tracking-wide">{user.fullName}</h3>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {language === 'fr' ? loyaltyProfile.tier.nameFr : loyaltyProfile.tier.nameEn}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10 items-end">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">{t.loyaltyPointsBalance}</p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-4xl md:text-5xl font-display font-black text-amber-400">
                            {loyaltyProfile.totalPoints.toLocaleString()}
                          </span>
                          <span className="text-lg font-bold text-amber-200/80">pts</span>
                          <span className="text-xs font-black text-amber-950 bg-amber-300 px-2.5 py-0.5 rounded-full shadow-sm">
                            = {loyaltyProfile.totalRewardFcfa.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">{t.loyaltyOrdersCount}</p>
                        <p className="text-2xl font-bold text-white">
                          {loyaltyProfile.eligibleOrdersCount} {language === 'fr' ? 'commandes' : 'orders'}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <p className="text-xs uppercase tracking-widest text-white/60 font-bold mb-1">{t.loyaltyNextMilestone}</p>
                        <p className="text-sm font-bold text-amber-300">
                          {loyaltyProfile.nextMilestone 
                            ? `${loyaltyProfile.nextMilestone.pointsRequired.toLocaleString()} pts (${language === 'fr' ? loyaltyProfile.nextMilestone.titleFr : loyaltyProfile.nextMilestone.titleEn})`
                            : (language === 'fr' ? 'Palier Maximum Atteint 🎉' : 'Maximum Milestone Reached 🎉')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jauge de progression vers le prochain cadeau */}
                <div className="bg-white p-8 rounded-3xl border border-light-gray shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-lg text-dark-gray flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        {loyaltyProfile.nextMilestone 
                          ? (language === 'fr' 
                              ? `Objectif : ${loyaltyProfile.nextMilestone.titleFr}` 
                              : `Goal: ${loyaltyProfile.nextMilestone.titleEn}`)
                          : (language === 'fr' ? 'Félicitations pour votre fidélité !' : 'Congratulations on your loyalty!')}
                      </h3>
                      <p className="text-sm text-medium-gray">
                        {loyaltyProfile.nextMilestone 
                          ? (language === 'fr' 
                              ? `Plus que ${loyaltyProfile.pointsToNextMilestone.toLocaleString()} points pour débloquer votre prochain cadeau en boutique !` 
                              : `Only ${loyaltyProfile.pointsToNextMilestone.toLocaleString()} points left to unlock your next in-store gift!`)
                          : (language === 'fr' 
                              ? 'Vous avez débloqué tous nos paliers de cadeaux actuels !' 
                              : 'You have unlocked all current reward tiers!')}
                      </p>
                    </div>
                    <span className="text-2xl font-display font-black text-primary-blue">
                      {loyaltyProfile.totalPoints} / {loyaltyProfile.nextMilestone ? loyaltyProfile.nextMilestone.pointsRequired : loyaltyProfile.totalPoints} pts
                    </span>
                  </div>

                  {/* Barre animée */}
                  <div className="w-full h-4 bg-light-gray rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-primary-green rounded-full transition-all duration-1000 shadow-sm"
                      style={{ width: `${loyaltyProfile.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Paliers Cadeaux en Boutique */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-display font-black text-dark-gray flex items-center gap-2">
                      <Store className="w-6 h-6 text-primary-blue" />
                      {t.loyaltyGiftsTitle}
                    </h2>
                    <p className="text-sm text-medium-gray">{t.loyaltyGiftsSub}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {GIFT_MILESTONES.map((milestone) => {
                      const isUnlocked = loyaltyProfile.totalPoints >= milestone.pointsRequired;
                      return (
                        <div 
                          key={milestone.id}
                          className={`relative p-6 rounded-3xl border transition-all ${
                            isUnlocked 
                              ? 'bg-gradient-to-br from-green-50/70 via-white to-amber-50/50 border-primary-green/40 shadow-md ring-2 ring-primary-green/20' 
                              : 'bg-white border-light-gray opacity-90'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${milestone.badgeColor}`}>
                                {milestone.iconName === 'crown' ? <Crown className="w-6 h-6" /> :
                                 milestone.iconName === 'trophy' ? <Trophy className="w-6 h-6" /> :
                                 milestone.iconName === 'sparkles' ? <Sparkles className="w-6 h-6" /> :
                                 <Gift className="w-6 h-6" />}
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-medium-gray block">
                                  {milestone.pointsRequired.toLocaleString()} Points
                                </span>
                                <h4 className="font-display font-black text-lg text-dark-gray">
                                  {language === 'fr' ? milestone.titleFr : milestone.titleEn}
                                </h4>
                              </div>
                            </div>

                            {isUnlocked ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-[11px] font-black rounded-full flex items-center gap-1 shrink-0">
                                <Check className="w-3.5 h-3.5" />
                                {t.loyaltyUnlocked}
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-light-gray text-medium-gray text-[11px] font-bold rounded-full shrink-0">
                                {language === 'fr' ? `Encore ${milestone.pointsRequired - loyaltyProfile.totalPoints} pts` : `${milestone.pointsRequired - loyaltyProfile.totalPoints} pts left`}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-medium-gray mb-4">
                            {language === 'fr' ? milestone.descriptionFr : milestone.descriptionEn}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-light-gray/60 text-xs">
                            <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                              {milestone.rewardValueLabel}
                            </span>
                            <span className="text-medium-gray italic font-medium flex items-center gap-1">
                              <Store className="w-3.5 h-3.5 text-primary-blue" />
                              {language === 'fr' ? 'Retrait boutique' : 'In-store pickup'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explication du fonctionnement & Retrait en Boutique */}
                <div className="bg-primary-blue/5 p-8 rounded-3xl border border-primary-blue/15 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-blue text-white rounded-2xl flex items-center justify-center shadow-md">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-xl text-dark-gray">{t.loyaltyHowItWorksTitle}</h3>
                      <p className="text-sm text-medium-gray">{t.loyaltyStoreNotice}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white p-5 rounded-2xl border border-primary-blue/10 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-primary-blue font-black flex items-center justify-center text-sm">1</div>
                      <h4 className="font-bold text-dark-gray">{language === 'fr' ? 'Commandez sur le site' : 'Order online'}</h4>
                      <p className="text-xs text-medium-gray">{t.loyaltyRule1}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-primary-blue/10 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 font-black flex items-center justify-center text-sm">2</div>
                      <h4 className="font-bold text-dark-gray">{language === 'fr' ? 'Atteignez les paliers (dès 10 pts)' : 'Reach milestones (from 10 pts)'}</h4>
                      <p className="text-xs text-medium-gray">{t.loyaltyRule2}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-primary-blue/10 space-y-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 text-primary-green font-black flex items-center justify-center text-sm">3</div>
                      <h4 className="font-bold text-dark-gray">{language === 'fr' ? 'Récupérez en boutique' : 'Collect in store'}</h4>
                      <p className="text-xs text-medium-gray">{t.loyaltyRule3}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-medium-gray italic">
                      {language === 'fr' 
                        ? '📞 Contact service fidélité : +237 6XX XXX XXX • Nos conseillers sont là pour vous accueillir.' 
                        : '📞 Loyalty customer desk: +237 6XX XXX XXX • Our team is ready to welcome you.'}
                    </p>
                    <button 
                      onClick={() => window.location.hash = 'catalogue'}
                      className="px-6 py-3 bg-primary-blue text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shrink-0 shadow-lg shadow-primary-blue/20"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {language === 'fr' ? 'Faire des achats & Gagner des points' : 'Shop & Earn Points'}
                    </button>
                  </div>
                </div>
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
                
                {/* Encart Résumé Programme Fidélité dans Mon Profil */}
                <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 text-white">
                          {language === 'fr' ? loyaltyProfile.tier.nameFr : loyaltyProfile.tier.nameEn}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-300 text-amber-950">
                          1 article = 1 pt = 10 FCFA
                        </span>
                      </div>
                      <h3 className="font-display font-black text-2xl mt-1 text-white flex items-baseline gap-2 flex-wrap">
                        <span>{loyaltyProfile.totalPoints.toLocaleString()} {t.loyaltyPointsBalance}</span>
                        <span className="text-sm font-bold text-amber-200">(= {loyaltyProfile.totalRewardFcfa.toLocaleString()} FCFA)</span>
                      </h3>
                      <p className="text-sm text-white/80 mt-0.5">
                        {loyaltyProfile.nextMilestone 
                          ? (language === 'fr' 
                              ? `Encore ${loyaltyProfile.pointsToNextMilestone.toLocaleString()} pts pour votre cadeau boutique de ${loyaltyProfile.nextMilestone.pointsRequired} pts !` 
                              : `Only ${loyaltyProfile.pointsToNextMilestone.toLocaleString()} pts to unlock your in-store gift!`)
                          : (language === 'fr' ? 'Vous avez débloqué tous les cadeaux actuels !' : 'All milestone gifts unlocked!')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('loyalty');
                      window.location.hash = 'profile?tab=loyalty';
                    }}
                    className="px-6 py-3.5 bg-white text-dark-gray rounded-xl font-bold text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 shrink-0 shadow-lg"
                  >
                    <Trophy className="w-4 h-4 text-amber-600" />
                    {t.viewMyLoyalty}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-light-gray shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg">{t.personalInfo}</h3>
                      <button className="text-primary-blue hover:underline font-bold text-sm flex items-center gap-1">
                        <Edit className="w-4 h-4" /> {t.edit}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <InfoGroup label={t.fullName} value={user.fullName} />
                      <InfoGroup label={t.phoneLabel} value={user.phone} />
                      <InfoGroup label={language === 'fr' ? 'Ville' : 'City'} value={user.city ?? (language === 'fr' ? 'Non renseignée' : 'Not provided')} />
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
                                 onClick={() => window.location.hash = `produits/${product.slug || product.id}`}
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
                  setNewAddress({ label: '', name: user.fullName, phone: user.phone, city: 'Douala', district: '', details: '' });
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
                 {calculateOrderPoints(order.items) > 0 && (
                   <>
                     <span className="w-1 h-1 bg-light-gray rounded-full" />
                     <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-black">
                       +{calculateOrderPoints(order.items)} pts ⭐ ({calculatePointsValue(calculateOrderPoints(order.items))} F)
                     </span>
                   </>
                 )}
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

// ─── Composant commande backend ───────────────────────────────────────────────

const ApiOrderCard: React.FC<{ order: OrderResponse }> = ({ order }) => {
  const { language } = useAppContext();
  const t = translations[language];
  const [isOpen, setIsOpen] = React.useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': case 'processing': return 'bg-green-50 text-primary-green border-green-200';
      case 'shipped': case 'delivered': return 'bg-blue-50 text-primary-blue border-blue-200';
      case 'payment_failed': case 'cancelled': return 'bg-red-50 text-red-500 border-red-200';
      default: return 'bg-orange-50 text-orange-600 border-orange-200';
    }
  };

  const getIconBg = (status: string) => {
    switch (status) {
      case 'confirmed': case 'processing': case 'delivered': return 'bg-green-50 text-primary-green';
      case 'shipped': return 'bg-blue-50 text-primary-blue';
      case 'payment_failed': case 'cancelled': return 'bg-red-50 text-red-500';
      default: return 'bg-orange-50 text-orange-600';
    }
  };

  const createdDate = new Date(order.createdAt).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Timeline : quels étapes sont actives selon le statut
  const statusOrder = ['pending_payment', 'pending_cod', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIdx = statusOrder.indexOf(order.status);
  const isAfter = (status: string) => currentIdx >= statusOrder.indexOf(status);

  return (
    <div className="bg-white rounded-3xl border border-light-gray overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getIconBg(order.status)}`}>
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-display font-black text-xl text-dark-gray italic uppercase tracking-tighter">
              #{order.orderNumber}
            </h4>
            <p className="text-sm text-medium-gray font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" /> {createdDate}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-display font-black text-primary-blue italic">
              {order.totalAmount.toLocaleString()} FCFA
            </p>
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusStyle(order.status)}`}>
                {order.statusLabel}
              </span>
              <span className="text-[10px] font-bold text-medium-gray">
                {order.items.length} {language === 'fr' ? 'articles' : 'items'}
              </span>
              {calculateOrderPoints(order.items && order.items.length > 0 ? order.items : 1) > 0 && (
                <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80" title={`${calculatePointsValue(calculateOrderPoints(order.items && order.items.length > 0 ? order.items : 1))} FCFA de valeur`}>
                  +{calculateOrderPoints(order.items && order.items.length > 0 ? order.items : 1)} pts ⭐ ({calculatePointsValue(calculateOrderPoints(order.items && order.items.length > 0 ? order.items : 1))} F)
                </span>
              )}
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
                <StatusPoint active={true} icon={<CheckCircle2 className="w-5 h-5" />} label={t.orderStatus.confirmed} sub={language === 'fr' ? 'Commande créée' : 'Order created'} />
                <StatusPoint active={isAfter('confirmed')} icon={<ShoppingBag className="w-5 h-5" />} label={t.orderStatus.preparation} sub={isAfter('processing') ? (language === 'fr' ? 'Terminé' : 'Done') : (language === 'fr' ? 'À venir' : 'Upcoming')} />
                <StatusPoint active={isAfter('shipped')} icon={<Truck className="w-5 h-5" />} label={t.orderStatus.shipped} sub={order.status === 'shipped' ? (language === 'fr' ? 'En cours' : 'In progress') : (language === 'fr' ? 'À venir' : 'Upcoming')} />
                <StatusPoint active={order.status === 'delivered'} icon={<CheckCircle2 className="w-5 h-5" />} label={t.orderStatus.deliveredPoint} sub={order.status === 'delivered' ? (language === 'fr' ? 'Effectué' : 'Completed') : (language === 'fr' ? 'À venir' : 'Upcoming')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                {/* Articles */}
                <div className="space-y-4">
                  <h5 className="font-black uppercase tracking-widest text-[11px] text-medium-gray italic">
                    {language === 'fr' ? 'Articles de la commande' : 'Order Items'}
                  </h5>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-light-gray/50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt={item.productName} />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-light-gray flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-medium-gray" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-dark-gray truncate">{item.productName}</p>
                          <p className="text-[10px] text-medium-gray font-bold">
                            {language === 'fr' ? 'Qté:' : 'Qty:'} {item.quantity}
                            {item.variantLabel ? ` | ${item.variantLabel}` : ''}
                          </p>
                        </div>
                        <p className="font-black text-primary-blue whitespace-nowrap">{item.subtotal.toLocaleString()} F</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infos livraison + totaux */}
                <div className="space-y-6">
                  {order.deliveryAddress && (
                    <div className="space-y-4">
                      <h5 className="font-black uppercase tracking-widest text-[11px] text-medium-gray italic">
                        {language === 'fr' ? 'Informations de livraison' : 'Delivery Information'}
                      </h5>
                      <div className="bg-white p-4 rounded-2xl border border-light-gray/50 space-y-2">
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary-blue shrink-0" />
                          <span className="font-bold">{order.deliveryAddress.fullName}</span>
                        </p>
                        <p className="text-medium-gray text-xs pl-6">{order.deliveryAddress.formatted}</p>
                        <p className="text-medium-gray text-xs pl-6">{order.deliveryAddress.phone}</p>
                      </div>
                    </div>
                  )}

                  {/* Récap financier */}
                  <div className="bg-white p-4 rounded-2xl border border-light-gray/50 space-y-2 text-xs">
                    <div className="flex justify-between text-medium-gray">
                      <span>{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                      <span>{order.itemsTotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-medium-gray">
                      <span>{language === 'fr' ? 'Livraison' : 'Delivery'}</span>
                      <span>{order.deliveryFee.toLocaleString()} FCFA</span>
                    </div>
                    {order.paymentFee > 0 && (
                      <div className="flex justify-between text-medium-gray">
                        <span>{language === 'fr' ? 'Frais mobile' : 'Mobile fee'}</span>
                        <span>{order.paymentFee.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-primary-green">
                        <span>{language === 'fr' ? 'Réduction' : 'Discount'}</span>
                        <span>-{order.discountAmount.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black pt-2 border-t border-light-gray">
                      <span className="text-dark-gray">{language === 'fr' ? 'Total' : 'Total'}</span>
                      <span className="text-primary-blue">{order.totalAmount.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 h-12 bg-white border border-light-gray text-dark-gray rounded-xl font-bold hover:bg-light-gray transition-colors text-xs">
                      {language === 'fr' ? 'Aide commande' : 'Order help'}
                    </button>
                    <button className="flex-1 h-12 bg-white border border-light-gray text-dark-gray rounded-xl font-bold hover:bg-light-gray transition-colors text-xs">
                      {language === 'fr' ? 'Suivre le livreur' : 'Track delivery'}
                    </button>
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
