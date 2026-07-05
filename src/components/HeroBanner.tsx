import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import banner from '../assets/slide/slide1.png';

export const HeroBanner = () => {
  const { language } = useAppContext();

  const SLIDES = [
    {
      category: language === 'fr' ? "STYLE HOMME" : "MEN STYLE",
      title: language === 'fr' ? "Style Homme — La Classe au Quotidien" : "Men's Style — Daily Class",
      subtitle: language === 'fr' ? "Découvrez notre nouvelle collection Homme Automne 2025." : "Discover our new 2025 Fall Men's collection.",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2000&auto=format&fit=crop",
      cta: language === 'fr' ? "Découvrir la Collection Homme" : "Discover Men's Collection",
      color: "#1A56DB"
    },
    {
      category: language === 'fr' ? "MODE FEMME" : "WOMEN MODE",
      title: language === 'fr' ? "Femme Moderne, Style Affirmé" : "Modern Woman, Assertive Style",
      subtitle: language === 'fr' ? "Explorez nos tenues qui subliment votre quotidien." : "Explore our outfits that sublimate your daily life.",
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop",
      cta: language === 'fr' ? "Explorer la Mode Femme" : "Explore Women's Mode",
      color: "#16A34A"
    },
    {
      category: language === 'fr' ? "SOLDES -40%" : "SALE -40%",
      title: language === 'fr' ? "Les Grandes Soldes sont Arrivées !" : "The Big Sales Have Arrived!",
      subtitle: language === 'fr' ? "Des remises exceptionnelles sur une sélection d'articles." : "Exceptional discounts on a selection of items.",
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2000&auto=format&fit=crop",
      cta: language === 'fr' ? "Profiter des Soldes" : "Enjoy the Sales",
      color: "#DC2626"
    },
    {
      category: language === 'fr' ? "MAISON" : "HOME",
      title: language === 'fr' ? "Équipez Votre Maison Intelligemment" : "Equip Your Home Smartly",
      subtitle: language === 'fr' ? "Appareils de haute qualité sélectionnés pour votre confort." : "High quality appliances selected for your comfort.",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=2000&auto=format&fit=crop",
      cta: language === 'fr' ? "Voir l'Électroménager" : "View Appliances",
      color: "#1A56DB"
    }
  ];

  const [current, setCurrent] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section
      className="relative w-full h-[320px] lg:h-[580px] overflow-hidden group bg-dark-gray"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={SLIDES[current].image}
            alt={SLIDES[current].title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-gray/70 via-dark-gray/40 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-20 w-full">
              <div className="max-w-2xl space-y-4 lg:space-y-6">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span
                    className="inline-block px-3 py-1 text-white font-display font-bold text-[10px] lg:text-[12px] rounded uppercase tracking-widest"
                    style={{ backgroundColor: SLIDES[current].color || '#1A56DB' }}
                  >
                    {SLIDES[current].category}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-white font-display font-bold text-2xl lg:text-[52px] leading-tight lg:leading-[1.1] drop-shadow-xl"
                >
                  {SLIDES[current].title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-white/90 font-display font-semibold text-sm lg:text-[22px] max-w-xl"
                >
                  {SLIDES[current].subtitle}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="pt-2 lg:pt-4"
                >
                  <button className="h-10 lg:h-14 px-6 lg:px-10 bg-white text-primary-blue hover:bg-primary-blue hover:text-white font-display font-bold rounded-lg border-none shadow-lg transition-all transform hover:scale-105 active:scale-95">
                    {SLIDES[current].cta}
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-10"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 z-10"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-500 rounded-full bg-white ${current === i ? 'w-10 h-2.5' : 'w-2.5 h-2.5 opacity-40 hover:opacity-100'}`}
          />
        ))}
      </div>
    </section>
  );
};

export const CategoryGrid = () => {
  const { language } = useAppContext();

  const CATEGORIES = [
    { id: 'homme', name: language === 'fr' ? 'HOMME' : 'MEN', count: 124, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCer20admfWblBk9dCsSSprT448KeqZkXpoA&s' },
    { id: 'femme', name: language === 'fr' ? 'FEMME' : 'WOMEN', count: 218, image: 'https://image.made-in-china.com/202f0j00kYvCAeQWEEbF/Summer-Black-New-Dress-Women-Fashion-Sexy-Evening-Dress.webp' },
    { id: 'chaussures', name: language === 'fr' ? 'CHAUSSURES' : 'SHOES', count: 86, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop' },
    { id: 'electromenager', name: language === 'fr' ? 'ELECTROMÉNAGER' : 'APPLIANCES', count: 42, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop' }
  ];

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="text-center mb-5">
        <h2 className="text-xl md:text-2xl font-display font-black text-dark-gray mb-1">
          {language === 'fr' ? 'Nos Univers' : 'Our Universes'}
        </h2>
        <p className="text-medium-gray text-[13px]">
          {language === 'fr' ? 'Explorez nos catégories' : 'Explore our categories'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} {...cat} />
        ))}
      </div>
    </section>
  );
};

const CategoryCard = ({ name, image }: any) => {
  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-light-gray h-28 md:h-36"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
        <h3 className="text-base md:text-lg font-display font-black text-white uppercase tracking-wider drop-shadow-md">
          {name}
        </h3>
      </div>
    </div>
  );
}
