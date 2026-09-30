import React from 'react';
import { motion } from 'motion/react';
import {
  Gift, ShoppingBag, Store, Star, Crown, Trophy, Sparkles, 
  ChevronRight, CheckCircle2, ArrowRight, MapPin, Phone,
  Zap, Shield, TrendingUp, Award
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { GIFT_MILESTONES, calculateOrderPoints } from '../utils/loyalty';

// ─── Composant Compteur animé ────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 1500;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

// ─── Carte palier de cadeau ──────────────────────────────────────────────────
const MilestoneCard = ({ milestone, index, language }: {
  key?: React.Key;
  milestone: typeof GIFT_MILESTONES[0];
  index: number;
  language: 'fr' | 'en';
}) => {
  const icons = {
    gift: <Gift className="w-8 h-8" />,
    trophy: <Trophy className="w-8 h-8" />,
    crown: <Crown className="w-8 h-8" />,
    sparkles: <Sparkles className="w-8 h-8" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${milestone.badgeColor} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500 -z-10`} />
      <div className="bg-white border border-light-gray rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
        {/* Points badge */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${milestone.badgeColor} flex items-center justify-center text-white shadow-lg`}>
            {icons[milestone.iconName]}
          </div>
          <span className="px-4 py-1.5 bg-slate-950 text-amber-400 text-sm font-black rounded-full">
            {milestone.pointsRequired.toLocaleString()} pts
          </span>
        </div>

        <h3 className="font-display font-black text-xl text-dark-gray mb-2">
          {language === 'fr' ? milestone.titleFr : milestone.titleEn}
        </h3>
        <p className="text-sm text-medium-gray flex-1 mb-4">
          {language === 'fr' ? milestone.descriptionFr : milestone.descriptionEn}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-light-gray">
          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
            {milestone.rewardValueLabel}
          </span>
          <span className="text-xs font-bold text-medium-gray flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-primary-blue" />
            {language === 'fr' ? 'En boutique' : 'In-store'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Page principale ─────────────────────────────────────────────────────────
export const LoyaltyLandingPage = () => {
  const { language, user } = useAppContext();
  const fr = language === 'fr';

  const tiers = [
    {
      name: 'Bronze', range: fr ? '0 – 2 499 pts' : '0 – 2,499 pts',
      gradient: 'from-amber-700 via-orange-700 to-amber-900', emoji: '🥉',
      perks: fr ? ['Accès au programme', 'Cadeaux dès 1 000 pts', 'Badge membre Donald Gros'] : ['Program access', 'Gifts from 1,000 pts', 'Donald Gros member badge'],
    },
    {
      name: 'Silver', range: fr ? '2 500 – 4 999 pts' : '2,500 – 4,999 pts',
      gradient: 'from-slate-400 via-gray-500 to-slate-600', emoji: '🥈',
      perks: fr ? ['Cadeau Privilège Silver', 'Avantages prioritaires', 'Accès ventes privées'] : ['Silver Privilege Gift', 'Priority benefits', 'Private sale access'],
    },
    {
      name: 'Gold', range: fr ? '5 000 – 9 999 pts' : '5,000 – 9,999 pts',
      gradient: 'from-amber-400 via-yellow-500 to-amber-600', emoji: '🥇',
      perks: fr ? ['Cadeau VIP Gold', 'Invitation événements exclusifs', 'Service prioritaire'] : ['VIP Gold Gift', 'Exclusive event invites', 'Priority service'],
    },
    {
      name: 'Platine', range: '10 000+ pts',
      gradient: 'from-purple-600 via-indigo-600 to-blue-700', emoji: '💎',
      perks: fr ? ['Cadeau Platine Ambassadeur', 'Avantages VIP maximum', 'Accès offres exclusives'] : ['Platinum Ambassador Gift', 'Maximum VIP benefits', 'Exclusive offer access'],
    },
  ];

  const exampleOrders = [
    { amount: 10000, label: fr ? 'Paire de chaussures' : 'Pair of shoes' },
    { amount: 25000, label: fr ? 'Article de mode' : 'Fashion item' },
    { amount: 50000, label: fr ? 'Électroménager' : 'Appliance' },
    { amount: 100000, label: fr ? 'Gros appareil' : 'Large appliance' },
  ];

  const steps = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'bg-primary-blue text-white',
      title: fr ? 'Commandez en ligne' : 'Order online',
      desc: fr ? 'Passez vos commandes sur le site Donald Gros. Chaque achat valide vous fait gagner automatiquement des points fidélité.' : 'Place your orders on Donald Gros website. Every valid purchase automatically earns you loyalty points.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      color: 'bg-amber-500 text-white',
      title: fr ? 'Accumulez vos points' : 'Accumulate points',
      desc: fr ? 'La règle est simple : pour chaque 1 000 FCFA dépensés, vous recevez 10 points fidélité. Ils s\'accumulent sur toutes vos commandes.' : 'Simple rule: for every 1,000 FCFA spent, you receive 10 loyalty points. They stack across all your orders.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-primary-green text-white',
      title: fr ? 'Suivez votre progression' : 'Track your progress',
      desc: fr ? 'Consultez votre solde de points, votre statut VIP et votre progression vers le prochain cadeau depuis votre profil.' : 'Check your points balance, VIP status and progress towards the next gift from your profile.',
    },
    {
      icon: <Store className="w-8 h-8" />,
      color: 'bg-purple-600 text-white',
      title: fr ? 'Récupérez votre cadeau en boutique' : 'Collect your gift in-store',
      desc: fr ? 'Dès 1 000 points atteints, rendez-vous dans notre boutique physique à Douala ou Yaoundé et présentez votre numéro de compte pour retirer votre cadeau !' : 'Once you reach 1,000 points, visit our physical store in Douala or Yaoundé and show your account number to collect your gift!',
    },
  ];

  const faqs = [
    {
      q: fr ? 'Les points expirent-ils ?' : 'Do points expire?',
      a: fr ? 'Non ! Vos points sont permanents et s\'accumulent sans limite de temps. Continuez à commander et à accumuler.' : 'No! Your points are permanent and accumulate without time limit. Keep ordering and accumulating.',
    },
    {
      q: fr ? 'Puis-je utiliser mes points pour une réduction ?' : 'Can I use my points for a discount?',
      a: fr ? 'Les points s\'échangent contre des cadeaux physiques en boutique uniquement. Il n\'y a pas de réduction en ligne pour le moment.' : 'Points are exchanged for physical gifts in-store only. There is no online discount at the moment.',
    },
    {
      q: fr ? 'Toutes mes commandes rapportent-elles des points ?' : 'Do all my orders earn points?',
      a: fr ? 'Toutes les commandes valides (confirmées, en cours, expédiées, livrées) génèrent des points. Les commandes annulées ou échouées ne comptent pas.' : 'All valid orders (confirmed, processing, shipped, delivered) generate points. Cancelled or failed orders do not count.',
    },
    {
      q: fr ? 'Comment récupérer mon cadeau ?' : 'How to collect my gift?',
      a: fr ? 'Rendez-vous dans l\'une de nos boutiques physiques à Douala ou Yaoundé, présentez votre numéro de téléphone d\'inscription et notre équipe récupère votre solde pour vous remettre votre cadeau !' : 'Visit one of our physical stores in Douala or Yaoundé, show your registered phone number and our team will check your balance and hand you your gift!',
    },
    {
      q: fr ? 'Mon solde est-il visible en temps réel ?' : 'Is my balance visible in real time?',
      a: fr ? 'Oui ! Votre solde de points est calculé instantanément depuis l\'historique de vos commandes. Connectez-vous et consultez l\'onglet "Fidélité & Cadeaux" dans votre profil.' : 'Yes! Your points balance is calculated instantly from your order history. Log in and check the "Loyalty & Rewards" tab in your profile.',
    },
  ];

  return (
    <div className="bg-white overflow-hidden">

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[82vh] flex items-center bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 overflow-hidden">
        {/* Fonds lumineux */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-blue/15 rounded-full blur-3xl pointer-events-none" />

        {/* Étoiles flottantes */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
            style={{
              top: `${10 + (i * 73) % 80}%`,
              left: `${5 + (i * 37) % 90}%`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-24 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest rounded-full border border-amber-500/30 mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Donald Gros Club
                </span>
                <h1 className="text-4xl md:text-6xl font-display font-black leading-tight mb-6">
                  {fr ? (
                    <>
                      Chaque achat vous<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">rapporte des</span><br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">récompenses !</span>
                    </>
                  ) : (
                    <>
                      Every purchase<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">earns you amazing</span><br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">rewards!</span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-white/70 max-w-lg leading-relaxed mb-10">
                  {fr
                    ? "Rejoignez le programme de fidélité Donald Gros. Gagnez des points à chaque commande et échangez-les contre des cadeaux exclusifs à retirer directement en boutique."
                    : "Join the Donald Gros loyalty program. Earn points with every order and exchange them for exclusive gifts to collect directly in our store."}
                </p>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.location.hash = user ? 'profile?tab=loyalty' : 'signup'}
                    className="h-14 px-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-display font-bold rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center gap-2"
                  >
                    <Gift className="w-5 h-5" />
                    {user ? (fr ? 'Voir mes points' : 'View my points') : (fr ? 'Commencer à gagner' : 'Start earning')}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.location.hash = 'catalogue'}
                    className="h-14 px-8 bg-white/10 border border-white/20 text-white font-bold rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {fr ? 'Explorer le catalogue' : 'Browse catalogue'}
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Carte VIP Hero */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-72 h-44 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm rotate-6" />
                <div className="relative bg-gradient-to-br from-white/15 via-white/10 to-transparent backdrop-blur-xl rounded-[32px] border border-white/20 p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-300/80 font-bold uppercase tracking-widest">Donald Gros Club</p>
                        <p className="text-white font-black text-lg">Programme Fidélité</p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/30">
                      🥉 Bronze
                    </span>
                  </div>

                  <div className="mb-6">
                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold mb-1">{fr ? 'Solde de Points' : 'Points Balance'}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-black text-amber-400">750</span>
                      <span className="text-xl text-amber-300/80 font-bold">pts</span>
                    </div>
                    <p className="text-white/60 text-xs mt-1">
                      {fr ? 'Plus que 250 pts pour votre cadeau !' : 'Only 250 pts left for your gift!'}
                    </p>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-white/50 mb-2">
                      <span>750 / 1 000 pts</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '75%' }}
                        transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: '🛍️', label: fr ? '5 Commandes' : '5 Orders', sub: fr ? 'récompensées' : 'rewarded' },
                      { icon: '🎁', label: fr ? '1 Cadeau' : '1 Gift', sub: fr ? 'disponible à 1 000 pts' : 'at 1,000 pts' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
                        <p className="text-2xl mb-1">{s.icon}</p>
                        <p className="text-white font-bold text-sm">{s.label}</p>
                        <p className="text-white/50 text-[10px]">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-primary-blue py-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: 1000, suffix: ' pts', label: fr ? 'Pour votre 1er cadeau' : 'For your 1st gift' },
              { value: 10, suffix: ' pts', label: fr ? 'Pour chaque 1 000 FCFA' : 'Per 1,000 FCFA spent' },
              { value: 4, suffix: '', label: fr ? 'Paliers de cadeaux' : 'Gift milestones' },
              { value: 75000, suffix: ' F', label: fr ? 'Valeur max cadeau Platine' : 'Max Platinum gift value' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-3xl md:text-4xl font-display font-black text-amber-300">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-white/70 font-medium mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE (4 ÉTAPES) ─────────────────────────────────── */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest rounded-full border border-amber-200 mb-4">
            {fr ? "Mode d'emploi" : 'How it works'}
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black text-dark-gray">
            {fr ? "C'est ultra simple !" : 'It\'s super simple!'}
          </h2>
          <p className="text-lg text-medium-gray max-w-2xl mx-auto mt-4">
            {fr ? "En 4 étapes, comprenez comment gagner des points et repartir avec de vrais cadeaux depuis notre boutique." : "In 4 steps, understand how to earn points and leave with real gifts from our store."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Trait de connexion desktop */}
          <div className="absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-blue via-amber-400 to-purple-600 hidden lg:block -z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative z-10 text-center group"
            >
              <div className={`w-24 h-24 ${step.color} rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 relative`}>
                {step.icon}
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-dark-gray text-sm font-black rounded-full flex items-center justify-center shadow-lg border border-light-gray">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-dark-gray mb-3">{step.title}</h3>
              <p className="text-sm text-medium-gray leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CALCULATRICE INTERACTIVE ───────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-amber-50/30 to-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-black text-dark-gray">
              {fr ? '💡 Calculez vos points' : '💡 Calculate your points'}
            </h2>
            <p className="text-medium-gray mt-3 max-w-xl mx-auto">
              {fr ? "Voici ce que vous gagnez selon le montant de vos achats :" : "Here's what you earn based on your purchase amount:"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleOrders.map((ex, i) => {
              const pts = calculateOrderPoints(ex.amount);
              const toNext = pts >= 1000 ? 0 : 1000 - pts;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-light-gray rounded-3xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <p className="text-sm text-medium-gray font-bold uppercase tracking-wide mb-3">{ex.label}</p>
                  <p className="text-3xl font-display font-black text-dark-gray mb-1">
                    {ex.amount.toLocaleString()} FCFA
                  </p>
                  <div className="my-4 flex items-center justify-center">
                    <div className="h-px flex-1 bg-light-gray" />
                    <ChevronRight className="w-4 h-4 text-amber-500 mx-2" />
                    <div className="h-px flex-1 bg-light-gray" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-2xl font-display font-black text-amber-800">+{pts} pts</span>
                  </div>
                  {toNext > 0 ? (
                    <p className="text-xs text-medium-gray mt-3">
                      {fr ? `Encore ${toNext} pts pour le 1er cadeau` : `${toNext} pts left for 1st gift`}
                    </p>
                  ) : (
                    <p className="text-xs text-primary-green font-bold mt-3">
                      🎉 {fr ? '1er cadeau débloqué !' : '1st gift unlocked!'}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Formule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 bg-dark-gray text-white rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
          >
            <div className="text-5xl shrink-0">🧮</div>
            <div className="flex-1">
              <h3 className="font-display font-black text-xl mb-2">
                {fr ? 'La formule magique' : 'The magic formula'}
              </h3>
              <p className="text-white/70 text-sm">
                {fr
                  ? 'Points gagnés = (Montant de votre commande en FCFA) × 0,01 — autrement dit : chaque tranche de 1 000 FCFA = 10 points.'
                  : 'Points earned = (Order amount in FCFA) × 0.01 — in other words: every 1,000 FCFA = 10 points.'}
              </p>
            </div>
            <div className="bg-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl whitespace-nowrap text-sm shrink-0">
              1 000 FCFA = 10 pts ⭐
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PALIERS DE CADEAUX ────────────────────────────────────────────── */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1 bg-green-50 text-primary-green text-xs font-black uppercase tracking-widest rounded-full border border-green-200 mb-4">
            {fr ? 'Vos Récompenses' : 'Your Rewards'}
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black text-dark-gray">
            {fr ? 'Des cadeaux qui valent le coup 🎁' : 'Gifts worth it 🎁'}
          </h2>
          <p className="text-medium-gray max-w-2xl mx-auto mt-4">
            {fr ? "Atteignez les paliers de points pour débloquer des récompenses physiques à retirer dans nos boutiques Donald Gros." : "Reach point milestones to unlock physical rewards to collect at our Donald Gros stores."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {GIFT_MILESTONES.map((milestone, i) => (
            <MilestoneCard key={milestone.id} milestone={milestone} index={i} language={language} />
          ))}
        </div>
      </section>

      {/* ─── NIVEAUX VIP ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-950 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 text-white"
          >
            <h2 className="text-4xl md:text-5xl font-display font-black">
              {fr ? 'Montez en grade !' : 'Level up!'}
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto mt-4">
              {fr ? "Plus vous commandez, plus votre rang VIP est élevé et plus vos récompenses sont exceptionnelles." : "The more you order, the higher your VIP rank and the more exceptional your rewards."}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{tier.emoji}</div>
                  <h3 className={`font-display font-black text-2xl mb-1 text-transparent bg-clip-text bg-gradient-to-r ${tier.gradient}`}>
                    {tier.name}
                  </h3>
                  <p className="text-white/40 text-xs font-bold mb-5">{tier.range}</p>
                  <ul className="space-y-2">
                    {tier.perks.map((perk, pi) => (
                      <li key={pi} className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle2 className="w-4 h-4 text-primary-green shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INFO BOUTIQUE ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Store className="w-16 h-16 text-white/80 mb-6" />
              <h2 className="text-4xl md:text-5xl font-display font-black mb-6">
                {fr ? 'Récupérez votre cadeau en boutique physique !' : 'Collect your gift in our physical store!'}
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                {fr
                  ? "Une fois votre palier atteint, rendez-vous dans l'une de nos boutiques Donald Gros. Présentez simplement votre numéro de téléphone d'inscription et notre équipe vérifie votre solde pour vous remettre votre récompense immédiatement."
                  : "Once you reach your milestone, visit one of our Donald Gros stores. Simply show your registered phone number and our team checks your balance to hand you your reward immediately."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex items-start gap-3 flex-1">
                  <MapPin className="w-6 h-6 text-white mt-0.5 shrink-0" />
                  <div>
                    <p className="font-black text-sm">{fr ? 'Boutiques' : 'Stores'}</p>
                    <p className="text-white/70 text-sm">Douala & Yaoundé</p>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex items-start gap-3 flex-1">
                  <Phone className="w-6 h-6 text-white mt-0.5 shrink-0" />
                  <div>
                    <p className="font-black text-sm">{fr ? 'Contact Fidélité' : 'Loyalty Contact'}</p>
                    <p className="text-white/70 text-sm">+237 6XX XXX XXX</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Étapes simplifiées retrait */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                { n: 1, t: fr ? 'Atteignez 1 000 points' : 'Reach 1,000 points', d: fr ? 'Commandez sur le site jusqu\'à atteindre votre premier palier.' : 'Order on the site until you reach your first milestone.' },
                { n: 2, t: fr ? 'Rendez-vous en boutique' : 'Visit the store', d: fr ? 'Venez dans nos boutiques à Douala ou Yaoundé avec votre téléphone.' : 'Come to our stores in Douala or Yaoundé with your phone.' },
                { n: 3, t: fr ? 'Présentez votre numéro' : 'Show your number', d: fr ? 'Donnez votre numéro de téléphone d\'inscription à notre équipe.' : 'Give your registered phone number to our team.' },
                { n: 4, t: fr ? 'Récupérez votre cadeau ! 🎉' : 'Collect your gift! 🎉', d: fr ? 'Notre équipe vérifie votre solde et vous remet votre cadeau sur le champ.' : 'Our team checks your balance and hands you your gift right away.' },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
                  <div className="w-10 h-10 bg-white text-amber-700 font-black rounded-xl flex items-center justify-center shrink-0 shadow-lg text-lg">
                    {step.n}
                  </div>
                  <div>
                    <h4 className="font-display font-black text-white">{step.t}</h4>
                    <p className="text-white/70 text-sm">{step.d}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-[1440px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-black text-dark-gray">
            {fr ? 'Vous avez des questions ?' : 'Have questions?'}
          </h2>
          <p className="text-medium-gray mt-4">
            {fr ? 'Tout ce que vous devez savoir sur le programme de fidélité Donald Gros.' : 'Everything you need to know about the Donald Gros loyalty program.'}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </section>

      {/* ─── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary-blue to-[#1e3a8a] text-white text-center overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full bg-white/5"
              style={{ top: `${(i * 33) % 100}%`, left: `${(i * 47) % 100}%` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
            />
          ))}
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-4xl md:text-5xl font-display font-black mb-6">
              {fr ? 'Prêt à accumuler vos points ?' : 'Ready to stack your points?'}
            </h2>
            <p className="text-lg text-white/70 mb-10">
              {fr ? "Commencez dès maintenant ! Chaque commande vous rapproche de votre prochain cadeau en boutique." : "Start now! Every order brings you closer to your next in-store gift."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.hash = user ? 'profile?tab=loyalty' : 'signup'}
                className="h-14 px-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-display font-bold rounded-2xl shadow-2xl flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                {user ? (fr ? 'Voir mon espace fidélité' : 'View my loyalty space') : (fr ? 'Créer mon compte' : 'Create account')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.hash = 'catalogue'}
                className="h-14 px-10 bg-white/10 border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {fr ? 'Commander maintenant' : 'Order now'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// ─── Composant FAQ accordéon ─────────────────────────────────────────────────
const FaqItem = ({ q, a, index }: { key?: React.Key; q: string; a: string; index: number }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-primary-blue shadow-lg shadow-primary-blue/10' : 'border-light-gray'}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-6 text-left font-bold transition-all ${open ? 'bg-primary-blue/5 text-primary-blue' : 'bg-white text-dark-gray hover:bg-light-gray/50'}`}
      >
        <span className="pr-4 text-base">{q}</span>
        <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-90 text-primary-blue' : 'text-medium-gray'}`} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-6 text-medium-gray text-sm leading-relaxed">{a}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
