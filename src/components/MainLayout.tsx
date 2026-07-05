import React from 'react';
import { Truck, ShieldCheck, RefreshCcw, Headset, Mail, MapPin, Phone, Facebook, Instagram, MessageCircle, MoreHorizontal, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../translations';
import logo from '../assets/donalgros.jpg';

export const IntermediaryBanner = () => {
  const { language } = useAppContext();
  return (
    <section className="w-full h-[220px] md:h-[260px] bg-gradient-to-r from-primary-blue to-[#1e3a8a] text-white flex items-center relative overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-20 w-full flex flex-col md:flex-row items-center justify-between gap-8 z-10">
        <div>
          <h2 className="text-3xl md:text-5xl font-display font-black mb-3">
            {language === 'fr' ? "SOLDES — JUSQU'À -40%" : "SALE — UP TO -40%"}
          </h2>
          <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl">
            {language === 'fr' ? "Sur une sélection de vêtements, chaussures et électroménager" : "On a selection of clothing, shoes and appliances"}
          </p>
        </div>
        <button className="h-14 px-10 bg-white text-primary-blue font-display font-bold rounded-lg hover:bg-primary-green hover:text-white transition-all duration-300 shadow-2xl">
          {language === 'fr' ? "Explorer les Soldes" : "Explore Sale"}
        </button>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
    </section>
  );
};

export const ReassuranceBlock = () => {
  const { language } = useAppContext();
  
  const pillars = [
    { icon: <Truck className="w-8 h-8" />, color: 'text-primary-blue', 
      title: language === 'fr' ? 'Livraison Partout au Cameroun' : 'Delivery Everywhere in Cameroon', 
      desc: language === 'fr' ? 'Nous livrons dans toutes les villes du Cameroun. Délai estimé 2 à 5 jours.' : 'We deliver to all cities in Cameroon. Estimated delay 2 to 5 days.' },
    { icon: <ShieldCheck className="w-8 h-8" />, color: 'text-primary-green', 
      title: language === 'fr' ? 'Paiement 100% Sécurisé' : '100% Secure Payment', 
      desc: language === 'fr' ? 'MTN MoMo, Orange Money ou espèces à la livraison.' : 'MTN MoMo, Orange Money or cash on delivery.' },
    { icon: <RefreshCcw className="w-8 h-8" />, color: 'text-primary-blue', 
      title: language === 'fr' ? 'Retour sous 7 Jours' : '7-Day Return Policy', 
      desc: language === 'fr' ? 'Satisfait ou remboursé sous 7 jours après réception.' : 'Satisfied or refunded within 7 days after reception.' },
    { icon: <Headset className="w-8 h-8" />, color: 'text-primary-green', 
      title: language === 'fr' ? 'Support Client Réactif' : 'Responsive Customer Support', 
      desc: language === 'fr' ? 'Disponible Lun - Sam, 8h - 20h via téléphone ou WhatsApp.' : 'Available Mon - Sat, 8am - 8pm via phone or WhatsApp.' },
  ];

  return (
    <section className="bg-white border-y border-light-gray">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 lg:divide-x lg:divide-light-gray font-sans">
        {pillars.map((p, i) => (
          <div key={i} className="px-6 flex flex-col items-center group text-center lg:first:pl-0 lg:last:pr-0">
            <div className={`mb-6 transition-transform duration-300 group-hover:scale-110 ${p.color}`}>{p.icon}</div>
            <h3 className="font-display font-semibold text-[16px] text-dark-gray mb-3 group-hover:text-primary-blue transition-colors">
              {p.title}
            </h3>
            <p className="text-sm text-medium-gray leading-relaxed max-w-[240px]">
              {p.desc}
            </p>
            <button className="mt-4 text-primary-blue text-xs font-bold uppercase tracking-wider hover:underline">
              En savoir plus
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export const Newsletter = () => {
  const [subscribed, setSubscribed] = React.useState(false);

  return (
    <section className="bg-[#EFF6FF] border-y border-[#BFDBFE] py-12 md:py-16">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-10">
        <div className="lg:w-3/5 flex gap-6 items-center">
           <div className="hidden md:flex w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-lg transform -rotate-6">
             <Mail className="w-8 h-8 text-primary-blue animate-bounce" />
           </div>
           <div>
             <h2 className="text-3xl font-display font-black text-primary-blue mb-2">Recevez nos Offres en Exclusivité</h2>
             <p className="text-medium-gray text-lg">Inscrivez-vous pour être le premier informé des nouvelles collections.</p>
           </div>
        </div>
        
        <div className="lg:w-2/5 w-full">
           <AnimatePresence mode="wait">
             {subscribed ? (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-primary-green font-bold text-lg bg-green-50 p-6 rounded-xl border border-green-200">
                 <CheckCircle2 className="w-8 h-8" />
                 Merci ! Vous êtes bien inscrit à notre newsletter.
               </motion.div>
             ) : (
               <div className="flex flex-col gap-3">
                 <form 
                   onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
                   className="flex items-center h-14"
                 >
                   <input 
                     type="email" 
                     required 
                     placeholder="Votre adresse email" 
                     className="flex-1 h-full px-6 bg-white border border-light-gray rounded-l-xl focus:outline-primary-blue text-dark-gray"
                   />
                   <button 
                     type="submit"
                     className="h-full px-8 bg-primary-blue text-white font-display font-bold rounded-r-xl hover:bg-dark-gray transition-colors"
                   >
                     S'inscrire
                   </button>
                 </form>
                 <p className="text-xs text-medium-gray italic">
                   Pas de spam. Désinscription en un clic à tout moment.
                 </p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export const Footer = () => {
  const { language, settings } = useAppContext();
  const t = translations[language];

  return (
    <footer className="bg-dark-gray text-white font-sans">
      {/* Pre-Footer Action */}
      <div className="bg-[#1E3A8A] py-6 px-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white font-medium text-lg text-center md:text-left">
            {t.help}
          </p>
          <div className="flex gap-4">
            <a 
              href="https://wa.me/237696001685?text=Bonjour%20Donald%20Gros,%20j'ai%20besoin%20d'aide%20concernant%20un%20produit%20ou%20une%20commande."
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-8 bg-primary-green text-white font-bold rounded-lg hover:bg-white hover:text-primary-green transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {language === 'fr' ? 'Nous Contacter' : 'Contact Us'}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Col 1 */}
          <div>
            <div className="mb-6 flex items-center gap-3">
               <img 
                 src={logo} 
                 alt="Donald Gros Logo" 
                 className="w-12 h-12 object-contain rounded-lg"
                 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
               />
               <div className="w-1 h-6 bg-primary-green" />
               <span className="text-2xl font-display font-bold tracking-tight">
                 DONALD <span className="text-primary-green">GROS</span>
               </span>
            </div>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              {language === 'fr' ? "Donald Gros est votre boutique en ligne de référence pour le prêt-à-porter de luxe et l'électroménager de qualité supérieure au Cameroun." : "Donald Gros is your premier reference for luxury fashion and high-quality appliances in Cameroon."}
            </p>
            <div className="space-y-4">
               <p className="uppercase text-xs font-bold tracking-widest text-white/40">{language === 'fr' ? 'Suivez-nous' : 'Follow Us'}</p>
               <div className="flex gap-3">
                 {[Facebook, Instagram, MessageCircle, MoreHorizontal].map((Icon, i) => (
                   <button key={i} className="w-10 h-10 rounded-full bg-[#374151] flex items-center justify-center hover:bg-primary-blue transition-colors group">
                     <Icon className="w-5 h-5 text-white" />
                   </button>
                 ))}
               </div>
            </div>
          </div>

          {/* Col 2 */}
          <FooterColumn 
            title={language === 'fr' ? "Plan du site" : "Site Map"} 
            links={[
              { label: language === 'fr' ? 'Accueil' : 'Home', href: '#' },
              { label: language === 'fr' ? 'Catalogue' : 'Catalog', href: '#catalogue' },
              { label: language === 'fr' ? 'Soldes' : 'Sale', href: '#catalogue?filter=sale' },
              { label: language === 'fr' ? 'Homme' : 'Men', href: '#catalogue?category=homme' },
              { label: language === 'fr' ? 'Femme' : 'Women', href: '#catalogue?category=femme' },
              { label: language === 'fr' ? 'Électroménager' : 'Appliances', href: '#catalogue?category=electromenager' },
            ]} 
          />

          {/* Col 3 */}
          <FooterColumn 
            title={language === 'fr' ? "Mon Espace" : "My Account"} 
            links={[
              { label: language === 'fr' ? 'Connexion / Inscription' : 'Login / Register', href: '#login' },
              { label: language === 'fr' ? 'Mon Profil' : 'My Profile', href: '#profile?tab=profile' },
              { label: language === 'fr' ? 'Mes Commandes' : 'My Orders', href: '#profile?tab=orders' },
              { label: language === 'fr' ? 'Mes Favoris' : 'My Favorites', href: '#wishlist' },
              { label: language === 'fr' ? 'Mes Adresses' : 'My Addresses', href: '#profile?tab=addresses' },
              { label: language === 'fr' ? 'Suivi de Commande' : 'Order Tracking', href: '#' },
            ]} 
          />

          {/* Col 4 */}
          <div>
             <h3 className="font-display font-bold text-lg mb-8">{language === 'fr' ? 'Contact & Aide' : 'Contact & Help'}</h3>
             <ul className="space-y-5">
               <li className="flex gap-4">
                 <MapPin className="w-5 h-5 text-primary-green shrink-0" />
                 <span className="text-sm text-white/60">Yaoundé, Bastos - Avenue des Cocos</span>
               </li>
               <li className="flex gap-4">
                 <Phone className="w-5 h-5 text-primary-green shrink-0" />
                 <a 
                   href="https://wa.me/237696001685?text=Bonjour%20Donald%20Gros,%20j'ai%20besoin%20d'aide%20concernant%20un%20produit%20ou%20une%20commande."
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-sm text-white/60 hover:text-white transition-colors"
                 >
                   +237 696 001 685
                 </a>
               </li>
               <li className="flex gap-4">
                 <Mail className="w-5 h-5 text-primary-green shrink-0" />
                 <span className="text-sm text-white/60">contact@donaldgros.com</span>
               </li>
             </ul>
             <div className="mt-8 pt-8 border-t border-white/10">
               <p className="uppercase text-xs font-bold tracking-widest text-white/40 mb-4">{language === 'fr' ? 'Informations' : 'Information'}</p>
               <ul className="space-y-2">
                 {(language === 'fr' ? ['CGV', 'Politique de Confidentialité', 'FAQ', 'À propos'] : ['T&C', 'Privacy Policy', 'FAQ', 'About']).map(link => (
                   <li key={link}><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a></li>
                 ))}
               </ul>
             </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#0D1117] py-6 border-y border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{language === 'fr' ? 'Modes de paiement acceptés :' : 'Accepted payment methods:'}</span>
            <div className="flex gap-3">
              <div className="h-8 px-3 bg-[#FFCC00] rounded-md flex items-center font-black text-black text-[10px]">MTN MoMo</div>
              <div className="h-8 px-3 bg-[#FF6600] rounded-md flex items-center font-black text-white text-[10px]">Orange Money</div>
              <div className="h-8 px-3 bg-white/10 rounded-md border border-white/10 flex items-center font-bold text-white text-[10px] uppercase">{language === 'fr' ? 'Cash Delivery' : 'Cash on Delivery'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary-green font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            {language === 'fr' ? 'Paiements sécurisés et protégés' : 'Secure and safe payments'}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#080B10] py-6">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
           <p>© 2025 Donald Gros E-Commerce — {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
           <div className="flex gap-6">
             <a href="#" className="hover:text-white underline decoration-white/20">{language === 'fr' ? 'Mentions Légales' : 'Legal Notices'}</a>
             <a href="#" className="hover:text-white underline decoration-white/20">{language === 'fr' ? 'Données Personnelles' : 'Privacy Policy'}</a>
             <a href="#" className="hover:text-white underline decoration-white/20">{language === 'fr' ? 'Gestion des Cookies' : 'Cookie Management'}</a>
           </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn = ({ title, links }: { title: string, links: (string | { label: string, href: string })[] }) => (
  <div>
    <h3 className="font-display font-bold text-lg mb-8">{title}</h3>
    <ul className="space-y-4">
      {links.map((link, i) => {
        const label = typeof link === 'string' ? link : link.label;
        const href = typeof link === 'string' ? '#' : link.href;
        return (
          <li key={i}>
            <a href={href} className="text-sm text-white/60 hover:text-white flex items-center gap-2 group transition-all">
              <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-green" />
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  </div>
);
