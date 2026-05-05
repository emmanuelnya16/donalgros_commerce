import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, ArrowLeft, ChevronRight, Phone, 
  MapPin, User, CheckCircle2, Truck, Smartphone,
  Banknote, AlertCircle, Copy, Clock, RefreshCw,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import logo from '../assets/donalgros.jpg';

type PaymentMode = 'now' | 'delivery' | null;

const MTN_LOGO = "https://i0.wp.com/kamer-android.com/wp-content/uploads/2025/06/okmtnok-scaled.jpg?fit=2560%2C1440&ssl=1";
const ORANGE_LOGO = "https://logos-marques.com/wp-content/uploads/2021/07/Orange-Money-logo.png";

export const CheckoutTunnel = () => {
  const { cart, user, clearCart, addOrder, language } = useAppContext();
  const t = translations[language];
  const [paymentMode, setPaymentMode] = React.useState<PaymentMode>(null);
  const [step, setStep] = React.useState(0); // 0: Choose mode, 1: Address, 2: Payment (if now), 3: Success
  const [addressData, setAddressData] = React.useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    phone: '',
    city: 'Douala',
    area: '',
    street: '',
    instructions: ''
  });
  const [paymentData, setPaymentData] = React.useState({
    operator: 'MTN' as 'MTN' | 'ORANGE',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [countdown, setCountdown] = React.useState(120);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFares = addressData.city === 'Douala' ? 2000 : addressData.city === 'Yaoundé' ? 2500 : 3500;
  const paymentFees = paymentMode === 'now' ? Math.round(subtotal * 0.015) : 0;
  const total = subtotal + deliveryFares + paymentFees;

  React.useEffect(() => {
    let timer: number;
    if (isProcessing && countdown > 0) {
      timer = window.setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsProcessing(false);
    }
    return () => clearInterval(timer);
  }, [isProcessing, countdown]);

  const handleModeChoice = (mode: PaymentMode) => {
    setPaymentMode(mode);
    setStep(1);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (paymentMode === 'delivery') {
        processOrder();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      processOrder();
    }
  };

  const processOrder = async () => {
    setIsProcessing(true);
    
    const orderData = {
      items: [...cart],
      total: total,
      paymentMode: paymentMode as 'now' | 'delivery',
      paymentStatus: (paymentMode === 'now' ? 'payé' : 'en attente') as 'payé' | 'en attente',
      address: {
        city: addressData.city,
        district: addressData.area,
        details: `${addressData.street} - ${addressData.instructions}`
      }
    };

    // Simulate API call
    if (paymentMode === 'now') {
      // Logic for mobile money waiting...
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3);
        addOrder(orderData);
        clearCart();
      }, 5000); // Simulate successful confirmation after 5s
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setStep(3);
        addOrder(orderData);
        clearCart();
      }, 2000);
    }
  };

  const ProgressIndicator = () => (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-light-gray -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary-green transition-all duration-500 -translate-y-1/2 z-0"
          style={{ width: `${step === 0 ? 0 : step === 3 ? 100 : (step / (paymentMode === 'now' ? 3 : 2)) * 100}%` }}
        />
        
        {/* Stages */}
        {[0, 1, 2, 3].filter(s => {
          if (paymentMode === 'delivery' && s === 2) return false;
          return true;
        }).map((s, idx) => {
          const isActive = step === s;
          const isCompleted = step > s || step === 3;
          let label = '';
          if (s === 0) label = t.checkoutStepPayment;
          else if (s === 1) label = t.checkoutStepDelivery;
          else if (s === 2) label = t.checkoutStepReglement;
          else if (s === 3) label = t.checkoutStepConfirmation;

          return (
            <div key={s} className="relative z-10 flex flex-col items-center">
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Simplified Header */}
      <header className="bg-white border-b border-light-gray py-6">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between">
          <div 
            onClick={() => window.location.hash = ''}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src={logo} 
              alt="Donald Gros Logo" 
              className="w-9 h-9 object-contain rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
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

      {step < 3 && <ProgressIndicator />}

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 pb-32">
        <AnimatePresence mode="wait">
          {/* STEP 0: MODE CHOICE */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto space-y-10"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-display font-black text-dark-gray">{t.howToPay}</h2>
                <p className="text-medium-gray font-medium">{t.choosePaymentMode}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Pay Now */}
                 <button 
                   onClick={() => handleModeChoice('now')}
                   className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-primary-blue transition-all text-left shadow-lg hover:shadow-2xl relative overflow-hidden h-full flex flex-col"
                 >
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

                 {/* Pay at Delivery */}
                 <button 
                   onClick={() => handleModeChoice('delivery')}
                   className="group bg-white p-8 rounded-3xl border-2 border-transparent hover:border-primary-green transition-all text-left shadow-lg hover:shadow-2xl relative overflow-hidden h-full flex flex-col"
                 >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full translate-x-12 -translate-y-12" />
                   <div className="w-16 h-16 bg-green-50 text-primary-green rounded-2xl flex items-center justify-center mb-6">
                      <Banknote className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-display font-bold text-dark-gray mb-3 italic">{t.payAtDelivery}</h3>
                   <p className="text-sm text-medium-gray leading-relaxed mb-6">{t.payAtDeliveryDesc}</p>
                   <div className="mt-auto">
                     <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-tighter">{t.noAdvancePayment}</span>
                   </div>
                   <p className="mt-4 text-[10px] text-medium-gray italic font-medium">{language === 'fr' ? 'Disponible uniquement pour les villes sélectionnées.' : 'Available only for selected cities.'}</p>
                 </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              <div className="lg:col-span-2 space-y-8">
                {paymentMode === 'delivery' && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-sm text-primary-blue">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{language === 'fr' ? 'Vous avez choisi le paiement à la livraison. Prévoyez le montant exact pour le livreur.' : 'You have chosen cash on delivery. Please have the exact amount ready for the delivery person.'}</p>
                  </div>
                )}

                <h2 className="text-2xl font-display font-black text-dark-gray">{t.deliveryAddress}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label={`${t.firstName} *`} icon={<User className="w-4 h-4" />} value={addressData.firstName} onChange={v => setAddressData({...addressData, firstName: v})} placeholder={language === 'fr' ? 'Votre prénom' : 'Your first name'} />
                  <InputGroup label={`${t.lastName} *`} icon={<User className="w-4 h-4" />} value={addressData.lastName} onChange={v => setAddressData({...addressData, lastName: v})} placeholder={language === 'fr' ? 'Votre nom' : 'Your last name'} />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-dark-gray">{t.deliveryPhone} *</label>
                    <div className="flex h-12 rounded-xl border border-light-gray overflow-hidden focus-within:border-primary-blue bg-white transition-all">
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
                  </div>
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
                  <InputGroup label={`${t.areaLabel} *`} icon={<MapPin className="w-4 h-4" />} value={addressData.area} onChange={v => setAddressData({...addressData, area: v})} placeholder="Ex: Bastos, Akwa..." />
                  <InputGroup label={t.streetLabel} icon={<MapPin className="w-4 h-4" />} value={addressData.street} onChange={v => setAddressData({...addressData, street: v})} placeholder={language === 'fr' ? 'Ex: Rue 1234, face marché' : 'Ex: Street 1234, facing market'} />
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

                <button 
                  onClick={handleNextStep}
                  className="w-full md:w-auto px-12 h-14 bg-primary-blue text-white rounded-xl font-display font-bold shadow-xl shadow-primary-blue/20 hover:bg-dark-gray transition-all mt-6"
                >
                  {paymentMode === 'delivery' ? t.confirmOrder : t.continueToPayment}
                </button>
              </div>

              {/* Sticky Summary */}
              <div className="lg:col-span-1">
                <OrderSummary subtotal={subtotal} delivery={deliveryFares} fees={paymentFees} cart={cart} />
              </div>
            </motion.div>
          )}

          {/* STEP 2: PAYMENT REGLEMENT */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black text-dark-gray">{language === 'fr' ? 'Moyen de Paiement Mobile' : 'Mobile Payment Method'}</h2>
                  <p className="text-medium-gray text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary-green" />
                    {language === 'fr' ? 'Votre transaction est entièrement sécurisée' : 'Your transaction is fully secure'}
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      id: 'MTN', 
                      label: 'MTN Mobile Money', 
                      logo: MTN_LOGO,
                      desc: 'Paiement direct via MTN MoMo.', 
                      phones: '67X ou 68X' 
                    },
                    { 
                      id: 'ORANGE', 
                      label: 'Orange Money', 
                      logo: ORANGE_LOGO,
                      desc: 'Utilisez votre compte Orange Money.', 
                      phones: '69X' 
                    }
                  ].map(op => (
                    <div 
                      key={op.id}
                      onClick={() => setPaymentData({...paymentData, operator: op.id as any})}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${paymentData.operator === op.id ? 'bg-blue-50/50 border-primary-blue' : 'bg-white border-light-gray hover:border-blue-200'}`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white border border-light-gray rounded-2xl flex items-center justify-center p-2 shadow-sm shrink-0">
                          <img src={op.logo} alt={op.label} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{op.label}</h4>
                          <p className="text-sm text-medium-gray">{op.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentData.operator === op.id ? 'border-primary-blue' : 'border-light-gray'}`}>
                           {paymentData.operator === op.id && <div className="w-3 h-3 bg-primary-blue rounded-full" />}
                        </div>
                      </div>

                      {paymentData.operator === op.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-6 pt-6 border-t border-blue-100 overflow-hidden"
                        >
                          <div className="space-y-4">
                             <label className="text-sm font-bold">{language === 'fr' ? `Numéro de téléphone ${op.id} *` : `${op.id} Phone Number *`}</label>
                             <div className="flex h-12 rounded-xl border border-primary-blue bg-white overflow-hidden">
                                <div className="bg-blue-50 px-3 flex items-center gap-2 border-r border-blue-100 font-bold text-primary-blue">+237</div>
                                <input 
                                  type="tel"
                                  autoFocus
                                  className="flex-1 px-4 outline-none font-bold"
                                  placeholder={`${op.phones} XXX XXX`}
                                  value={paymentData.phone}
                                  onChange={e => setPaymentData({...paymentData, phone: e.target.value})}
                                />
                             </div>
                             <p className="text-[10px] text-medium-gray italic font-medium">{language === 'fr' ? "Une demande de paiement sera envoyée sur ce numéro." : "A payment request will be sent to this number."}</p>
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
                    disabled={isProcessing}
                    className="w-full h-16 bg-primary-blue text-white rounded-xl font-display font-bold shadow-2xl shadow-primary-blue/30 hover:bg-dark-gray transition-all relative overflow-hidden"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-3">
                         <RefreshCw className="w-6 h-6 animate-spin" />
                         {countdown > 0 ? (language === 'fr' ? 'Envoi en cours...' : 'Sending in progress...') : (language === 'fr' ? 'Délai dépassé' : 'Timeout reached')}
                      </span>
                    ) : (
                      `${language === 'fr' ? 'Payer' : 'Pay'} ${total.toLocaleString()} FCFA`
                    )}
                  </button>
                </div>

                {isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                  >
                     <div className="bg-white rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center space-y-8">
                        <div className="w-24 h-24 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center mx-auto mb-6 relative">
                           <Smartphone className="w-12 h-12" />
                           <motion.div 
                             animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="absolute inset-0 bg-primary-blue/20 rounded-full"
                           />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-2xl font-display font-black">{language === 'fr' ? 'Confirmez sur votre téléphone' : 'Confirm on your phone'}</h3>
                           <p className="text-medium-gray">{language === 'fr' ? `Une notification de paiement a été envoyée au` : `A payment notification has been sent to`} <span className="font-bold text-dark-gray">+237 {paymentData.phone}</span>.</p>
                           <div className="bg-light-gray/50 p-4 rounded-xl border border-light-gray flex items-center gap-4 text-left">
                              <ShieldCheck className="w-8 h-8 text-primary-green shrink-0" />
                              <p className="text-xs font-semibold text-dark-gray leading-relaxed">{language === 'fr' ? "Veuillez saisir votre code PIN secret sur le clavier de votre téléphone pour valider l'achat." : "Please enter your secret PIN on your phone's keypad to validate the purchase."}</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-2 text-red-500 font-bold">
                             <Clock className="w-5 h-5" />
                             <span>0{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                          </div>
                          <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: '100%' }}
                               animate={{ width: `${(countdown / 120) * 100}%` }}
                               className="h-full bg-red-500"
                             />
                          </div>
                          <button 
                            onClick={() => { setIsProcessing(false); setCountdown(120); }}
                            className="text-primary-blue font-bold hover:underline py-2"
                          >
                            {language === 'fr' ? 'Annuler et revenir' : 'Cancel and go back'}
                          </button>
                        </div>
                     </div>
                  </motion.div>
                )}
              </div>
              
              <div className="lg:col-span-1">
                 <OrderSummary subtotal={subtotal} delivery={deliveryFares} fees={paymentFees} cart={cart} />
              </div>
            </motion.div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-3xl mx-auto py-10"
            >
               <div className="bg-white rounded-[40px] shadow-2xl p-10 md:p-16 text-center border border-light-gray">
                  <div className="w-24 h-24 bg-green-50 text-primary-green rounded-full flex items-center justify-center mx-auto mb-10 overflow-hidden">
                     <motion.div 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                     >
                      <CheckCircle2 className="w-16 h-16" strokeWidth={3} />
                     </motion.div>
                  </div>
                  
                  <div className="space-y-4 mb-12">
                    <h2 className="text-4xl font-display font-black text-dark-gray">{paymentMode === 'now' ? t.orderConfirmed : t.orderRegistered}</h2>
                    <p className="text-lg text-medium-gray">{t.thanksConfidence}, <span className="font-bold text-dark-gray">{addressData.firstName}</span>. {language === 'fr' ? 'Votre colis sera bientôt prêt.' : 'Your package will be ready soon.'}</p>
                    
                    <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-2 rounded-full border border-blue-100 mt-4">
                       <span className="text-sm font-bold text-primary-blue">{t.orderNo} : #DG-2025-0042</span>
                       <Copy className="w-4 h-4 text-primary-blue cursor-pointer hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  {paymentMode === 'delivery' && (
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 mb-10 text-left flex gap-6">
                       <Banknote className="w-12 h-12 text-orange-500 shrink-0" />
                       <div>
                          <p className="font-black text-orange-800 text-xl italic mb-1 uppercase tracking-tight">{t.paymentReminder}</p>
                          <p className="text-orange-700 font-medium">{t.prepareCash.replace('somme', `somme de ${total.toLocaleString()} FCFA`)}</p>
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                     <div className="p-6 bg-light-gray/30 rounded-2xl text-left border border-light-gray/50">
                        <Truck className="w-6 h-6 text-primary-blue mb-4" />
                        <p className="text-xs font-bold text-medium-gray uppercase mb-2">{t.estimatedDelivery}</p>
                        <p className="font-bold text-dark-gray">{language === 'fr' ? 'Entre le 06 et le 09 Mai 2026' : 'Between May 06 and 09, 2026'}</p>
                     </div>
                     <div className="p-6 bg-light-gray/30 rounded-2xl text-left border border-light-gray/50">
                        <Smartphone className="w-6 h-6 text-primary-green mb-4" />
                        <p className="text-xs font-bold text-medium-gray uppercase mb-2">Confirmation</p>
                        <p className="font-bold text-dark-gray">SMS {language === 'fr' ? 'envoyé au' : 'sent to'} +237 {addressData.phone}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => window.location.hash = ''}
                      className="w-full h-16 bg-primary-blue text-white rounded-2xl font-display font-bold shadow-xl shadow-primary-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      {t.backToHome}
                    </button>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => window.location.hash = 'profile?tab=orders'}
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
        </AnimatePresence>
      </main>

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
    </div>
  );
};

const InputGroup = ({ label, icon, value, onChange, placeholder }: any) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-dark-gray">{label}</label>
    <div className="relative h-12 rounded-xl border border-light-gray flex items-center transition-all focus-within:border-primary-blue bg-white group">
      <span className="absolute left-4 text-medium-gray group-focus-within:text-primary-blue transition-colors">{icon}</span>
      <input 
        className="w-full h-full pl-12 pr-4 outline-none text-sm font-medium"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
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
          <div key={item.id} className="flex gap-4">
             <div className="w-14 h-14 bg-light-gray rounded-lg overflow-hidden shrink-0">
               <img src={item.image} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{item.name}</p>
                <p className="text-xs text-medium-gray">{language === 'fr' ? 'Qté:' : 'Qty:'} {item.quantity} {item.selectedSize ? `| ${item.selectedSize}` : ''}</p>
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
           <span className="text-2xl font-display font-black text-primary-blue italic">{(subtotal + delivery + fees).toLocaleString()} FCFA</span>
        </div>
     </div>

     <div className="pt-4 flex items-center justify-center gap-2 opacity-50">
        <LogOut className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">🔒 {language === 'fr' ? 'Session sécurisée' : 'Secure Session'}</span>
     </div>
  </div>
  );
};
