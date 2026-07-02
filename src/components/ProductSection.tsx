import React from 'react';
import { Heart, ShoppingCart, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext, Product } from '../context/AppContext';

export const ProductCard: React.FC<{ 
  product: Product; 
  onCompare?: (id: string) => void;
  isComparing?: boolean;
}> = ({ 
  product, 
  onCompare, 
  isComparing 
}) => {
  const { cart, wishlist, addToCart, toggleWishlist, language } = useAppContext();
  const [isHovered, setIsHovered] = React.useState(false);
  
  const isInWishlist = wishlist.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.id === product.id);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.location.hash = `produits/${product.slug || product.id}`}
      className="w-full bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-500 group border border-gray-100 flex flex-col h-full overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#F8F9FB] to-white flex items-center justify-center p-2 sm:p-3">
        {/* Comparison Checkbox */}
        {onCompare && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20">
            <label className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg border border-gray-100 cursor-pointer shadow-sm hover:bg-white transition-all">
              <input 
                type="checkbox" 
                checked={isComparing}
                onChange={(e) => { e.stopPropagation(); onCompare(product.id); }}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded border-gray-300 text-primary-blue focus:ring-primary-blue/20"
              />
              <span className="text-[8px] sm:text-[9px] font-black text-dark-gray hidden sm:inline tracking-tighter">
                {language === 'fr' ? 'COMPARER' : 'COMPARE'}
              </span>
            </label>
          </div>
        )}

        {/* Badges */}
        {product.badge && !onCompare && (
          <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 ${product.badgeColor || 'bg-primary-green'} text-white text-[8px] sm:text-[10px] font-bold rounded-full uppercase z-10 shadow-sm tracking-wider`}>
            {product.badge}
          </div>
        )}
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center transition-all z-10 ${isInWishlist ? 'text-red-500 bg-white' : 'text-medium-gray hover:text-red-500 hover:bg-white'}`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <img 
          src={isHovered && product.image2 ? product.image2 : product.image} 
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />

        {/* Desktop Quick Add (Slide Up) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className={`w-full h-11 text-white font-display font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${isInCart ? 'bg-primary-green' : 'bg-primary-blue hover:bg-dark-gray'}`}
          >
            <ShoppingCart className="w-4 h-4" />
            {isInCart ? (language === 'fr' ? 'AU PANIER' : 'IN CART') : (language === 'fr' ? 'AJOUTER' : 'ADD')}
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-2.5 sm:p-3 md:p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] sm:text-[10px] md:text-[11px] text-medium-gray font-bold uppercase tracking-wide truncate">{product.brand}</span>
          <div className="flex items-center gap-0.5 shrink-0">
             <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
             <span className="text-[9px] sm:text-[10px] font-bold text-dark-gray">{product.rating}</span>
          </div>
        </div>

        <h3 className="font-display font-bold text-[11px] sm:text-xs md:text-[15px] text-dark-gray line-clamp-2 min-h-[32px] sm:min-h-[36px] md:min-h-[44px] mb-2 sm:mb-3 leading-snug group-hover:text-primary-blue transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1.5 mb-2 sm:mb-4">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-primary-green' : 'bg-red-500'} animate-pulse`} />
          <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${product.stock > 0 ? 'text-primary-green' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} ${language === 'fr' ? 'en Stock' : 'in Stock'}` : (language === 'fr' ? 'Rupture' : 'Out of Stock')}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-1">
          <div className="flex flex-col min-w-0">
            {product.originalPrice && (
              <span className="text-[9px] sm:text-[10px] md:text-sm text-medium-gray line-through decoration-red-400/50 mb-0.5">
                {product.originalPrice.toLocaleString()} F
              </span>
            )}
            <div className="flex items-baseline gap-0.5 sm:gap-1">
              <span className={`font-display font-black text-sm sm:text-base md:text-xl ${product.originalPrice ? 'text-red-600' : 'text-primary-blue'}`}>
                {product.price.toLocaleString()}
              </span>
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-medium-gray">F</span>
            </div>
          </div>

          {/* Mobile Cart Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className={`md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${isInCart ? 'bg-primary-green text-white' : 'bg-primary-blue text-white shadow-lg active:scale-90'}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export const ProductSection = ({ 
  title, 
  subtitle, 
  products, 
  badgeType 
}: { 
  title: string; 
  subtitle: string; 
  products: Product[];
  badgeType?: string;
}) => {
  const { language } = useAppContext();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="flex items-end justify-between mb-6 md:mb-8 border-b border-light-gray pb-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-dark-gray">{title}</h2>
          <p className="text-medium-gray text-xs sm:text-sm md:text-[15px] mt-1">{subtitle}</p>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <a href="#" className="flex items-center gap-1 text-primary-blue font-semibold hover:underline group">
            {language === 'fr' ? 'Voir tout' : 'View all'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="flex items-center gap-2 ml-4">
            <button onClick={() => scroll('left')} className="p-2 border border-light-gray rounded-full hover:bg-light-gray transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="p-2 border border-light-gray rounded-full hover:bg-light-gray transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: 2-column grid | Desktop: horizontal scroll */}
      {/* Mobile Grid */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={{...p, badge: badgeType}} />
        ))}
      </div>

      {/* Tablet + Desktop: horizontal scroll */}
      <div 
        ref={scrollRef}
        className="hidden sm:flex gap-4 md:gap-6 lg:gap-10 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[200px] md:w-[260px] lg:w-[280px]">
            <ProductCard product={{...p, badge: badgeType}} />
          </div>
        ))}
      </div>

      {/* Mobile "See all" link */}
      <div className="sm:hidden flex justify-center mt-4">
        <a href="#catalogue" className="flex items-center gap-1 text-primary-blue font-bold text-sm hover:underline">
          {language === 'fr' ? 'Voir tout le catalogue' : 'View full catalog'} <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};
