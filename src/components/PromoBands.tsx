import React from 'react';
import { Truck, ShieldCheck, RefreshCcw, Headset, Ticket, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export const TopBar = () => {
  const { language, setLanguage } = useAppContext();
  
  return (
    <div className="h-9 bg-dark-gray text-white border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-full flex items-center justify-between text-[13px] font-sans">
        <div className="flex items-center gap-6">
          <span>🕒 {language === 'fr' ? 'Livraison: Lun - Sam 8h - 20h' : 'Delivery: Mon - Sat 8am - 8pm'}</span>
          <span className="hidden sm:inline">📞 +237 6XX XXX XXX</span>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
            className="bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="fr" className="text-black">FR</option>
            <option value="en" className="text-black">EN</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const BenefitBar = () => {
  const messages = [
    "Livraison disponible partout au Cameroun",
    "Paiement sécurisé : MTN MoMo & Orange Money",
    "Retour facile sous 7 jours",
    "Code promo : DG2025 pour -10% sur votre première commande",
    "Service client disponible du lundi au samedi"
  ];

  return (
    <div className="h-10 bg-[#15803D] text-white flex items-center overflow-hidden border-b border-white/10 group">
      <div className="flex whitespace-nowrap animate-marquee group-hover:pause">
        {[...messages, ...messages].map((msg, i) => (
          <div key={i} className="flex items-center px-12 text-[12px] md:text-[13px] font-medium uppercase tracking-wider">
            {msg}
            <span className="ml-12 text-white/40 text-[10px]">◆</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PromotionalMarquee = () => {
  const [timeLeft, setTimeLeft] = React.useState('02:45:12');

  return (
    <div className="h-11 bg-[#0F172A] text-white flex items-center overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {[1, 2].map((_, i) => (
          <div key={i} className="flex items-center gap-16 px-8 text-[13px] font-medium">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary-green" />
              <span>CODE PROMO : <span className="text-primary-green">DG2025</span> — 10% sur votre 1ère commande</span>
              <button className="ml-2 text-[11px] underline cursor-pointer">Utiliser</button>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Livraison gratuite dès 50 000 FCFA d'achat</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>OFFRE FLASH — Se termine dans : <span className="font-mono text-orange-400">{timeLeft}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary-green fill-primary-green" />
              <span>Nouvelles collections disponibles — Homme & Femme</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
