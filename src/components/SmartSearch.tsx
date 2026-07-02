import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ShoppingBag, ArrowUpRight, Clock, Star, History, TrendingUp, Tag } from 'lucide-react';
import { useAppContext, Product } from '../context/AppContext';

interface SmartSearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({ 
  placeholder = "Rechercher...", 
  className = "",
  onSearch,
  initialValue = "",
  autoFocus = false
}) => {
  const { products } = useAppContext();
  const [query, setQuery] = React.useState(initialValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Product[]>([]);
  const [categorySuggestions, setCategorySuggestions] = React.useState<string[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Mock history for "intelligence"
  const recentSearches = ['Nike Air Max', 'Réfrigérateur Samsung', 'Chemise blanche'];

  React.useEffect(() => {
    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();
      
      // Smart fuzzy-like matching
      const matches = products.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) || 
        p.brand.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);

      // Category matching
      const cats = (Array.from(new Set(products.map(p => p.category))) as string[])
        .filter(c => c.toLowerCase().includes(lowerQuery));

      setSuggestions(matches);
      setCategorySuggestions(cats);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setCategorySuggestions([]);
      setIsOpen(query.length > 0);
    }
  }, [query, products]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExecuteSearch = (q: string) => {
    setQuery(q);
    setIsOpen(false);
    if (onSearch) {
      onSearch(q);
    } else {
      window.location.hash = `catalogue?q=${encodeURIComponent(q)}`;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors ${isOpen ? 'text-primary-blue' : 'text-medium-gray group-focus-within:text-primary-blue'}`} />
        </div>
        <input
          autoFocus={autoFocus}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(query.length > 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleExecuteSearch(query);
            if (e.key === 'Escape') setIsOpen(false);
          }}
          placeholder={placeholder}
          className="w-full h-11 md:h-12 pl-12 pr-12 rounded-full border border-light-gray focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10 outline-none text-[15px] font-medium transition-all bg-white group-hover:border-medium-gray/30"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-14 text-medium-gray hover:text-dark-gray transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={() => handleExecuteSearch(query)}
          className="absolute right-0 top-0 bottom-0 px-5 bg-gradient-to-tr from-primary-blue to-[#2563EB] text-white rounded-r-full font-display font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <span className="hidden md:inline">TROUVER</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-[200] max-h-[80vh] flex flex-col md:flex-row"
          >
            {/* Left Column: Suggestions & Categories */}
            <div className="w-full md:w-1/3 p-4 border-b md:border-b-0 md:border-r border-light-gray space-y-6 bg-light-gray/5">
              {categorySuggestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-medium-gray flex items-center gap-2">
                    <Tag className="w-3 h-3" /> Rayons suggérés
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categorySuggestions.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => {
                          window.location.hash = `catalogue?category=${cat}`;
                          setIsOpen(false);
                        }}
                        className="px-3 py-1.5 bg-white border border-light-gray rounded-lg text-xs font-bold text-dark-gray hover:border-primary-blue hover:text-primary-blue transition-all"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-medium-gray flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Tendances
                </p>
                <div className="space-y-1">
                  {recentSearches.map(term => (
                    <button 
                      key={term}
                      onClick={() => handleExecuteSearch(term)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-dark-gray hover:bg-white hover:text-primary-blue rounded-xl transition-all group"
                    >
                      <Clock className="w-4 h-4 text-medium-gray group-hover:text-primary-blue" />
                      <span className="font-medium">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Key Products Matching */}
            <div className="flex-1 p-4 md:p-6 bg-white min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-medium-gray">Produits correspondants</p>
                <button 
                  onClick={() => handleExecuteSearch(query)}
                  className="text-[10px] font-black text-primary-blue hover:underline"
                >
                  VOIR TOUT ({products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).length})
                </button>
              </div>

              {suggestions.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Search className="w-12 h-12 text-light-gray mx-auto" />
                  <p className="text-sm text-medium-gray italic font-medium">Hmm, rien ne correspond exactement à "{query}"...<br/>Essayez avec d'autres mots-clés !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map(p => (
                    <motion.div
                      key={p.id}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        window.location.hash = `produits/${p.slug || p.id}`;
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary-blue/5 cursor-pointer transition-all border border-transparent hover:border-primary-blue/10"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-light-gray border border-light-gray/50 shrink-0 shadow-sm">
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black bg-primary-blue/10 text-primary-blue px-1.5 py-0.5 rounded leading-none uppercase">{p.brand}</span>
                          <span className="text-[9px] font-bold text-medium-gray uppercase tracking-tighter">{p.category}</span>
                        </div>
                        <h4 className="font-bold text-dark-gray truncate">{p.name}</h4>
                        <div className="flex items-center gap-2 pt-1">
                          <p className="font-black text-primary-blue text-sm">{p.price.toLocaleString()} F</p>
                          <div className="flex gap-0.5 ml-auto">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < Math.floor(p.rating) ? 'text-yellow-400 fill-current' : 'text-light-gray'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-medium-gray group-hover:text-primary-blue">
                         <ShoppingBag className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
