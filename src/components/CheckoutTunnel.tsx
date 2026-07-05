import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, ArrowLeft, ChevronRight, Phone, 
  MapPin, User, CheckCircle2, Truck, Smartphone,
  Banknote, AlertCircle, Copy, Clock, RefreshCw,
  LogOut, XCircle, RotateCcw, X, Eye, EyeOff, Lock, Package
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import { createOrder, getPaymentStatus, type OrderResponse, type PaymentStatusResponse } from '../services/catalogueService';
import { normalizePhone, extractErrorMessage } from '../services/authService';
import logo from '../assets/donalgros.jpg';

type PaymentMode = 'now' | 'delivery' | null;
type MobileOperator = 'mtn_momo' | 'orange_money';

const MTN_LOGO = "https://i0.wp.com/kamer-android.com/wp-content/uploads/2025/06/okmtnok-scaled.jpg?fit=2560%2C1440&ssl=1";
const ORANGE_LOGO = "https://logos-marques.com/wp-content/uploads/2021/07/Orange-Money-logo.png";

const MAX_POLL_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 3000;

export const CheckoutTunnel = () => {
  const { cart, user, clearCart, language, login, register, settings } = useAppContext();
  const t = translations[language];
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>(null);
  const [step, setStep] = React.useState(0);
  // step 0: choisir mode, 1: adresse, 2: paiement mobile, 3: polling/attente, 4: succès, 5: échec

  // ─── Auth Gate Modal ─────────────────────────────────────────────────────
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  // Mode choisi AVANT que l'on ouvre la modale — pour reprendre après auth
  const [pendingMode, setPendingMode] = React.useState<PaymentMode>(null);
  const [authTab, setAuthTab] = React.useState<'login' | 'register'>('login');
  // Login form
  const [authPhone, setAuthPhone] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authShowPassword, setAuthShowPassword] = React.useState(false);
  // Register form
  const [regFirstName, setRegFirstName] = React.useState('');
  const [regLastName, setRegLastName] = React.useState('');
  const [regCity, setRegCity] = React.useState('Douala');
  const [regPhone, setRegPhone] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [regShowPassword, setRegShowPassword] = React.useState(false);
  // Auth state
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  const [addressData, setAddressData] = React.useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    phone: user?.phone || '',
    city: 'Douala',
    area: '',
    street: '',
    instructions: ''
  });
  const [operator, setOperator] = React.useState<MobileOperator>('mtn_momo');
  const [payerPhone, setPayerPhone] = React.useState('');
  const [promoCode, setPromoCode] = React.useState('');

  // État de la commande créée
  const [createdOrder, setCreatedOrder] = React.useState<OrderResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Polling state
  const [pollingStatus, setPollingStatus] = React.useState<PaymentStatusResponse['statusInfo'] | null>(null);
  const [pollingAttempts, setPollingAttempts] = React.useState(0);
  const [paymentFailed, setPaymentFailed] = React.useState(false);
  const [failureMessage, setFailureMessage] = React.useState('');
  const pollingIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Erreurs de formulaire
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = React.useState('');

  // Calculs prix
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Tarif de livraison dynamique
  const getDeliveryFare = () => {
    if (settings.useGlobalDeliveryPrice) {
      return settings.globalDeliveryPrice;
    }
    const matchedZone = settings.shipping.find(
      s => s.city.toLowerCase() === addressData.city.toLowerCase()
    );
    if (matchedZone) return matchedZone.price;
    return settings.globalDeliveryPrice || 2000;
  };
  const deliveryFare = getDeliveryFare();
  const paymentFee = paymentMode === 'now' ? Math.round(subtotal * 0.015) : 0;
  const total = subtotal + deliveryFare + paymentFee;

  // Nettoyage polling au démontage
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = (orderId: number) => {
    let attempts = 0;
    setPollingAttempts(0);

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollingAttempts(attempts);

      try {
        const statusData = await getPaymentStatus(orderId);
        setPollingStatus(statusData.statusInfo);

        if (statusData.isFinal || attempts >= MAX_POLL_ATTEMPTS) {
          stopPolling();

          if (statusData.paymentStatus === 'confirmed') {
            setStep(4); // succès
          } else {
            setFailureMessage(
              statusData.failureMessage ||
              (language === 'fr' 
                ? 'Le paiement n\'a pas pu être confirmé. Veuillez réessayer.' 
                : 'Payment could not be confirmed. Please try again.')
            );
            setPaymentFailed(true);
            setStep(5); // échec
          }
        }
      } catch (err) {
        console.error('Erreur polling paiement:', err);
        // On continue le polling en cas d'erreur réseau temporaire
      }
    }, POLL_INTERVAL_MS);
  };

  // ─── Résolution à la volée du variantId ──────────────────────────────────
  // Chaque CartItem contient déjà ses variants (hérité de Product).
  // Si variantId n'est pas défini (items ajoutés avant le fix), on le retrouve
  // via selectedColor/selectedSize → variants[matched] → variants[0] en dernier recours.
  const resolveVariantId = (item: typeof cart[0]): number | null => {
    if (item.variantId) return item.variantId;
    if (!item.variants || item.variants.length === 0) return null;
    const matched = item.variants.find(v =>
      (!item.selectedColor || v.color === item.selectedColor) &&
      (!item.selectedSize  || v.size  === item.selectedSize)
    );
    return (matched ?? item.variants[0]).id ?? null;
  };

  const buildPayload = () => {
    if (cart.length === 0) {
      throw new Error(language === 'fr' ? 'Votre panier est vide.' : 'Your cart is empty.');
    }

    // Résoudre tous les variantIds (même pour les items déjà en panier)
    const resolvedItems = cart.map(item => ({
      ...item,
      resolvedVariantId: resolveVariantId(item),
    }));

    // Bloquer seulement si un article est réellement introuvable côté backend
    // (produit sans aucune variante configurée dans la base)
    const stillMissing = resolvedItems.filter(i => !i.resolvedVariantId);
    if (stillMissing.length > 0) {
      const names = [...new Set(stillMissing.map(i => `"${i.name}"` ))].join(', ');
      throw new Error(
        language === 'fr'
          ? `Ces produits ne sont plus disponibles à la commande : ${names}.`
          : `These products are no longer available for order: ${names}.`
      );
    }

    return {
      items: resolvedItems.map(item => ({
        variantId: item.resolvedVariantId as number,
        quantity: item.quantity,
      })),
      paymentMethod: paymentMode === 'delivery'
        ? 'cash_on_delivery' as const
        : operator,
      payerPhone: paymentMode === 'now' ? `+237${payerPhone.replace(/\s/g, '')}` : null,
      promoCode: promoCode.trim() || null,
      deliveryFee: deliveryFare,
      deliveryAddress: {
        firstName: addressData.firstName.trim(),
        lastName: addressData.lastName.trim(),
        phone: `+237${addressData.phone.replace(/\s/g, '')}`,
        city: addressData.city,
        district: addressData.area.trim(),
        street: addressData.street.trim() || undefined,
        instructions: addressData.instructions.trim() || undefined,
      },
    };
  };




  const processOrder = async () => {
    setGlobalError('');
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = buildPayload();
      const { order, requiresPolling } = await createOrder(payload);
      setCreatedOrder(order);

      if (requiresPolling) {
        // Paiement mobile → écran polling
        setStep(3);
        setPollingStatus({
          title: language === 'fr' ? 'Demande envoyée' : 'Request sent',
          message: language === 'fr' ? 'En attente de confirmation...' : 'Waiting for confirmation...',
          color: 'info',
          instruction: language === 'fr' 
            ? 'Vérifiez votre téléphone et confirmez le paiement.' 
            : 'Check your phone and confirm the payment.',
        });
        startPolling(order.id);
      } else {
        // Cash → succès immédiat
        setStep(4);
        clearCart();
      }
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 422) {
        // Erreurs de validation par champ
        setFieldErrors(err.response.data.errors || {});
        setGlobalError(err.response.data.message || language === 'fr' ? 'Données invalides.' : 'Invalid data.');
        // Revenir à l'étape adresse si erreur adresse
        const hasAddressError = Object.keys(err.response.data.errors || {}).some(k => k.startsWith('deliveryAddress'));
        if (hasAddressError) setStep(1);
      } else if (status === 400) {
        // Erreur métier : stock insuffisant, promo invalide...
        setGlobalError(err.response.data.message || language === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.');
      } else {
        setGlobalError(err.message || (language === 'fr' ? 'Impossible de traiter la commande.' : 'Unable to process the order.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Auth Gate — intercepte le choix de mode ─────────────────────────────
  const handleModeChoice = (mode: PaymentMode) => {
    if (!user) {
      // Mémoriser le mode choisi pour y revenir après auth
      setPendingMode(mode);
      setShowAuthModal(true);
      return;
    }
    setPaymentMode(mode);
    setStep(1);
  };

  // Appelé après une auth réussie depuis la modale
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setAuthError('');
    if (pendingMode) {
      setPaymentMode(pendingMode);
      setStep(1);
      setPendingMode(null);
    }
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await login({ phone: authPhone, password: authPassword });
      handleAuthSuccess();
    } catch (err) {
      setAuthError(extractErrorMessage(err, language === 'fr' ? 'Téléphone ou mot de passe incorrect.' : 'Incorrect phone or password.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await register({ firstName: regFirstName, lastName: regLastName, city: regCity, phone: regPhone, password: regPassword });
      handleAuthSuccess();
    } catch (err) {
      setAuthError(extractErrorMessage(err, language === 'fr' ? 'Erreur lors de la création du compte.' : 'Error creating account.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleNextStep = () => {
    setGlobalError('');
    setFieldErrors({});
    if (step === 1) {
      // Validation adresse basique
      if (!addressData.firstName.trim() || !addressData.lastName.trim()) {
        setGlobalError(language === 'fr' ? 'Prénom et nom sont obligatoires.' : 'First and last name are required.');
        return;
      }
      if (!addressData.phone.trim()) {
        setGlobalError(language === 'fr' ? 'Le téléphone est obligatoire.' : 'Phone is required.');
        return;
      }
      if (!addressData.area.trim()) {
        setGlobalError(language === 'fr' ? 'Le quartier est obligatoire.' : 'District is required.');
        return;
      }

      if (paymentMode === 'delivery') {
        processOrder();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (!payerPhone.trim()) {
        setGlobalError(language === 'fr' ? 'Le numéro de téléphone mobile est obligatoire.' : 'Mobile phone number is required.');
        return;
      }
      processOrder();
    }
  };

  const handleRetry = () => {
    stopPolling();
    setPaymentFailed(false);
    setFailureMessage('');
    setPollingStatus(null);
    setPollingAttempts(0);
    setCreatedOrder(null);
    setStep(2);
  };

  const handleConfirmSuccess = () => {
    clearCart();
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'success': return 'text-primary-green';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-orange-500';
      default: return 'text-primary-blue';
    }
  };

  const getStatusBg = (color: string) => {
    switch (color) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-orange-50 border-orange-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const ProgressIndicator = () => {
    const totalSteps = paymentMode === 'now' ? 3 : 2;
    const currentStep = step === 0 ? 0 : step >= 4 ? totalSteps : Math.min(step, totalSteps - 1);
    const stepsToShow = paymentMode === 'delivery'
      ? [0, 1, 3]
      : [0, 1, 2, 3];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-light-gray -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary-green transition-all duration-500 -translate-y-1/2 z-0"
            style={{ width: step >= 4 ? '100%' : `${(currentStep / (stepsToShow.length - 1)) * 100}%` }}
          />
          {stepsToShow.map((s, idx) => {
            const isActive = step === s || (s === 3 && (step === 3 || step === 4));
            const isCompleted = step > s || step >= 4;
            let label = '';
            if (s === 0) label = t.checkoutStepPayment;
            else if (s === 1) label = t.checkoutStepDelivery;
            else if (s === 2) label = t.checkoutStepReglement;
            else if (s === 3) label = t.checkoutStepConfirmation;
            return (
              <div key={`step-${s}`} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-primary-green text-white' : isActive ? 'bg-primary-blue text-white ring-4 ring-primary-blue/20' : 'bg-white border-2 border-light-gray text-medium-gray'}`}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{idx + 1}</span>}
                </div>
                <span className={`absolute top-12 whitespace-nowrap text-xs font-bold uppercase tracking-widest ${isCompleted ? 'text-primary-green' : isActive ? 'text-primary-blue' : 'text-medium-gray'}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Simplified Header */}
      <header className="bg-white border-b border-light-gray py-6">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between">
          <div onClick={() => window.location.hash = ''} className="flex items-center gap-3 cursor-pointer group">
            <img src={logo} alt="Donald Gros Logo" className="w-9 h-9 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div className="w-1 h-6 bg-primary-green" />
            <span className="text-2xl font-display font-black text-primary-blue">
              DONALD <span className="group-hover:text-primary-green transition-colors">GROS</span>
            </span>
          </div>
          <button className="text-sm font-bold text-medium-gray hover:text-primary-blue transition-colors flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            {t.needHelp}
          </button>
        </div>
      </header>

      {step < 4 && step !== 3 && <ProgressIndicator />}

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 pb-32">
        <AnimatePresence mode="wait">

          {/* STEP 0 — CHOIX DU MODE */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-3xl mx-auto space-y-10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-black text-dark-gray">{t.howToPay}</h2>
                <p className="text-medium-gray font-medium">{t.choosePaymentMode}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => handleModeChoice('now')} className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-primary-blue transition-all text-left shadow-lg hover:shadow-2xl relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 rounded-full translate-x-12 -translate-y-12" />
                  <div className="w-16 h-16 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center mb-6">
                    <Smartphone className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-dark-gray mb-3 italic">{t.payNow}</h3>
                  <p className="text-sm text-medium-gray leading-relaxed mb-6">{t.payNowDesc}</p>
                  <div className="flex gap-4 mb-8">
                    <div className="h-14 px-3 bg-white rounded-xl flex items-center border border-light-gray shadow-sm transition-transform hover:scale-105">
                      <img src={MTN_LOGO} alt="MTN MoMo" className="h-10 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="h-14 px-3 bg-white rounded-xl flex items-center border border-light-gray shadow-sm transition-transform hover:scale-105">
                      <img src={ORANGE_LOGO} alt="Orange Money" className="h-10 object-contain" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="px-3 py-1 bg-green-100 text-primary-green text-[10px] font-black rounded-full uppercase tracking-tighter">{t.instantConfirmation}</span>
                  </div>
                </button>

                <button onClick={() => handleModeChoice('delivery')} className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-primary-green transition-all text-left shadow-lg hover:shadow-2xl relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full translate-x-12 -translate-y-12" />
                  <div className="w-16 h-16 bg-green-50 text-primary-green rounded-2xl flex items-center justify-center mb-6">
                    <Banknote className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-dark-gray mb-3 italic">{t.payAtDelivery}</h3>
                  <p className="text-sm text-medium-gray leading-relaxed mb-6">{t.payAtDeliveryDesc}</p>
                  <div className="mt-auto">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-tighter">{t.noAdvancePayment}</span>
                  </div>
                  <p className="mt-4 text-[10px] text-medium-gray italic font-medium">
                    {language === 'fr' ? 'Disponible uniquement pour les villes sélectionnées.' : 'Available only for selected cities.'}
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1 — ADRESSE DE LIVRAISON */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                {paymentMode === 'delivery' && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-sm text-primary-blue">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">
                      {language === 'fr' ? 'Vous avez choisi le paiement à la livraison. Prévoyez le montant exact pour le livreur.' : 'You chose cash on delivery. Please have the exact amount ready for the delivery person.'}
                    </p>
                  </div>
                )}

                {globalError && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-sm text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{globalError}</p>
                  </div>
                )}

                <h2 className="text-2xl font-display font-black text-dark-gray">{t.deliveryAddress}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label={`${t.firstName} *`}
                    icon={<User className="w-4 h-4" />}
                    value={addressData.firstName}
                    onChange={v => setAddressData({...addressData, firstName: v})}
                    placeholder={language === 'fr' ? 'Votre prénom' : 'Your first name'}
                    error={fieldErrors['deliveryAddress.firstName']?.[0]}
                  />
                  <InputGroup
                    label={`${t.lastName} *`}
                    icon={<User className="w-4 h-4" />}
                    value={addressData.lastName}
                    onChange={v => setAddressData({...addressData, lastName: v})}
                    placeholder={language === 'fr' ? 'Votre nom' : 'Your last name'}
                    error={fieldErrors['deliveryAddress.lastName']?.[0]}
                  />

                  {/* Téléphone adresse */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray">{t.deliveryPhone} *</label>
                    <div className={`flex h-12 rounded-xl border overflow-hidden focus-within:border-primary-blue bg-white transition-all ${fieldErrors['deliveryAddress.phone'] ? 'border-red-400' : 'border-light-gray'}`}>
                      <div className="bg-light-gray/30 px-3 flex items-center gap-2 border-r border-light-gray">
                        <span className="text-lg">🇨🇲</span>
                        <span className="text-sm font-bold">+237</span>
                      </div>
                      <input
                        type="tel"
                        className="flex-1 px-4 outline-none text-sm font-medium"
                        placeholder="6XX XXX XXX"
                        value={addressData.phone}
                        onChange={e => setAddressData({...addressData, phone: e.target.value})}
                      />
                    </div>
                    {fieldErrors['deliveryAddress.phone'] && (
                      <p className="text-xs text-red-500 font-medium">{fieldErrors['deliveryAddress.phone'][0]}</p>
                    )}
                  </div>

                  {/* Ville */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray">{t.city} *</label>
                    <select
                      className="w-full h-12 bg-white rounded-xl border border-light-gray px-4 outline-none text-sm font-medium focus:border-primary-blue transition-all"
                      value={addressData.city}
                      onChange={e => setAddressData({...addressData, city: e.target.value})}
                    >
                      <option>Douala</option>
                      <option>Yaoundé</option>
                      <option>Bafoussam</option>
                      <option>Garoua</option>
                      <option>Bamenda</option>
                    </select>
                  </div>

                  <InputGroup
                    label={`${t.areaLabel} *`}
                    icon={<MapPin className="w-4 h-4" />}
                    value={addressData.area}
                    onChange={v => setAddressData({...addressData, area: v})}
                    placeholder="Ex: Bastos, Akwa..."
                    error={fieldErrors['deliveryAddress.district']?.[0]}
                  />
                  <InputGroup
                    label={t.streetLabel}
                    icon={<MapPin className="w-4 h-4" />}
                    value={addressData.street}
                    onChange={v => setAddressData({...addressData, street: v})}
                    placeholder={language === 'fr' ? 'Ex: Rue 1234, face marché' : 'Ex: Street 1234, facing market'}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-dark-gray">{t.instructionsLabel}</label>
                  <textarea
                    className="w-full h-32 bg-white rounded-xl border border-light-gray p-4 outline-none text-sm font-medium focus:border-primary-blue transition-all resize-none"
                    placeholder={language === 'fr' ? "Ex: Portail rouge, maison au premier étage, appeler dès l'arrivée..." : "Ex: Red gate, house on first floor, call on arrival..."}
                    value={addressData.instructions}
                    onChange={e => setAddressData({...addressData, instructions: e.target.value})}
                  />
                </div>

                {/* Code promo optionnel */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-dark-gray">
                    {language === 'fr' ? 'Code Promo (optionnel)' : 'Promo Code (optional)'}
                  </label>
                  <input
                    type="text"
                    className="w-full h-12 bg-white rounded-xl border border-light-gray px-4 outline-none text-sm font-mono focus:border-primary-blue transition-all uppercase"
                    placeholder="EX: DONALD10"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-12 h-14 bg-primary-blue text-white rounded-xl font-display font-bold shadow-xl shadow-primary-blue/20 hover:bg-dark-gray transition-all mt-6 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isSubmitting && <RefreshCw className="w-5 h-5 animate-spin" />}
                  {paymentMode === 'delivery' ? t.confirmOrder : t.continueToPayment}
                </button>
              </div>

              <div className="lg:col-span-1">
                <OrderSummary subtotal={subtotal} delivery={deliveryFare} fees={paymentFee} cart={cart} />
              </div>
            </motion.div>
          )}

          {/* STEP 2 — CHOIX OPÉRATEUR MOBILE */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black text-dark-gray">
                    {language === 'fr' ? 'Moyen de Paiement Mobile' : 'Mobile Payment Method'}
                  </h2>
                  <p className="text-medium-gray text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary-green" />
                    {language === 'fr' ? 'Votre transaction est entièrement sécurisée' : 'Your transaction is fully secure'}
                  </p>
                </div>

                {globalError && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-sm text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{globalError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    { id: 'mtn_momo' as const, label: 'MTN Mobile Money', logo: MTN_LOGO, desc: 'Paiement direct via MTN MoMo.', phones: '67X ou 68X' },
                    { id: 'orange_money' as const, label: 'Orange Money', logo: ORANGE_LOGO, desc: 'Utilisez votre compte Orange Money.', phones: '69X' },
                  ].map(op => (
                    <div
                      key={op.id}
                      onClick={() => setOperator(op.id)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${operator === op.id ? 'bg-blue-50/50 border-primary-blue' : 'bg-white border-light-gray hover:border-blue-200'}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white border border-light-gray rounded-2xl flex items-center justify-center p-2 shadow-sm shrink-0">
                          <img src={op.logo} alt={op.label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{op.label}</h4>
                          <p className="text-sm text-medium-gray">{op.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${operator === op.id ? 'border-primary-blue' : 'border-light-gray'}`}>
                          {operator === op.id && <div className="w-3 h-3 bg-primary-blue rounded-full" />}
                        </div>
                      </div>

                      {operator === op.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-6 pt-6 border-t border-blue-100 overflow-hidden">
                          <div className="space-y-4">
                            <label className="text-sm font-bold">
                              {language === 'fr' ? `Numéro de téléphone ${op.label} *` : `${op.label} Phone Number *`}
                            </label>
                            <div className={`flex h-12 rounded-xl border bg-white overflow-hidden ${fieldErrors['payerPhone'] ? 'border-red-400' : 'border-primary-blue'}`}>
                              <div className="bg-blue-50 px-3 flex items-center gap-2 border-r border-blue-100 font-bold text-primary-blue">+237</div>
                              <input
                                type="tel"
                                autoFocus
                                className="flex-1 px-4 outline-none font-bold"
                                placeholder={`${op.phones} XXX XXX`}
                                value={payerPhone}
                                onChange={e => setPayerPhone(e.target.value)}
                              />
                            </div>
                            {fieldErrors['payerPhone'] && (
                              <p className="text-xs text-red-500 font-medium">{fieldErrors['payerPhone'][0]}</p>
                            )}
                            <p className="text-[10px] text-medium-gray italic font-medium">
                              {language === 'fr' ? 'Une demande de paiement sera envoyée sur ce numéro.' : 'A payment request will be sent to this number.'}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-light-gray space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="text-medium-gray">{language === 'fr' ? 'Total à régler :' : 'Total to settle:'}</span>
                    <span className="text-2xl font-display font-black text-primary-blue">{total.toLocaleString()} FCFA</span>
                  </div>
                  <button
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="w-full h-16 bg-primary-blue text-white rounded-xl font-display font-bold shadow-2xl shadow-primary-blue/30 hover:bg-dark-gray transition-all relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        {language === 'fr' ? 'Traitement...' : 'Processing...'}
                      </>
                    ) : (
                      `${language === 'fr' ? 'Payer' : 'Pay'} ${total.toLocaleString()} FCFA`
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <OrderSummary subtotal={subtotal} delivery={deliveryFare} fees={paymentFee} cart={cart} />
              </div>
            </motion.div>
          )}

          {/* STEP 3 — ÉCRAN DE POLLING (attente paiement mobile) */}
          {step === 3 && (
            <motion.div key="step3-polling" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto py-10">
              <div className="bg-white rounded-[32px] p-8 md:p-12 text-center space-y-8 shadow-2xl border border-light-gray">
                {/* Icône animée */}
                <div className="w-24 h-24 mx-auto relative">
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${pollingStatus?.color === 'success' ? 'bg-green-50' : pollingStatus?.color === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <Smartphone className={`w-12 h-12 ${pollingStatus ? getStatusColor(pollingStatus.color) : 'text-primary-blue'}`} />
                  </div>
                  {pollingStatus?.color === 'info' && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-primary-blue/20 rounded-full"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-black">
                    {pollingStatus?.title || (language === 'fr' ? 'Traitement en cours...' : 'Processing...')}
                  </h3>
                  <p className="text-medium-gray font-medium">
                    {pollingStatus?.message || (language === 'fr' ? 'Vérification du paiement...' : 'Verifying payment...')}
                  </p>
                  {pollingStatus?.instruction && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 text-left ${getStatusBg(pollingStatus.color)}`}>
                      <ShieldCheck className={`w-6 h-6 shrink-0 ${getStatusColor(pollingStatus.color)}`} />
                      <p className="text-sm font-semibold text-dark-gray">{pollingStatus.instruction}</p>
                    </div>
                  )}
                </div>

                {/* Numéro de commande */}
                {createdOrder && (
                  <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                    <span className="text-sm font-bold text-primary-blue">
                      {language === 'fr' ? 'Commande' : 'Order'} #{createdOrder.orderNumber}
                    </span>
                  </div>
                )}

                {/* Barre de progression polling */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-medium-gray font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{language === 'fr' ? 'Vérification' : 'Checking'} {pollingAttempts}/{MAX_POLL_ATTEMPTS}</span>
                  </div>
                  <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary-blue"
                      animate={{ width: `${(pollingAttempts / MAX_POLL_ATTEMPTS) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <p className="text-xs text-medium-gray italic">
                  {language === 'fr' 
                    ? 'Ne fermez pas cette page. Vous serez automatiquement redirigé.'
                    : 'Do not close this page. You will be automatically redirected.'}
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — SUCCÈS */}
          {step === 4 && (
            <motion.div key="step4-success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-3xl mx-auto py-10">
              <div className="bg-white rounded-[40px] shadow-2xl p-10 md:p-16 text-center border border-light-gray">
                <div className="w-24 h-24 bg-green-50 text-primary-green rounded-full flex items-center justify-center mx-auto mb-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <CheckCircle2 className="w-16 h-16" strokeWidth={2.5} />
                  </motion.div>
                </div>

                <div className="space-y-4 mb-12">
                  <h2 className="text-4xl font-display font-black text-dark-gray">
                    {paymentMode === 'now' ? t.orderConfirmed : t.orderRegistered}
                  </h2>
                  <p className="text-lg text-medium-gray">
                    {t.thanksConfidence}, <span className="font-bold text-dark-gray">{addressData.firstName}</span>.{' '}
                    {language === 'fr' ? 'Votre colis sera bientôt prêt.' : 'Your package will be ready soon.'}
                  </p>

                  {createdOrder && (
                    <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-2 rounded-full border border-blue-100 mt-4">
                      <span className="text-sm font-bold text-primary-blue">
                        {t.orderNo} : #{createdOrder.orderNumber}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(createdOrder.orderNumber)}
                        className="hover:scale-110 transition-transform"
                      >
                        <Copy className="w-4 h-4 text-primary-blue" />
                      </button>
                    </div>
                  )}
                </div>

                {paymentMode === 'delivery' && (
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 mb-10 text-left flex gap-6">
                    <Banknote className="w-12 h-12 text-orange-500 shrink-0" />
                    <div>
                      <p className="font-black text-orange-800 text-xl italic mb-1 uppercase tracking-tight">{t.paymentReminder}</p>
                      <p className="text-orange-700 font-medium">
                        {t.prepareCash.replace('somme', `somme de ${total.toLocaleString()} FCFA`)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                  <div className="p-6 bg-light-gray/30 rounded-2xl text-left border border-light-gray/50">
                    <Truck className="w-6 h-6 text-primary-blue mb-4" />
                    <p className="text-xs font-bold text-medium-gray uppercase mb-2">{t.estimatedDelivery}</p>
                    <p className="font-bold text-dark-gray">
                      {language === 'fr' ? '2 à 5 jours ouvrables' : '2 to 5 business days'}
                    </p>
                  </div>
                  <div className="p-6 bg-light-gray/30 rounded-2xl text-left border border-light-gray/50">
                    <Smartphone className="w-6 h-6 text-primary-green mb-4" />
                    <p className="text-xs font-bold text-medium-gray uppercase mb-2">Confirmation SMS</p>
                    <p className="font-bold text-dark-gray">
                      {language === 'fr' ? 'Envoyé au' : 'Sent to'} +237 {addressData.phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Bouton WhatsApp de validation de commande */}
                  <a
                    href={`https://wa.me/237696001685?text=Bonjour,%20je%20viens%20de%20passer%20la%20commande%20n%C2%B0%20${createdOrder ? createdOrder.orderNumber : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-16 bg-[#25D366] text-white rounded-2xl font-display font-black text-sm uppercase tracking-widest shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.238 1.45 4.82 1.452 5.432 0 9.85-4.42 9.853-9.857.002-2.633-1.02-5.107-2.88-6.968C16.58 1.96 14.103.938 11.999.938c-5.441 0-9.859 4.42-9.863 9.858-.001 1.762.483 3.486 1.4 5.02L2.527 21.1l5.12-1.946zm11.366-6.126c-.3-.15-1.77-.875-2.04-.975-.27-.1-.466-.15-.66.15-.195.3-.755.975-.927 1.17-.172.195-.344.22-.644.07-1.127-.565-1.947-.973-2.705-2.27-.19-.33.19-.307.545-1.013.09-.184.045-.347-.023-.497-.067-.15-.66-1.59-.904-2.18-.24-.575-.48-.495-.66-.504-.17-.008-.363-.01-.557-.01-.19 0-.507.07-.773.356-.265.285-1.012.99-1.012 2.412s1.035 2.784 1.18 2.977c.145.195 2.036 3.11 4.93 4.364.688.3 1.224.478 1.644.612.69.22 1.32.19 1.815.115.55-.083 1.77-.72 2.02-1.417.25-.7 1.02-2.037.93-2.185-.09-.15-.3-.22-.6-.37z"/>
                    </svg>
                    {language === 'fr' ? 'Confirmer la commande sur WhatsApp' : 'Confirm order on WhatsApp'}
                  </a>

                  <button
                    onClick={() => { handleConfirmSuccess(); window.location.hash = ''; }}
                    className="w-full h-16 bg-primary-blue text-white rounded-2xl font-display font-bold shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {t.backToHome}
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => { handleConfirmSuccess(); window.location.hash = 'profile?tab=orders'; }}
                      className="flex-1 h-14 bg-white border-2 border-light-gray text-dark-gray rounded-2xl font-bold hover:bg-light-gray transition-all"
                    >
                      {t.myOrders}
                    </button>
                    <button className="flex-1 h-14 bg-white border-2 border-light-gray text-dark-gray rounded-2xl font-bold hover:bg-light-gray transition-all">
                      {language === 'fr' ? 'Facture PDF' : 'PDF Invoice'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5 — ÉCHEC PAIEMENT */}
          {step === 5 && (
            <motion.div key="step5-failure" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg mx-auto py-10">
              <div className="bg-white rounded-[32px] p-8 md:p-12 text-center space-y-8 shadow-2xl border border-red-100">
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-14 h-14" strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-black text-dark-gray">
                    {language === 'fr' ? 'Paiement non confirmé' : 'Payment not confirmed'}
                  </h3>
                  <p className="text-medium-gray">{failureMessage}</p>
                </div>

                {createdOrder && (
                  <div className="bg-light-gray/50 p-4 rounded-xl text-sm text-medium-gray">
                    {language === 'fr' ? 'Référence commande :' : 'Order reference:'} <span className="font-bold text-dark-gray">#{createdOrder.orderNumber}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full h-14 bg-primary-blue text-white rounded-xl font-display font-bold shadow-lg shadow-primary-blue/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    {language === 'fr' ? 'Réessayer avec un autre numéro' : 'Try again with another number'}
                  </button>
                  <button
                    onClick={() => window.location.hash = ''}
                    className="w-full h-12 text-medium-gray font-bold hover:underline"
                  >
                    {language === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer sécurité */}
      <footer className="fixed bottom-0 inset-x-0 bg-dark-gray text-white py-4 px-8 z-50">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 opacity-100">
            <div className="h-10 bg-white px-2 rounded-lg flex items-center justify-center border border-white/20 shadow-sm">
              <img src={MTN_LOGO} alt="MoMo" className="h-8 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="h-10 bg-white px-2 rounded-lg flex items-center justify-center border border-white/20 shadow-sm">
              <img src={ORANGE_LOGO} alt="OM" className="h-8 object-contain" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary-green text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            {language === 'fr' ? 'Paiement 100% sécurisé et protégé' : '100% Secure and Protected Payment'}
          </div>
          <div className="flex gap-4 opacity-40 text-[10px] uppercase font-bold tracking-tighter">
            <a href="#">{language === 'fr' ? 'CGV' : 'T&C'}</a>
            <a href="#">{language === 'fr' ? 'Confidentialité' : 'Privacy'}</a>
          </div>
        </div>
      </footer>

      {/* ─── AUTH GATE MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => { setShowAuthModal(false); setPendingMode(null); }}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
            >
              {/* Gradient header */}
              <div className="relative bg-gradient-to-br from-primary-blue to-[#1a3a6e] px-8 pt-10 pb-8 text-white overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                <button
                  onClick={() => { setShowAuthModal(false); setPendingMode(null); }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                      {language === 'fr' ? 'Votre panier vous attend !' : 'Your cart is waiting!'}
                    </p>
                    <h2 className="text-xl font-display font-black">
                      {language === 'fr' ? 'Identifiez-vous pour continuer' : 'Sign in to continue'}
                    </h2>
                  </div>
                </div>
                <div className="relative z-10 bg-white/15 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-300 shrink-0" />
                  <p className="text-sm font-medium opacity-90">
                    {language === 'fr'
                      ? 'Connectez-vous pour suivre vos commandes facilement et retrouver votre panier intact.'
                      : 'Sign in to track your orders easily and find your cart intact.'}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-light-gray mx-8 mt-6">
                <button
                  onClick={() => { setAuthTab('login'); setAuthError(''); }}
                  className={`flex-1 pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${
                    authTab === 'login'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-medium-gray hover:text-dark-gray'
                  }`}
                >
                  {language === 'fr' ? 'Se connecter' : 'Log in'}
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthError(''); }}
                  className={`flex-1 pb-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${
                    authTab === 'register'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-medium-gray hover:text-dark-gray'
                  }`}
                >
                  {language === 'fr' ? 'Créer un compte' : 'Create account'}
                </button>
              </div>

              <div className="px-8 pb-8 pt-6">
                {authError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="font-medium">{authError}</p>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* ── LOGIN ── */}
                  {authTab === 'login' && (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleAuthLogin}
                      className="space-y-4"
                    >
                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                          {language === 'fr' ? 'Téléphone' : 'Phone'}
                        </label>
                        <div className="flex h-12 rounded-xl border border-light-gray overflow-hidden focus-within:border-primary-blue bg-white transition-all">
                          <div className="bg-light-gray/40 px-3 flex items-center gap-1 border-r border-light-gray">
                            <span className="text-base">🇨🇲</span>
                            <span className="text-xs font-bold">+237</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="6XX XXX XXX"
                            value={authPhone}
                            onChange={e => setAuthPhone(e.target.value)}
                            className="flex-1 px-3 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                          {language === 'fr' ? 'Mot de passe' : 'Password'}
                        </label>
                        <div className="flex h-12 rounded-xl border border-light-gray overflow-hidden focus-within:border-primary-blue bg-white transition-all">
                          <div className="bg-light-gray/40 px-3 flex items-center border-r border-light-gray">
                            <Lock className="w-4 h-4 text-medium-gray" />
                          </div>
                          <input
                            type={authShowPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={authPassword}
                            onChange={e => setAuthPassword(e.target.value)}
                            className="flex-1 px-3 outline-none text-sm font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setAuthShowPassword(v => !v)}
                            className="px-3 text-medium-gray hover:text-dark-gray transition-colors"
                          >
                            {authShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-13 bg-primary-blue text-white rounded-xl font-display font-bold shadow-lg shadow-primary-blue/25 hover:bg-dark-gray transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 py-3.5"
                      >
                        {authLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                        {language === 'fr' ? 'Se connecter et continuer' : 'Sign in and continue'}
                      </button>

                      <p className="text-center text-xs text-medium-gray">
                        {language === 'fr' ? "Pas encore de compte ? " : "No account yet? "}
                        <button
                          type="button"
                          onClick={() => { setAuthTab('register'); setAuthError(''); }}
                          className="text-primary-blue font-bold hover:underline"
                        >
                          {language === 'fr' ? 'Créer le mien' : 'Create mine'}
                        </button>
                      </p>
                    </motion.form>
                  )}

                  {/* ── REGISTER ── */}
                  {authTab === 'register' && (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleAuthRegister}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                            {language === 'fr' ? 'Prénom' : 'First name'}
                          </label>
                          <input
                            required
                            placeholder={language === 'fr' ? 'Ex: Jean' : 'Ex: John'}
                            value={regFirstName}
                            onChange={e => setRegFirstName(e.target.value)}
                            className="w-full h-11 rounded-xl border border-light-gray px-3 outline-none text-sm font-medium focus:border-primary-blue transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                            {language === 'fr' ? 'Nom' : 'Last name'}
                          </label>
                          <input
                            required
                            placeholder={language === 'fr' ? 'Ex: Dupont' : 'Ex: Doe'}
                            value={regLastName}
                            onChange={e => setRegLastName(e.target.value)}
                            className="w-full h-11 rounded-xl border border-light-gray px-3 outline-none text-sm font-medium focus:border-primary-blue transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                          {language === 'fr' ? 'Ville' : 'City'}
                        </label>
                        <select
                          value={regCity}
                          onChange={e => setRegCity(e.target.value)}
                          className="w-full h-11 rounded-xl border border-light-gray px-3 outline-none text-sm font-medium focus:border-primary-blue transition-all bg-white"
                        >
                          <option>Douala</option>
                          <option>Yaoundé</option>
                          <option>Bafoussam</option>
                          <option>Garoua</option>
                          <option>Bamenda</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                          {language === 'fr' ? 'Téléphone' : 'Phone'}
                        </label>
                        <div className="flex h-11 rounded-xl border border-light-gray overflow-hidden focus-within:border-primary-blue transition-all">
                          <div className="bg-light-gray/40 px-3 flex items-center gap-1 border-r border-light-gray">
                            <span className="text-base">🇨🇲</span>
                            <span className="text-xs font-bold">+237</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="6XX XXX XXX"
                            value={regPhone}
                            onChange={e => setRegPhone(e.target.value)}
                            className="flex-1 px-3 outline-none text-sm font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-dark-gray">
                          {language === 'fr' ? 'Mot de passe' : 'Password'}
                        </label>
                        <div className="flex h-11 rounded-xl border border-light-gray overflow-hidden focus-within:border-primary-blue transition-all">
                          <div className="bg-light-gray/40 px-3 flex items-center border-r border-light-gray">
                            <Lock className="w-4 h-4 text-medium-gray" />
                          </div>
                          <input
                            type={regShowPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            placeholder="Min. 6 caractères"
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                            className="flex-1 px-3 outline-none text-sm font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setRegShowPassword(v => !v)}
                            className="px-3 text-medium-gray hover:text-dark-gray transition-colors"
                          >
                            {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-primary-green text-white rounded-xl font-display font-bold shadow-lg shadow-green-500/25 hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2 py-3.5 mt-1"
                      >
                        {authLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                        {language === 'fr' ? 'Créer mon compte et continuer' : 'Create account and continue'}
                      </button>

                      <p className="text-center text-xs text-medium-gray">
                        {language === 'fr' ? 'Déjà un compte ? ' : 'Already have an account? '}
                        <button
                          type="button"
                          onClick={() => { setAuthTab('login'); setAuthError(''); }}
                          className="text-primary-blue font-bold hover:underline"
                        >
                          {language === 'fr' ? 'Me connecter' : 'Log in'}
                        </button>
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Composants internes ─────────────────────────────────────────────────────

const InputGroup = ({ label, icon, value, onChange, placeholder, error }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-dark-gray">{label}</label>
    <div className={`relative h-12 rounded-xl border flex items-center transition-all focus-within:border-primary-blue bg-white group ${error ? 'border-red-400' : 'border-light-gray'}`}>
      <span className="absolute left-4 text-medium-gray group-focus-within:text-primary-blue transition-colors">{icon}</span>
      <input
        className="w-full h-full pl-12 pr-4 outline-none text-sm font-medium"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const OrderSummary = ({ subtotal, delivery, fees, cart }: any) => {
  const { language } = useAppContext();
  const t = translations[language];

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-light-gray shadow-sm sticky top-10 space-y-8">
      <h3 className="text-xl font-display font-black border-b border-light-gray pb-4">{t.summary}</h3>

      <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar pr-2">
        {cart.map((item: any) => (
          <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
            <div className="w-14 h-14 bg-light-gray rounded-lg overflow-hidden shrink-0">
              <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{item.name}</p>
              <p className="text-xs text-medium-gray">
                {language === 'fr' ? 'Qté:' : 'Qty:'} {item.quantity}
                {item.selectedSize ? ` | ${item.selectedSize}` : ''}
                {item.selectedColor ? ` | ${item.selectedColor}` : ''}
              </p>
            </div>
            <p className="font-bold text-sm whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} F</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6 border-t border-light-gray font-sans">
        <div className="flex justify-between text-sm text-medium-gray">
          <span>{t.subtotal}</span>
          <span>{subtotal.toLocaleString()} FCFA</span>
        </div>
        <div className="flex justify-between text-sm text-medium-gray">
          <span>{t.deliveryFees}</span>
          <span>{delivery.toLocaleString()} FCFA</span>
        </div>
        {fees > 0 && (
          <div className="flex justify-between text-sm text-medium-gray">
            <span>{t.mobileFees}</span>
            <span>{fees.toLocaleString()} FCFA</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-4 border-t border-dashed border-light-gray">
          <span className="font-black text-dark-gray italic uppercase tracking-tighter">{t.totalToPay}</span>
          <span className="text-2xl font-display font-black text-primary-blue italic">
            {(subtotal + delivery + fees).toLocaleString()} FCFA
          </span>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-center gap-2 opacity-50">
        <LogOut className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">🔒 {language === 'fr' ? 'Session sécurisée' : 'Secure Session'}</span>
      </div>
    </div>
  );
};
