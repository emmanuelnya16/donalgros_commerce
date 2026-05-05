import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, SlidersHorizontal, Grid, List as ListIcon, X, Star, Filter, Heart } from 'lucide-react';
import { useAppContext, Product } from '../context/AppContext';
import { ProductCard } from './ProductSection';
import { SmartSearch } from './SmartSearch';
import { translations } from '../translations';

const CATEGORIES = [
  { id: 'homme', title: 'HOMME', count: 124, image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop', width: 'lg:w-[55%]' },
  { id: 'femme', title: 'FEMME', count: 98, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop', width: 'lg:w-[45%]' },
  { id: 'chaussures', title: 'CHAUSSURES', count: 156, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', width: 'lg:w-[40%]' },
  { id: 'electromenager', title: 'ELECTROMENAGER', count: 85, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop', width: 'lg:w-[60%]' },
];

const QUICK_TAGS = ['Chemises homme', 'Robes été', 'Nike Air', 'Réfrigérateur', 'Jeans', 'Sneakers', 'Pantalons', 'Vibrato'];

export const CataloguePage = () => {
  const { toggleWishlist, wishlist, products: MOCK_ALL_PRODUCTS, addToCart, language } = useAppContext();
  const t = translations[language];
  
  // Read initial states from URL
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return params.get('category') || null;
  });
  const [searchQuery, setSearchQuery] = React.useState(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    return params.get('q') || '';
  });

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [priceRange, setPriceRange] = React.useState([0, 500000]);
  const [compareItems, setCompareItems] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState('pertinence');
  const [activeTab, setActiveTab] = React.useState(language === 'fr' ? 'Tous' : 'All');
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>([]);

  React.useEffect(() => {
    const handleHashChange = () => {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const q = params.get('q');
      const cat = params.get('category');
      if (q !== null) setSearchQuery(q);
      if (cat !== null) setSelectedCategory(cat);
      if (!cat && !q && window.location.hash === '#catalogue') {
        setSelectedCategory(null);
        setSearchQuery('');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const filteredProducts = React.useMemo(() => {
    let result = MOCK_ALL_PRODUCTS.filter(p => {
      // Category filter (if not in catalog overview)
      if (selectedCategory && p.category !== selectedCategory) return false;
      
      // Price filter
      if (p.price > priceRange[1]) return false;
      
      // Search filter
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

      // Tab filters (Sub-nav)
      const isAll = activeTab === 'Tous' || activeTab === 'All';
      if (!isAll) {
        if ((activeTab === 'Nouveautés' || activeTab === 'New') && p.id !== 'c1') return false; 
        if ((activeTab === 'Premium') && p.price < 50000) return false;
        if ((activeTab === 'Soldes' || activeTab === 'Sale' || activeTab === 'Deals') && !p.originalPrice) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'prix-croissant' || sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'prix-decroissant' || sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'nouveautes' || sortBy === 'newest') result.sort((a, b) => b.id.localeCompare(a.id));

    return result;
  }, [selectedCategory, priceRange, searchQuery, selectedBrands, sortBy, activeTab, MOCK_ALL_PRODUCTS]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const toggleCompare = (id: string) => {
    setCompareItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id);
    setSearchQuery(''); // Clear search when picking explicit category
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedCategory && !searchQuery) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-medium-gray mb-6">
          <button onClick={() => window.location.hash = ''} className="text-primary-blue hover:underline">{t.home}</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark-gray font-medium">{t.catalog}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-black text-dark-gray mb-2">{t.ourCatalog}</h1>
        <p className="text-medium-gray mb-10">{t.discoverSelection}</p>

        {/* Asymmetric Categories Grid */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[300px]">
             <CategoryCard cat={CATEGORIES[0]} onClick={() => handleCategoryClick(CATEGORIES[0].id)} className="lg:w-[55%]" />
             <CategoryCard cat={CATEGORIES[1]} onClick={() => handleCategoryClick(CATEGORIES[1].id)} className="lg:w-[45%]" />
          </div>
          <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[260px]">
             <CategoryCard cat={CATEGORIES[2]} onClick={() => handleCategoryClick(CATEGORIES[2].id)} className="lg:w-[40%]" />
             <CategoryCard cat={CATEGORIES[3]} onClick={() => handleCategoryClick(CATEGORIES[3].id)} className="lg:w-[60%]" />
          </div>
        </div>

        {/* Big Search Bar */}
        <div className="mb-12">
            <SmartSearch 
              initialValue={searchQuery}
              onSearch={(q) => setSearchQuery(q)}
              placeholder={t.searchCatalog}
              className="mb-4"
            />
           {/* Quick Tags */}
           <div className="flex flex-wrap gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
              {QUICK_TAGS.map(tag => (
                <button key={tag} className="px-4 py-1.5 bg-light-gray/50 hover:bg-primary-blue/10 text-dark-gray rounded-full text-xs font-medium transition-colors shrink-0">
                  {tag}
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  // Category view (Product Listing)
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 relative">
      {/* Compare Floating Bar */}
      <AnimatePresence>
        {compareItems.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-2xl shadow-2xl border border-light-gray p-4 flex items-center gap-6 max-w-full overflow-x-auto"
          >
             <div className="flex -space-x-4">
                {compareItems.map(id => (
                   <div key={id} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-light-gray relative group">
                      <img src={MOCK_ALL_PRODUCTS.find(p => p.id === id)?.image} className="w-full h-full object-cover" alt="" />
                      <button 
                        onClick={() => toggleCompare(id)}
                        className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <X className="w-4 h-4" />
                      </button>
                   </div>
                ))}
             </div>
             <div className="shrink-0">
                <p className="text-xs font-bold text-dark-gray">{compareItems.length} {t.productsComparing}</p>
                <button 
                  disabled={compareItems.length < 2}
                  className="text-sm font-black text-primary-blue disabled:opacity-50 hover:underline"
                >
                  {t.compareNow}
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Banner/Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-medium-gray mb-4">
          <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="hover:text-primary-blue">{t.home}</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className="hover:text-primary-blue">{t.catalog}</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-dark-gray font-semibold capitalize">{selectedCategory || (searchQuery ? `${t.resultsFor} "${searchQuery}"` : '')}</span>
        </div>
        
        {selectedCategory && (
          <div className="relative h-20 md:h-32 rounded-2xl overflow-hidden mb-6 group">
             <img 
               src={CATEGORIES.find(c => c.id === selectedCategory)?.image} 
               className="w-full h-full object-cover brightness-50 group-hover:scale-105 transition-transform duration-700" 
               alt=""
             />
             <div className="absolute inset-0 flex items-center justify-between px-8">
                <div>
                  <h1 className="text-2xl md:text-4xl font-display font-black text-white uppercase">{selectedCategory}</h1>
                  <p className="text-white/70 text-xs md:text-sm">{CATEGORIES.find(c => c.id === selectedCategory)?.count} {language === 'fr' ? 'produits disponibles' : 'products available'}</p>
                </div>
             </div>
          </div>
        )}

        {!selectedCategory && searchQuery && (
           <div className="mb-8 p-8 bg-primary-blue/5 rounded-2xl border-2 border-dashed border-primary-blue/20">
              <h1 className="text-2xl font-display font-black text-dark-gray">{t.resultsFor} : <span className="text-primary-blue">"{searchQuery}"</span></h1>
              <p className="text-medium-gray">{t.matchFound} {filteredProducts.length} {t.productsFoundShort}</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-sm text-primary-blue font-bold flex items-center gap-1 hover:underline"
              >
                 <X className="w-4 h-4" /> {language === 'fr' ? 'Annuler la recherche' : 'Cancel search'}
              </button>
           </div>
        )}

        {/* Global Search bar (always visible in listing) */}
        <div className="mb-6 max-w-2xl">
           <SmartSearch 
             initialValue={searchQuery}
             onSearch={(q) => setSearchQuery(q)}
             placeholder={t.refineSearch}
           />
        </div>

        {/* Sub-nav pills */}
        <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar">
           {(language === 'fr' ? ['Tous', 'Nouveautés', 'Premium', 'Soldes', 'Tendances'] : ['All', 'Newest', 'Premium', 'Sale', 'Trends']).map((pill) => (
             <button 
                key={pill} 
                onClick={() => setActiveTab(pill)}
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === pill ? 'bg-primary-blue text-white shadow-lg' : 'bg-light-gray hover:bg-white border border-transparent hover:border-primary-blue'}`}
             >
               {pill}
             </button>
           ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-24 h-fit">
           <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">{t.filters}</h3>
              <button 
                onClick={() => {
                  setPriceRange([0, 500000]);
                  setSelectedBrands([]);
                  setSearchQuery('');
                  setActiveTab(language === 'fr' ? 'Tous' : 'All');
                }}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                {t.reset}
              </button>
           </div>
           
           {/* Price Section */}
           <FilterSection title={t.price}>
              <div className="pt-2">
                 <input 
                   type="range" 
                   min="0" 
                   max="500000" 
                   step="1000"
                   className="w-full accent-primary-blue"
                   onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                 />
                 <div className="flex justify-between mt-2 text-xs font-bold text-medium-gray">
                   <span>0 FCFA</span>
                   <span className="text-primary-blue">{priceRange[1].toLocaleString()} FCFA</span>
                 </div>
              </div>
           </FilterSection>

           {/* Size Section */}
           {selectedCategory !== 'electromenager' && (
             <FilterSection title={t.size}>
                <div className="grid grid-cols-3 gap-2">
                   {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                     <button key={size} className="h-10 border border-light-gray rounded-lg text-sm font-bold hover:border-primary-blue hover:text-primary-blue transition-all">
                       {size}
                     </button>
                   ))}
                </div>
             </FilterSection>
           )}

           {/* Color Section */}
           <FilterSection title={t.color}>
              <div className="flex flex-wrap gap-3">
                 {['#000000', '#FFFFFF', '#1A56DB', '#EF4444', '#10B981', '#F59E0B'].map(color => (
                    <button 
                      key={color} 
                      className="w-8 h-8 rounded-full border border-light-gray ring-2 ring-transparent hover:ring-primary-blue transition-all"
                      style={{ backgroundColor: color }}
                    />
                 ))}
              </div>
           </FilterSection>

           {/* Brand Section */}
           <FilterSection title={t.brand}>
              <div className="space-y-3">
                 {['Donald Gros', 'Nike', 'Adidas', 'Massimo Dutti', 'Zara', 'Samsung', 'LG'].map(brand => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                       <input 
                         type="checkbox" 
                         checked={selectedBrands.includes(brand)}
                         onChange={() => toggleBrand(brand)}
                         className="w-4 h-4 rounded border-light-gray text-primary-blue focus:ring-primary-blue" 
                       />
                       <span className="text-sm font-medium text-dark-gray group-hover:text-primary-blue">{brand}</span>
                    </label>
                 ))}
              </div>
           </FilterSection>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-light-gray/30 p-4 rounded-xl border border-light-gray">
             <span className="text-sm font-medium text-medium-gray">{filteredProducts.length} {t.foundTotal}</span>
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <span className="text-sm text-medium-gray">{t.sortBy}</span>
                   <select 
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                   >
                      <option value="pertinence">{t.relevance}</option>
                      <option value="prix-croissant">{t.priceAsc}</option>
                      <option value="prix-decroissant">{t.priceDesc}</option>
                      <option value="nouveautes">{language === 'fr' ? 'Nouveautés' : 'Newest'}</option>
                   </select>
                </div>
                <div className="flex bg-white rounded-lg p-1 border border-light-gray">
                   <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-blue text-white shadow-sm' : 'text-medium-gray hover:text-dark-gray'}`}>
                      <Grid className="w-4 h-4" />
                   </button>
                   <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-blue text-white shadow-sm' : 'text-medium-gray hover:text-dark-gray'}`}>
                      <ListIcon className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>

          {/* Product Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-10 xl:gap-12">
              {filteredProducts.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onCompare={toggleCompare}
                  isComparing={compareItems.includes(p.id)}
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center">
                   <p className="text-lg text-medium-gray">{t.noMatch}</p>
                   <button 
                     onClick={() => {
                        setSelectedBrands([]);
                        setPriceRange([0, 500000]);
                        setSearchQuery('');
                        setActiveTab(language === 'fr' ? 'Tous' : 'All');
                     }} 
                     className="mt-4 text-primary-blue font-bold hover:underline"
                   >
                     {t.resetFilters}
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {filteredProducts.map(p => {
                const isInWishlist = wishlist.some(item => item.id === p.id);
                return (
                  <motion.div 
                    layout
                    key={p.id} 
                    className="bg-white border border-light-gray rounded-xl overflow-hidden flex flex-col sm:flex-row hover:shadow-xl transition-shadow group relative"
                  >
                    <div className="w-full sm:w-48 h-48 bg-light-gray shrink-0 overflow-hidden relative">
                      <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {p.badge && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {p.badge}
                        </span>
                      )}
                      {/* Comparison Checkbox in List View */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                         <input 
                           type="checkbox" 
                           checked={compareItems.includes(p.id)}
                           onChange={() => toggleCompare(p.id)}
                           className="w-5 h-5 rounded border-white text-primary-blue focus:ring-primary-blue shadow-lg"
                         />
                         <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                            className={`w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all shadow-md ${isInWishlist ? 'text-red-500' : 'text-medium-gray hover:text-red-500'}`}
                          >
                            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                          </button>
                      </div>
                    </div>
                  <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                     <div className="flex-1">
                        <p className="text-xs text-medium-gray mb-1">{p.brand}</p>
                        <h3 className="font-display font-bold text-lg mb-2">{p.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                           <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`w-3 h-3 ${i < Math.floor(p.rating) ? 'text-yellow-400 fill-current' : 'text-light-gray'}`} />
                              ))}
                           </div>
                           <span className="text-xs text-medium-gray">({p.reviewsCount} avis)</span>
                        </div>
                        <p className="text-sm text-medium-gray line-clamp-2 max-w-md">{language === 'fr' ? 'Une description détaillée du produit qui met en avant ses caractéristiques principales et son style exceptionnel.' : 'A detailed description of the product that highlights its main characteristics and exceptional style.'}</p>
                     </div>
                     <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-light-gray pt-4 md:pt-0 md:pl-6">
                        <div className="text-right">
                           {p.originalPrice && <p className="text-sm text-medium-gray line-through">{p.originalPrice.toLocaleString()} FCFA</p>}
                           <p className="text-2xl font-display font-black text-primary-blue mb-2">{p.price.toLocaleString()} FCFA</p>
                           <div className="flex items-center justify-end gap-2">
                             <span className={`text-[10px] font-bold uppercase tracking-widest ${p.stock > 0 ? 'text-primary-green' : 'text-red-500'}`}>
                                {p.stock > 0 ? `${p.stock} ${language === 'fr' ? 'en Stock' : 'in Stock'}` : (language === 'fr' ? 'Indisponible' : 'Unavailable')}
                             </span>
                             <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-primary-green' : 'bg-red-500'}`} />
                           </div>
                        </div>
                        <div className="w-full space-y-2 mt-4">
                           <button 
                             onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                             className="w-full h-11 bg-primary-blue text-white font-bold rounded-lg hover:bg-dark-gray transition-colors"
                           >
                            {t.addToCart}
                           </button>
                           <button 
                             onClick={() => window.location.hash = `product/${p.id}`}
                             className="w-full h-11 border border-primary-blue text-primary-blue font-bold rounded-lg hover:bg-primary-blue hover:text-white transition-all"
                           >
                            {language === 'fr' ? 'Détails' : 'Details'}
                           </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-12 flex flex-col items-center gap-6">
             <div className="flex items-center gap-2">
                {[1, 2, 3, '...', 8].map((page, i) => (
                   <button 
                     key={i} 
                     className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${page === 1 ? 'bg-primary-blue text-white shadow-lg' : 'hover:bg-light-gray text-medium-gray'}`}
                   >
                     {page}
                   </button>
                ))}
             </div>
             <p className="text-sm text-medium-gray">Affichage de 1 à 20 sur 124 produits</p>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sticky Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
         <button 
           onClick={() => setIsMobileFilterOpen(true)}
           className="h-14 px-8 bg-primary-blue text-white rounded-full shadow-2xl flex items-center gap-3 font-display font-bold whitespace-nowrap active:scale-95 transition-all"
         >
           <SlidersHorizontal className="w-5 h-5" />
           FILTRER ET TRIER
         </button>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[32px] z-[101] h-[90vh] overflow-hidden flex flex-col"
            >
               <div className="p-4 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-light-gray rounded-full" />
               </div>
               <div className="px-6 flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-black">Filtres</h3>
                  <button className="text-red-500 font-bold" onClick={() => setIsMobileFilterOpen(false)}><X className="w-6 h-6" /></button>
               </div>
               <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8">
                  {/* Reuse filter sections here but larger for mobile */}
                  <FilterSection title="VUE">
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setViewMode('grid')} className={`h-12 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${viewMode === 'grid' ? 'bg-primary-blue text-white border-primary-blue' : 'border-light-gray'}`}><Grid className="w-5 h-5"/> Grille</button>
                       <button onClick={() => setViewMode('list')} className={`h-12 rounded-xl flex items-center justify-center gap-2 font-bold border-2 transition-all ${viewMode === 'list' ? 'bg-primary-blue text-white border-primary-blue' : 'border-light-gray'}`}><ListIcon className="w-5 h-5"/> Liste</button>
                    </div>
                  </FilterSection>
                  <FilterSection title="TRIER PAR">
                    <div className="space-y-4">
                       {['Pertinence', 'Prix croissant', 'Prix décroissant', 'Mieux notés'].map(opt => (
                         <label key={opt} className="flex items-center justify-between p-4 bg-light-gray/30 rounded-xl">
                            <span className="font-bold">{opt}</span>
                            <input type="radio" name="sort" className="w-5 h-5 accent-primary-blue" />
                         </label>
                       ))}
                    </div>
                  </FilterSection>
                  {/* More filters... */}
               </div>
               <div className="p-6 bg-white border-t absolute bottom-0 inset-x-0">
                  <button onClick={() => setIsMobileFilterOpen(false)} className="w-full h-14 bg-primary-blue text-white font-display font-bold rounded-xl shadow-xl">
                    VOIR LES RÉSULTATS
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryCard: React.FC<{ cat: any, onClick: () => void, className?: string }> = ({ cat, onClick, className }) => {
  const { language } = useAppContext();
  
  return (
  <motion.div 
    onClick={onClick}
    className={`relative ${className || ''} ${cat.width || ''} h-64 lg:h-full rounded-2xl overflow-hidden cursor-pointer group`}
    whileHover={{ scale: 0.99 }}
  >
    <img 
      src={cat.image} 
      loading="lazy"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
      alt={cat.title} 
    />
    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
    <div className="absolute bottom-8 left-8 text-white">
      <h3 className="text-2xl md:text-3xl font-display font-black mb-1">{cat.title}</h3>
      <p className="text-white/70 text-sm mb-4 font-sans">{cat.count} {language === 'fr' ? 'produits' : 'products'}</p>
      <button className="px-6 py-2 border border-white/50 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-bold group-hover:bg-white group-hover:text-primary-blue transition-all">
        {language === 'fr' ? 'Explorer' : 'Explore'}
      </button>
    </div>
    <div className="absolute inset-0 border-0 group-hover:border-[4px] border-white/30 rounded-2xl transition-all duration-300" />
  </motion.div>
);
};

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="border-b border-light-gray pb-6">
    <button className="flex items-center justify-between w-full mb-4 text-left">
      <span className="text-xs font-display font-black text-dark-gray tracking-widest">{title}</span>
      <ChevronRight className="w-4 h-4 text-medium-gray rotate-90" />
    </button>
    {children}
  </div>
);
