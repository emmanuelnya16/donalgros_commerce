import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ShoppingBag, Star, Store, Gift, Trophy, Crown, Sparkles,
  ChevronRight, CheckCircle2, ArrowRight, MapPin, Phone,
  User, TrendingUp, Award, Zap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { GIFT_MILESTONES, calculateOrderPoints } from '../utils/loyalty';

// ─── Mini composant : compteur animé au scroll ───────────────────────────────
const Counter = ({ end, suffix = '' }: { end: number; suffix?: string }) => {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let n = 0;
      const step = end / 60;
      const t = setInterval(() => {
        n = Math.min(n + step, end);
        setVal(Math.floor(n));
        if (n >= end) clearInterval(t);
      }, 16);
      obs.disconnect();
    }, { threshold: 0.6 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString('fr-FR')}{suffix}</span>;
};

// ─── Jauge de progression (utilisée dans la section calculatrice) ─────────────
const ProgressRing = ({ pct, color }: { pct: number; color: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
      <motion.circle
        cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        whileInView={{ strokeDashoffset: circ * (1 - pct / 100) }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export const LoyaltyPublicPage = () => {
  const { language, user } = useAppContext();
  const fr = language === 'fr';

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);   // parallax hero text
  const heroBgY = useTransform(scrollY, [0, 500], [0, 120]); // parallax bg

  // ─── Données statiques ──────────────────────────────────────────────────────
  const steps = [
    {
      n: '01',
      icon: <ShoppingBag className="w-7 h-7" />,
      bg: 'bg-[#1a56db]',
      title: fr ? 'Vous commandez' : 'You order',
      body: fr
        ? 'Passez une commande sur le site. Dès qu\'elle est confirmée, vos points fidélité sont calculés et crédités automatiquement.'
        : 'Place an order on the site. Once confirmed, your loyalty points are calculated and credited automatically.',
      accent: '#1a56db',
    },
    {
      n: '02',
      icon: <Star className="w-7 h-7 fill-white" />,
      bg: 'bg-amber-500',
      title: fr ? 'Vous gagnez des points' : 'You earn points',
      body: fr
        ? 'La règle est simple et permanente : 1 000 FCFA dépensés = 10 points. Ils s\'accumulent sans limite de temps sur toutes vos commandes valides.'
        : 'The rule is simple and permanent: 1,000 FCFA spent = 10 points. They accumulate without time limit across all your valid orders.',
      accent: '#f59e0b',
    },
    {
      n: '03',
      icon: <TrendingUp className="w-7 h-7" />,
      bg: 'bg-[#16a34a]',
      title: fr ? 'Votre rang monte' : 'Your rank rises',
      body: fr
        ? 'Bronze, Silver, Gold, Platine — votre statut VIP évolue automatiquement. Plus vous commandez, plus vos récompenses sont exclusives.'
        : 'Bronze, Silver, Gold, Platinum — your VIP status evolves automatically. The more you order, the more exclusive your rewards.',
      accent: '#16a34a',
    },
    {
      n: '04',
      icon: <Store className="w-7 h-7" />,
      bg: 'bg-[#111827]',
      title: fr ? 'Cadeau en boutique' : 'Gift in-store',
      body: fr
        ? 'Dès un palier atteint, rendez-vous dans l\'une de nos boutiques à Douala ou Yaoundé avec votre numéro client. Le cadeau est remis en mains propres.'
        : 'Once a milestone is reached, visit one of our stores in Douala or Yaoundé with your customer number. The gift is handed in person.',
      accent: '#111827',
    },
  ];

  const tiers = [
    { emoji: '🥉', name: 'Bronze',  range: fr ? '0 – 2 499 pts'  : '0 – 2,499 pts',  col: 'border-amber-700/30 bg-amber-700/5', text: 'text-amber-700', ring: '#b45309' },
    { emoji: '🥈', name: 'Silver',  range: fr ? '2 500 – 4 999 pts' : '2,500 – 4,999 pts', col: 'border-slate-400/30 bg-slate-400/5', text: 'text-slate-500', ring: '#94a3b8' },
    { emoji: '🥇', name: 'Gold',    range: fr ? '5 000 – 9 999 pts' : '5,000 – 9,999 pts', col: 'border-yellow-500/30 bg-yellow-500/5', text: 'text-yellow-600', ring: '#eab308' },
    { emoji: '💎', name: 'Platine', range: '10 000+ pts',            col: 'border-[#1a56db]/30 bg-[#1a56db]/5', text: 'text-[#1a56db]', ring: '#1a56db' },
  ];

  const milestoneIcons: Record<string, React.ReactNode> = {
    gift:     <Gift     className="w-6 h-6" />,
    trophy:   <Trophy   className="w-6 h-6" />,
    crown:    <Crown    className="w-6 h-6" />,
    sparkles: <Sparkles className="w-6 h-6" />,
  };

  const milestoneAccents = ['#f59e0b', '#94a3b8', '#eab308', '#1a56db'];

  const calcExamples = [5000, 15000, 25000, 50000, 100000];

  const faqs = [
    {
      q: fr ? 'Les points ont-ils une date d\'expiration ?' : 'Do points expire?',
      a: fr ? 'Non. Vos points sont permanents. Ils s\'accumulent sans limite de temps et restent acquis même si vous ne commandez pas pendant plusieurs mois.' : 'No. Your points are permanent. They accumulate without time limit and remain even if you don\'t order for several months.',
    },
    {
      q: fr ? 'Puis-je utiliser mes points pour payer en ligne ?' : 'Can I use points to pay online?',
      a: fr ? 'Non — les points ne sont pas une monnaie de paiement en ligne. Ils débloquent uniquement des cadeaux physiques retirables en boutique.' : 'No — points are not an online payment currency. They unlock only physical gifts collectable in-store.',
    },
    {
      q: fr ? 'Quelles commandes comptent pour les points ?' : 'Which orders count for points?',
      a: fr ? 'Toutes les commandes confirmées, en cours, expédiées ou livrées. Les commandes annulées ou échouées ne génèrent pas de points.' : 'All confirmed, processing, shipped or delivered orders. Cancelled or failed orders do not generate points.',
    },
    {
      q: fr ? 'Comment consulter mon solde de points ?' : 'How do I check my points balance?',
      a: fr ? 'Connectez-vous à votre compte puis ouvrez l\'onglet "Fidélité & Cadeaux" dans votre profil. Votre solde est recalculé en temps réel à partir de vos commandes.' : 'Log into your account then open the "Loyalty & Rewards" tab in your profile. Your balance is recalculated in real time from your orders.',
    },
    {
      q: fr ? 'Comment récupérer un cadeau ?' : 'How do I collect a gift?',
      a: fr ? 'Rendez-vous dans l\'une de nos boutiques (Douala ou Yaoundé) avec votre numéro de téléphone d\'inscription. Notre équipe vérifie votre solde et vous remet le cadeau sur place.' : 'Visit one of our stores (Douala or Yaoundé) with your registered phone number. Our team checks your balance and hands you the gift on the spot.',
    },
  ];

  return (
    <div className="bg-white overflow-hidden" id="loyalty-public-page">

      {/* ════════════════════════════════════════════════════════════════════
          HERO — fond noir structuré, typographie grand corps
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center bg-[#111827] overflow-hidden">

        {/* Grille de fond */}
        <motion.div
          style={{ y: heroBgY }}
          className="absolute inset-0 pointer-events-none"
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(26,86,219,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(26,86,219,0.07) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Halo bleu gauche */}
          <div className="absolute top-1/3 -left-40 w-[480px] h-[480px] bg-[#1a56db]/15 rounded-full blur-3xl" />
          {/* Halo vert droite */}
          <div className="absolute bottom-1/4 right-0 w-[360px] h-[360px] bg-[#16a34a]/12 rounded-full blur-3xl" />
        </motion.div>

        {/* Ligne décorative verticale gauche */}
        <div className="absolute left-12 top-0 bottom-0 hidden xl:flex flex-col items-center gap-0 pointer-events-none" aria-hidden>
          <div className="flex-1 w-px bg-gradient-to-b from-transparent via-[#1a56db]/40 to-transparent" />
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-16 w-full pt-20 pb-24">
          <motion.div style={{ y: heroY }}>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-8 bg-[#1a56db]" />
              <span className="text-[#1a56db] text-xs font-display font-black uppercase tracking-[0.2em]">
                Donald Gros Club
              </span>
            </motion.div>

            {/* Titre principal — typographie à grand corps, poids maximum */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6.5rem)' }}
            >
              Chaque achat<br />
              <span style={{ color: '#1a56db' }}>vous rapporte</span><br />
              <span className="text-white/30">quelque chose.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed mb-12 font-sans"
            >
              {fr
                ? 'Commandez sur le site Donald Gros et gagnez des points fidélité. Quand vous en avez assez, un cadeau vous attend en boutique — sans condition, sans délai.'
                : 'Order from Donald Gros and earn loyalty points. When you have enough, a gift awaits you in-store — no conditions, no waiting.'}
            </motion.p>

            {/* CTA pair */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                id="loyalty-hero-cta-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.hash = user ? 'profile?tab=loyalty' : 'signup'}
                className="group h-14 px-8 bg-[#1a56db] text-white font-display font-black rounded-xl flex items-center gap-3 shadow-lg shadow-[#1a56db]/30 hover:bg-[#1444b8] transition-colors"
              >
                {user ? (fr ? 'Voir mes points' : 'View my points') : (fr ? 'Créer un compte' : 'Create account')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                id="loyalty-hero-cta-secondary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  document.getElementById('loyalty-steps')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-14 px-8 border border-white/20 text-white/80 font-display font-bold rounded-xl hover:border-white/40 hover:text-white transition-all"
              >
                {fr ? 'Comment ça marche ?' : 'How does it work?'}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Carte flottante droite — aperçu visuel du programme */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 hidden xl:block w-72"
          >
            {/* Carte fond bleu */}
            <div className="bg-[#1a56db] rounded-3xl p-6 shadow-2xl shadow-[#1a56db]/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <p className="text-blue-100/80 text-xs font-bold uppercase tracking-widest mb-1">Donald Gros Club</p>
              <p className="text-white font-display font-black text-lg mb-6">Solde fidélité</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-display font-black text-white">750</span>
                <span className="text-xl text-blue-200 font-bold">pts</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full mt-4 mb-2">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1.4, delay: 0.9 }}
                />
              </div>
              <p className="text-blue-100/70 text-xs">250 pts avant ton 1er cadeau 🎁</p>
            </div>

            {/* Pastille flottante */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mt-4 bg-white border border-[#f3f4f6] rounded-2xl p-4 shadow-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[#16a34a]/10 flex items-center justify-center">
                <Gift className="w-5 h-5 text-[#16a34a]" />
              </div>
              <div>
                <p className="text-[#111827] text-sm font-black">Cadeau disponible !</p>
                <p className="text-[#6b7280] text-xs">Retrait en boutique</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Indicateur de scroll */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40"
        >
          <div className="w-px h-12 bg-white" />
          <p className="text-white text-[10px] uppercase tracking-[0.2em] font-sans">Défiler</p>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CHIFFRES CLÉS — bande bleue pleine
      ════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1a56db] py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {[
            { end: 10, suffix: ' pts',    label: fr ? 'pour chaque 1 000 FCFA' : 'per 1,000 FCFA' },
            { end: 1000, suffix: ' pts',  label: fr ? 'pour le 1er cadeau'     : 'for your 1st gift' },
            { end: 4, suffix: '',         label: fr ? 'paliers de cadeaux'     : 'gift milestones' },
            { end: 75000, suffix: ' FCFA', label: fr ? 'valeur du cadeau Platine' : 'Platinum gift value' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="font-display font-black text-3xl md:text-4xl text-white">
                <Counter end={s.end} suffix={s.suffix} />
              </p>
              <p className="text-blue-200 text-sm font-sans mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          LES 4 ÉTAPES — fond blanc, numérotation éditoriale
      ════════════════════════════════════════════════════════════════════ */}
      <section id="loyalty-steps" className="py-28 max-w-[1280px] mx-auto px-6 md:px-16">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-[#1a56db] text-xs font-display font-black uppercase tracking-[0.2em] mb-4">
            {fr ? 'Comment ça marche' : 'How it works'}
          </p>
          <h2 className="font-display font-black text-[#111827] leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {fr ? 'Simple. Automatique. Gratifiant.' : 'Simple. Automatic. Rewarding.'}
          </h2>
        </motion.div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col md:flex-row items-start md:items-center gap-8 py-10 ${i < steps.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}
            >
              {/* Numéro éditorial grand corps */}
              <span
                className="font-display font-black leading-none select-none shrink-0 hidden md:block"
                style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', color: step.accent, opacity: 0.15 }}
              >
                {step.n}
              </span>

              {/* Icône */}
              <div className={`${step.bg} w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg`}>
                {step.icon}
              </div>

              {/* Texte */}
              <div className="flex-1">
                <h3 className="font-display font-black text-[#111827] text-xl md:text-2xl mb-2">{step.title}</h3>
                <p className="font-sans text-[#6b7280] leading-relaxed max-w-2xl">{step.body}</p>
              </div>

              {/* Flèche de continuation sauf dernier */}
              {i < steps.length - 1 && (
                <ChevronRight className="hidden md:block w-5 h-5 text-[#f3f4f6] shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CALCULATRICE — fond gris très clair
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#f3f4f6]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          >
            <div>
              <p className="text-[#16a34a] text-xs font-display font-black uppercase tracking-[0.2em] mb-3">
                {fr ? 'Simulateur de points' : 'Points simulator'}
              </p>
              <h2 className="font-display font-black text-[#111827]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                {fr ? 'Combien allez-vous gagner ?' : 'How much will you earn?'}
              </h2>
            </div>
            <div className="bg-[#1a56db] text-white rounded-2xl px-5 py-3 font-display font-black text-sm shrink-0">
              1 000 FCFA = 10 pts ⭐
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {calcExamples.map((amount, i) => {
              const pts = calculateOrderPoints(amount);
              const pct = Math.min(100, Math.round((pts / 1000) * 100));
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
                >
                  <p className="text-[#6b7280] text-xs font-sans font-bold uppercase tracking-wide mb-3">
                    {fr ? 'Commande' : 'Order'}
                  </p>
                  <p className="font-display font-black text-[#111827] text-xl mb-4">
                    {amount.toLocaleString('fr-FR')} <span className="text-sm font-sans font-bold text-[#6b7280]">FCFA</span>
                  </p>

                  {/* Jauge circulaire */}
                  <div className="relative flex items-center justify-center mb-4">
                    <ProgressRing pct={pct} color={pct >= 100 ? '#16a34a' : '#1a56db'} />
                    <div className="absolute text-center">
                      <span className="font-display font-black text-xs text-[#111827]">{pct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-display font-black text-amber-800">+{pts} pts</span>
                  </div>

                  <p className="text-[#6b7280] text-[11px] font-sans mt-3">
                    {pts >= 1000
                      ? <span className="text-[#16a34a] font-bold">🎁 {fr ? '1er cadeau atteint !' : '1st gift reached!'}</span>
                      : fr ? `Encore ${1000 - pts} pts pour le 1er cadeau` : `${1000 - pts} pts left for 1st gift`}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          PALIERS DE CADEAUX — fond blanc, accent couleur par palier
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 max-w-[1280px] mx-auto px-6 md:px-16">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-[#1a56db] text-xs font-display font-black uppercase tracking-[0.2em] mb-3">
            {fr ? 'Vos récompenses' : 'Your rewards'}
          </p>
          <h2 className="font-display font-black text-[#111827]" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            {fr ? 'Quatre paliers. Quatre cadeaux.' : 'Four milestones. Four gifts.'}
          </h2>
          <p className="text-[#6b7280] max-w-xl mx-auto mt-4 font-sans">
            {fr
              ? 'Les cadeaux sont des objets physiques remis en boutique. Leur valeur croît avec votre rang.'
              : 'Gifts are physical items handed in-store. Their value grows with your rank.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {GIFT_MILESTONES.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative border border-[#f3f4f6] rounded-3xl p-7 hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 bg-white overflow-hidden"
            >
              {/* Trait coloré supérieur */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                style={{ background: milestoneAccents[i] }}
              />

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg"
                style={{ background: milestoneAccents[i] }}
              >
                {milestoneIcons[m.iconName]}
              </div>

              <p className="font-sans font-bold text-[#6b7280] text-xs uppercase tracking-widest mb-1">
                {m.pointsRequired.toLocaleString('fr-FR')} pts
              </p>
              <h3 className="font-display font-black text-[#111827] text-lg mb-3 leading-snug">
                {fr ? m.titleFr : m.titleEn}
              </h3>
              <p className="font-sans text-[#6b7280] text-sm leading-relaxed mb-6">
                {fr ? m.descriptionFr : m.descriptionEn}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#f3f4f6]">
                <span
                  className="text-xs font-display font-black px-3 py-1 rounded-lg"
                  style={{ color: milestoneAccents[i], background: `${milestoneAccents[i]}15` }}
                >
                  {m.rewardValueLabel}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#6b7280] font-sans font-bold">
                  <Store className="w-3.5 h-3.5" />
                  {fr ? 'En boutique' : 'In-store'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          NIVEAUX VIP — fond [#111827] textures
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#111827]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-16">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          >
            <div>
              <p className="text-[#1a56db] text-xs font-display font-black uppercase tracking-[0.2em] mb-3">
                {fr ? 'Rangs membres' : 'Member ranks'}
              </p>
              <h2 className="font-display font-black text-white" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                {fr ? 'Votre rang progresse avec vous.' : 'Your rank grows with you.'}
              </h2>
            </div>
            <p className="text-white/40 font-sans text-sm max-w-xs">
              {fr
                ? 'Plus de points = rang plus élevé = cadeaux plus précieux.'
                : 'More points = higher rank = more precious gifts.'}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`border ${tier.col} rounded-3xl p-6 group hover:bg-white/5 transition-all`}
              >
                <div className="text-4xl mb-3">{tier.emoji}</div>
                <h3 className={`font-display font-black text-2xl ${tier.text} mb-1`}>{tier.name}</h3>
                <p className="text-white/40 text-xs font-sans font-bold">{tier.range}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          RETRAIT EN BOUTIQUE — fond vert, 4 étapes horizontales
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#16a34a] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Store className="w-14 h-14 text-white/30 mx-auto mb-4" />
            <h2 className="font-display font-black text-white" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              {fr ? 'Récupérer votre cadeau' : 'Collect your gift'}
            </h2>
            <p className="text-green-100/70 mt-3 max-w-lg mx-auto font-sans">
              {fr
                ? 'Pas de code, pas de formulaire. Une visite en boutique suffit.'
                : 'No code, no form. A store visit is all it takes.'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Ligne de connexion */}
            <div className="absolute top-8 left-[12.5%] right-[12.5%] h-px bg-white/20 hidden md:block" aria-hidden />

            {[
              { n: 1, t: fr ? 'Atteignez 1 000 pts' : 'Reach 1,000 pts', d: fr ? 'Continuez à commander jusqu\'au palier.' : 'Keep ordering until the milestone.' },
              { n: 2, t: fr ? 'Rendez-vous en boutique' : 'Visit the store', d: fr ? 'Douala ou Yaoundé, l\'un ou l\'autre.' : 'Douala or Yaoundé, either one.' },
              { n: 3, t: fr ? 'Donnez votre numéro' : 'Give your number', d: fr ? 'Votre numéro de téléphone d\'inscription.' : 'Your registered phone number.' },
              { n: 4, t: fr ? 'Récupérez le cadeau' : 'Pick up the gift', d: fr ? 'Remis en mains propres, immédiatement.' : 'Handed in person, immediately.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white text-[#16a34a] font-display font-black text-xl flex items-center justify-center mb-4 shadow-xl z-10 relative">
                  {s.n}
                </div>
                <h4 className="font-display font-black text-white mb-2">{s.t}</h4>
                <p className="text-green-100/70 text-sm font-sans">{s.d}</p>
              </motion.div>
            ))}
          </div>

          {/* Informations boutiques */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto"
          >
            {[
              { icon: <MapPin className="w-5 h-5" />, label: fr ? 'Nos boutiques' : 'Our stores', val: 'Douala & Yaoundé' },
              { icon: <Phone className="w-5 h-5" />, label: 'WhatsApp', val: '+237 682 218 536' },
            ].map((info, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/10 rounded-2xl p-5 border border-white/15">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  {info.icon}
                </div>
                <div>
                  <p className="text-green-100/60 text-xs font-sans font-bold">{info.label}</p>
                  <p className="text-white font-display font-black text-sm">{info.val}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          À RETENIR — points clés, fond blanc
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-[1280px] mx-auto px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-[#1a56db] text-xs font-display font-black uppercase tracking-[0.2em] mb-3">
            {fr ? 'À retenir' : 'Key points'}
          </p>
          <h2 className="font-display font-black text-[#111827]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            {fr ? 'Les règles essentielles' : 'The essential rules'}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6 text-[#1a56db]" />,
              bg: 'bg-[#1a56db]/5 border-[#1a56db]/15',
              title: fr ? 'Automatique' : 'Automatic',
              body: fr
                ? 'Vos points sont calculés et crédités automatiquement. Aucune action requise de votre part après la commande.'
                : 'Your points are calculated and credited automatically. No action required from you after the order.',
            },
            {
              icon: <Award className="w-6 h-6 text-[#16a34a]" />,
              bg: 'bg-[#16a34a]/5 border-[#16a34a]/15',
              title: fr ? 'Cadeaux physiques' : 'Physical gifts',
              body: fr
                ? 'Les points ne sont pas une réduction en ligne. Ils donnent accès à des cadeaux réels, retirables uniquement en boutique.'
                : 'Points are not an online discount. They give access to real gifts, collectable only in-store.',
            },
            {
              icon: <User className="w-6 h-6 text-amber-600" />,
              bg: 'bg-amber-500/5 border-amber-500/15',
              title: fr ? 'Suivi en direct' : 'Live tracking',
              body: fr
                ? 'Connectez-vous et ouvrez l\'onglet "Fidélité & Cadeaux" dans votre profil. Votre solde est toujours à jour.'
                : 'Log in and open the "Loyalty & Rewards" tab in your profile. Your balance is always up to date.',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`border ${card.bg} rounded-3xl p-7`}
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="font-display font-black text-[#111827] text-lg mb-2">{card.title}</h3>
              <p className="font-sans text-[#6b7280] text-sm leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FAQ — accordéon, fond gris très clair
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#f3f4f6]">
        <div className="max-w-[820px] mx-auto px-6 md:px-16">

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[#1a56db] text-xs font-display font-black uppercase tracking-[0.2em] mb-3">FAQ</p>
            <h2 className="font-display font-black text-[#111827]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
              {fr ? 'Questions fréquentes' : 'Frequently asked questions'}
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqRow key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          CTA FINAL — fond [#1a56db], sobre et direct
      ════════════════════════════════════════════════════════════════════ */}
      <section className="py-28 bg-[#1a56db]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[760px] mx-auto px-6 text-center text-white"
        >
          <p className="text-blue-300 text-xs font-display font-black uppercase tracking-[0.2em] mb-5">
            {fr ? 'Prêt ?' : "Ready?"}
          </p>
          <h2 className="font-display font-black leading-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
            {fr ? 'Commandez et commencez à gagner.' : 'Order and start earning.'}
          </h2>
          <p className="text-blue-200 font-sans text-lg mb-10 max-w-md mx-auto">
            {fr
              ? 'Chaque commande compte. Votre premier cadeau est peut-être plus proche que vous ne le pensez.'
              : 'Every order counts. Your first gift may be closer than you think.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              id="loyalty-final-cta-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.hash = user ? 'profile?tab=loyalty' : 'signup'}
              className="group h-14 px-10 bg-white text-[#1a56db] font-display font-black rounded-xl flex items-center justify-center gap-3 shadow-xl hover:bg-blue-50 transition-colors"
            >
              {user ? (fr ? 'Voir mes points' : 'My points') : (fr ? 'Créer mon compte gratuit' : 'Create free account')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              id="loyalty-final-cta-secondary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => window.location.hash = 'catalogue'}
              className="h-14 px-10 border border-white/25 text-white font-display font-bold rounded-xl hover:border-white/50 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5" />
              {fr ? 'Voir le catalogue' : 'Browse catalogue'}
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

// ─── Accordéon FAQ ────────────────────────────────────────────────────────────
const FaqRow = ({ q, a, index }: { key?: React.Key; q: string; a: string; index: number }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className={`bg-white rounded-2xl overflow-hidden border transition-all ${open ? 'border-[#1a56db]/30 shadow-md shadow-[#1a56db]/10' : 'border-transparent'}`}
    >
      <button
        id={`faq-btn-${index}`}
        className="w-full flex items-center justify-between px-6 py-5 text-left group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className={`font-display font-bold text-sm md:text-base transition-colors ${open ? 'text-[#1a56db]' : 'text-[#111827]'}`}>
          {q}
        </span>
        <ChevronRight
          className={`w-4 h-4 shrink-0 ml-4 transition-all duration-300 ${open ? 'rotate-90 text-[#1a56db]' : 'text-[#6b7280]'}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-6 font-sans text-[#6b7280] text-sm leading-relaxed">{a}</p>
        </motion.div>
      )}
    </motion.div>
  );
};
