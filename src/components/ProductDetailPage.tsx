import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, ChevronRight, Truck, ShieldCheck, RotateCcw, 
  Heart, Share2, Plus, Minus, ShoppingCart, Zap, 
  X, Check, ExternalLink, MessageCircle, Copy
} from 'lucide-react';
import { useAppContext, Product, Review } from '../context/AppContext';
import { translations } from '../translations';
import { getPublicProductDetail, getSimilarProducts } from '../services/catalogueService';
import { getProductReviews, submitReview, voteHelpful } from '../services/reviewService';
import { PageLoader } from './LoadingComponents';
import { ProductCard } from './ProductSection';

interface ProductDetailPageProps {
  productId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
  const { addToCart, toggleWishlist, wishlist, language, user } = useAppContext();
  const t = translations[language];

  const [product, setProduct] = React.useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [activeImage, setActiveImage] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState<'description' | 'specs' | 'reviews'>('description');
  const [showZoom, setShowZoom] = React.useState(false);
  const [addedNotice, setAddedNotice] = React.useState(false);

  // States pour la gestion des avis
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = React.useState(0);
  const [reviewsPage, setReviewsPage] = React.useState(1);
  const [reviewsLimit] = React.useState(5);
  const [reviewsTotalPages, setReviewsTotalPages] = React.useState(1);
  const [ratingDistribution, setRatingDistribution] = React.useState<{ [key: number]: number }>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [reviewsLoading, setReviewsLoading] = React.useState(false);

  // States pour le formulaire modal d'avis
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [submitRating, setSubmitRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [submitTitle, setSubmitTitle] = React.useState('');
  const [submitBody, setSubmitBody] = React.useState('');
  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState<string | null>(null);

  const fetchReviews = React.useCallback(async (productSlug: string, page = 1) => {
    setReviewsLoading(true);
    try {
      const data = await getProductReviews(productSlug, page, reviewsLimit);
      setReviews(prev => page === 1 ? data.reviews : [...prev, ...data.reviews]);
      setReviewsTotal(data.total);
      setReviewsPage(data.page);
      setReviewsTotalPages(data.totalPages);
      setRatingDistribution(data.distribution);
    } catch (err) {
      console.error("Erreur chargement des avis:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [reviewsLimit]);

  const handleVoteHelpful = async (reviewId: number) => {
    try {
      const newVotes = await voteHelpful(reviewId);
      setReviews(prev => prev.map(r => r.id === String(reviewId) ? { ...r, helpfulVotes: newVotes } : r));
    } catch (err) {
      console.error("Erreur lors du vote utile:", err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (submitBody.trim().length < 10) {
      setSubmitError(language === 'fr' ? "L'avis doit contenir au moins 10 caractères." : "Review must be at least 10 characters.");
      return;
    }
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const res = await submitReview(Number(product.id), submitRating, submitTitle, submitBody);
      if (res.success) {
        setSubmitSuccess(res.message);
        setSubmitTitle('');
        setSubmitBody('');
        setSubmitRating(5);
        if (product.slug) {
          fetchReviews(product.slug, 1);
        }
        setTimeout(() => {
          setShowReviewModal(false);
          setSubmitSuccess(null);
        }, 2500);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || (language === 'fr' ? "Erreur lors de la soumission de l'avis." : "Error submitting review.");
      setSubmitError(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSeeMoreReviews = () => {
    if (product && reviewsPage < reviewsTotalPages) {
      fetchReviews(product.slug || product.id, reviewsPage + 1);
    }
  };

  React.useEffect(() => {
    let cancelled = false;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const prod = await getPublicProductDetail(productId);
        if (!cancelled) {
          setProduct(prod);
          setActiveImage(0);
          if (prod.slug) {
            fetchReviews(prod.slug, 1);
          }
          if (prod.variants && prod.variants.length > 0) {
            const firstInStock = prod.variants.find(v => v.isInStock) || prod.variants[0];
            if (firstInStock.color) setSelectedColor(firstInStock.color);
            if (firstInStock.size) setSelectedSize(firstInStock.size);
          } else {
            if (prod.variations?.colors?.[0]) setSelectedColor(prod.variations.colors[0].name);
            if (prod.variations?.sizes?.[0]) setSelectedSize(prod.variations.sizes[0]);
          }
          
          const similar = await getSimilarProducts(productId);
          if (!cancelled) {
            setSimilarProducts(similar);
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Impossible de charger les détails du produit.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return <PageLoader message="Chargement du produit..." />;
  }

  if (error || !product) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-display font-bold">{error || t.productNotFound}</h2>
        <button onClick={() => window.location.hash = 'catalogue'} className="text-primary-blue font-bold hover:underline">
          {t.backToCatalog}
        </button>
      </div>
    );
  }

  const isInWishlist = wishlist.some(item => item.id === product.id);

  const currentVariant = product.variants?.find(v => 
    (selectedColor ? v.color === selectedColor : true) && 
    (selectedSize ? v.size === selectedSize : true)
  ) ?? (
    // Fallback : produit sans couleur/taille → prendre la première variante dispo
    product.variants && product.variants.length > 0 && !product.variations?.colors?.length && !product.variations?.sizes?.length
      ? product.variants[0]
      : undefined
  );
  
  const displayStock = currentVariant ? currentVariant.stock : product.stock;
  const isLowStock = currentVariant ? currentVariant.isLowStock : (displayStock > 0 && displayStock < 10);
  const displayPrice = currentVariant?.effectivePrice || product.price;

  const handleAddToCart = () => {
    if (product.variations?.sizes && !selectedSize) return;
    setAddedNotice(true);
    addToCart(product, quantity, {
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      variantId: currentVariant?.id,
    });
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, {
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      variantId: currentVariant?.id,
    });
    window.location.hash = 'checkout';
  };

  const shareOnWhatsApp = () => {
    const text = `Découvre ce produit chez Donald Gros : ${product.name}\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add a toast here
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-medium-gray mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
        <a href="#" className="hover:text-primary-blue">{t.home}</a>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <a href="#catalogue" className="hover:text-primary-blue">{t.catalog}</a>
        <ChevronRight className="w-4 h-4 shrink-0" />
        <span className="text-dark-gray font-medium truncate">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10 xl:gap-20">
        {/* Left Column: Gallery */}
        <div className="lg:w-1/2 space-y-6">
          <div className="relative aspect-square bg-[#F3F4F6] rounded-2xl overflow-hidden group cursor-zoom-in" onClick={() => setShowZoom(true)}>
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded uppercase tracking-wider shadow-lg">
                {product.badge}
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary-blue ring-2 ring-primary-blue/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="lg:w-1/2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-primary-blue uppercase tracking-widest">{product.brand}</span>
              <span className="text-light-gray">|</span>
              <span className="text-medium-gray">REF: {product.id.toUpperCase()}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-display font-black text-dark-gray leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-light-gray'}`} />
                ))}
                <span className="ml-1 font-bold">{product.rating}</span>
              </div>
              <button 
                onClick={() => {
                  setActiveTab('reviews');
                  document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm text-primary-blue font-semibold hover:underline"
              >
                ({product.reviewsCount} {t.reviews})
              </button>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-6 bg-light-gray/20 rounded-2xl border border-light-gray/50 space-y-4">
            <div className="flex items-center gap-4">
              {product.originalPrice ? (
                <>
                  <span className="text-3xl md:text-4xl font-display font-black text-red-600">
                    {displayPrice.toLocaleString()} FCFA
                  </span>
                  <span className="text-lg text-medium-gray line-through">
                    {product.originalPrice.toLocaleString()} FCFA
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-black rounded">
                    -{Math.round((1 - displayPrice / product.originalPrice) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl md:text-4xl font-display font-black text-primary-blue">
                  {displayPrice.toLocaleString()} FCFA
                </span>
              )}
            </div>
            
            {product.originalPrice && (
              <div className="flex items-center gap-2 text-primary-green font-bold text-sm">
                <Zap className="w-4 h-4 fill-current" />
                {t.youSave} {(product.originalPrice - displayPrice).toLocaleString()} FCFA
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${displayStock > 0 ? 'bg-primary-green' : 'bg-red-500'} animate-pulse`} />
              <span className={`text-sm font-bold ${displayStock > 0 ? 'text-primary-green' : 'text-red-500'}`}>
                {displayStock > 0 ? `${t.inStock} (${displayStock} ${t.units})` : t.outOfStock}
              </span>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-6">
            {product.variations?.colors && product.variations.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-display font-bold text-dark-gray uppercase tracking-wider">{t.colorLabel} : <span className="text-medium-gray ml-2">{selectedColor}</span></span>
                </div>
                <div className="flex gap-3">
                  {product.variations.colors.map(color => {
                    const hasStockInColor = product.variants?.some(v => v.color === color.name && v.isInStock) ?? true;
                    return (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color.name);
                          const firstAvailableSize = product.variants?.find(v => v.color === color.name && v.isInStock)?.size;
                          if (firstAvailableSize) setSelectedSize(firstAvailableSize);
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${selectedColor === color.name ? 'border-primary-blue ring-2 ring-primary-blue/20' : 'border-transparent hover:border-light-gray'} ${!hasStockInColor ? 'opacity-50 grayscale' : ''}`}
                        title={color.name}
                      >
                        <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {product.variations?.sizes && product.variations.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-display font-bold text-dark-gray uppercase tracking-wider">{t.sizeLabel} : <span className="text-medium-gray ml-2">{selectedSize}</span></span>
                  <button className="text-xs text-primary-blue font-bold hover:underline">{t.sizeGuide}</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {product.variations.sizes.map(size => {
                    const variant = product.variants?.find(v => v.size === size && v.color === selectedColor);
                    const isInStock = variant ? variant.isInStock : true;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => isInStock && setSelectedSize(size)}
                        disabled={!isInStock}
                        className={`h-12 rounded-xl text-sm font-bold transition-all border-2 
                          ${!isInStock ? 'bg-light-gray/20 text-light-gray border-transparent cursor-not-allowed line-through' :
                            selectedSize === size ? 'bg-primary-blue border-primary-blue text-white shadow-lg' : 'bg-white border-light-gray text-dark-gray hover:border-primary-blue hover:text-primary-blue'}`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <span className="text-sm font-display font-bold text-dark-gray uppercase tracking-wider">{t.quantity}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-light-gray/50 rounded-xl p-1 border border-light-gray">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-dark-gray"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 bg-transparent text-center font-bold outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(prev => Math.min(displayStock, prev + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors text-dark-gray"
                    disabled={quantity >= displayStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {isLowStock && (
                  <span className="text-xs text-orange-500 font-bold">{t.only} {displayStock} {t.itemsLeft}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`h-14 rounded-xl font-display font-bold flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${addedNotice ? 'bg-primary-green text-white' : 'bg-primary-blue text-white hover:bg-dark-gray shadow-xl shadow-primary-blue/20'}`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-6 h-6" />
                  {t.addedToCartSuccess}
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  {t.addToCart}
                </>
              )}
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="h-14 bg-primary-green text-white rounded-xl font-display font-bold flex items-center justify-center gap-3 hover:bg-dark-gray transition-all shadow-xl shadow-primary-green/20"
            >
              <Zap className="w-6 h-6 fill-current" />
              {t.buyNow}
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className={`h-12 rounded-xl font-medium flex items-center justify-center gap-3 transition-all border-2 ${isInWishlist ? 'border-red-500 text-red-500 bg-red-50' : 'border-light-gray text-medium-gray hover:border-red-500 hover:text-red-500'}`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              {isInWishlist ? t.savedInWishlist : t.addWishlist}
            </button>
          </div>

          {/* Reassurance Block */}
          <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-light-gray space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Truck className="w-5 h-5 text-primary-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-dark-gray font-bold">{t.freeDelivery}</p>
                  <p className="text-xs text-medium-gray">{t.everywhereCameroonShort}</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-primary-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-dark-gray font-bold">{t.securePayment}</p>
                  <p className="text-xs text-medium-gray">MTN MoMo, Orange Money & Cash delivery</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <RotateCcw className="w-5 h-5 text-medium-gray" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-dark-gray font-bold">{t.easyReturn}</p>
                  <p className="text-xs text-medium-gray">{t.exchangesAccepted}</p>
                </div>
             </div>
          </div>

          {/* Share */}
          <div className="flex items-center gap-6 pt-4">
            <span className="text-sm font-bold text-medium-gray uppercase tracking-widest">{t.share} :</span>
            <div className="flex gap-4">
              <button 
                onClick={shareOnWhatsApp}
                className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-[#1877F2] text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={copyLink}
                className="w-10 h-10 bg-dark-gray text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-black/20"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div id="product-tabs" className="mt-20 border-t border-light-gray pt-10">
        <div className="flex items-center gap-10 border-b border-light-gray mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'description', label: t.description },
            { id: 'specs', label: t.specs },
            { id: 'reviews', label: `${language === 'fr' ? 'Avis Clients' : 'Customer Reviews'} (${product.reviewsCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm md:text-base font-display font-bold transition-all relative ${activeTab === tab.id ? 'text-primary-blue' : 'text-medium-gray hover:text-dark-gray'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-blue rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div 
                key="desc"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl"
              >
                <p className="text-lg text-medium-gray leading-relaxed font-sans">
                  {product.description}
                </p>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-display font-bold text-primary-blue mb-3">{t.whyChooseProduct}</h4>
                    <ul className="space-y-2">
                       <li className="flex gap-2 text-sm text-medium-gray"><Check className="w-4 h-4 text-primary-green shrink-0" /> {language === 'fr' ? 'Confort premium garanti' : 'Guaranteed premium comfort'}</li>
                       <li className="flex gap-2 text-sm text-medium-gray"><Check className="w-4 h-4 text-primary-green shrink-0" /> {language === 'fr' ? 'Design exclusif Donald Gros' : 'Exclusive Donald Gros design'}</li>
                       <li className="flex gap-2 text-sm text-medium-gray"><Check className="w-4 h-4 text-primary-green shrink-0" /> {language === 'fr' ? 'Matériaux durables de haute qualité' : 'High quality durable materials'}</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div 
                key="specs"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl"
              >
                <div className="border border-light-gray rounded-2xl overflow-hidden shadow-sm">
                  {Object.entries(product.specifications).map(([key, value], i) => (
                    <div key={key} className={`flex p-4 border-b last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-light-gray/20'}`}>
                      <span className="w-1/3 font-bold text-dark-gray">{key}</span>
                      <span className="flex-1 text-medium-gray">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div 
                key="reviews"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="flex flex-col md:flex-row gap-10 bg-[#F9FAFB] p-8 rounded-3xl border border-light-gray">
                  <div className="text-center md:text-left flex flex-col items-center md:items-start justify-center pr-10 md:border-r border-light-gray">
                    <h4 className="text-7xl font-display font-black text-primary-blue mb-2">{product.rating || '0'}</h4>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-light-gray'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-medium-gray font-medium">{t.basedOn} {reviewsTotal} {t.verifiedReviews}</p>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = ratingDistribution[star] || 0;
                      const percentage = reviewsTotal > 0 ? (count / reviewsTotal) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-4 text-sm font-bold">
                          <span className="w-16 whitespace-nowrap">{star} {t.stars}</span>
                          <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-light-gray">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1 }}
                              className="h-full bg-primary-blue"
                            />
                          </div>
                          <span className="w-10 text-right opacity-50">{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-center">
                    <button 
                      onClick={() => {
                        if (!user) {
                          alert(language === 'fr' ? "Vous devez être connecté pour laisser un avis." : "You must be logged in to leave a review.");
                        } else {
                          setShowReviewModal(true);
                        }
                      }}
                      className="px-8 h-14 bg-primary-blue text-white rounded-xl font-display font-bold shadow-xl hover:bg-dark-gray transition-all"
                    >
                      {t.leaveReview}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center bg-white border border-light-gray rounded-2xl">
                      <Star className="w-10 h-10 text-light-gray mx-auto mb-3" />
                      <p className="text-sm text-medium-gray font-medium italic">
                        {language === 'fr' ? "Aucun avis publié pour ce produit. Soyez le premier à donner votre avis !" : "No published reviews for this product. Be the first to leave a review!"}
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-6 bg-white border border-light-gray rounded-2xl space-y-4 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center font-bold">
                              {review.userName ? review.userName[0].toUpperCase() : 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-dark-gray">
                                {review.userName}{' '}
                                {review.isVerifiedPurchase && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-50 text-primary-green text-[10px] rounded border border-green-200">
                                    {t.verifiedPurchase}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-medium-gray">{review.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`w-3.5 h-3.5 ${j < review.rating ? 'text-yellow-400 fill-current' : 'text-light-gray'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-bold text-dark-gray">{review.title}</h5>
                          <p className="text-sm text-medium-gray leading-relaxed">{review.text || review.comment}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-light-gray/30">
                            <p className="text-xs text-light-gray italic">
                              {review.purchasedVariant ? `${language === 'fr' ? 'Option achetée' : 'Option purchased'} : ${review.purchasedVariant}` : ''}
                            </p>
                            <button
                              onClick={() => handleVoteHelpful(Number(review.id))}
                              className="flex items-center gap-1.5 px-3 py-1 bg-light-gray/20 hover:bg-light-gray/40 text-[10px] font-bold text-medium-gray rounded-full transition-all"
                            >
                              <span>{language === 'fr' ? 'Utile' : 'Helpful'} ({review.helpfulVotes || 0})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {reviewsPage < reviewsTotalPages && (
                    <button 
                      onClick={handleSeeMoreReviews}
                      disabled={reviewsLoading}
                      className="w-full h-12 border-2 border-light-gray rounded-xl text-dark-gray font-bold hover:bg-light-gray transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {reviewsLoading ? '...' : t.seeMoreReviews}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="mt-20 space-y-10">
         <h2 className="text-2xl md:text-3xl font-display font-black text-dark-gray">{t.youMightAlsoLike}</h2>
         <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {similarProducts.length > 0 ? (
              similarProducts.map((p) => (
                <div key={p.id} className="min-w-[240px] md:min-w-[280px] snap-start shrink-0">
                  <ProductCard product={p} />
                </div>
              ))
            ) : (
              <p className="text-sm text-medium-gray italic">{language === 'fr' ? 'Aucun produit similaire trouvé' : 'No similar products found'}</p>
            )}
         </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setShowZoom(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl max-h-[80vh] w-full h-full">
              <img src={product.images[activeImage]} className="w-full h-full object-contain" alt="" />
            </div>
            
            <div className="mt-10 flex gap-4 overflow-x-auto max-w-full no-scrollbar">
              {product.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-primary-blue' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Soumission d'Avis */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Arrière-plan flou */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitLoading && setShowReviewModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Carte du formulaire */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-light-gray overflow-hidden z-10"
            >
              <button
                disabled={submitLoading}
                onClick={() => setShowReviewModal(false)}
                className="absolute top-6 right-6 p-2 bg-light-gray/50 hover:bg-light-gray rounded-full text-dark-gray transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter mb-1">
                {language === 'fr' ? 'Laisser un avis' : 'Leave a review'}
              </h3>
              <p className="text-xs text-medium-gray font-medium mb-6">
                {language === 'fr' ? `Partagez votre expérience sur ${product.name}` : `Share your experience on ${product.name}`}
              </p>

              {submitSuccess ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 bg-green-50 border border-green-200 text-primary-green rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-dark-gray">
                    {language === 'fr' ? 'Merci pour votre avis !' : 'Thank you for your review!'}
                  </h4>
                  <p className="text-sm text-medium-gray px-4">
                    {submitSuccess}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-bold">
                      {submitError}
                    </div>
                  )}

                  {/* Étoiles interactives */}
                  <div className="text-center space-y-2">
                    <label className="text-xs font-bold text-medium-gray uppercase tracking-wider block">
                      {language === 'fr' ? 'Note globale' : 'Overall rating'}
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          disabled={submitLoading}
                          onClick={() => setSubmitRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                        >
                          <Star
                            className={`w-10 h-10 transition-all ${
                              star <= (hoverRating ?? submitRating)
                                ? 'text-yellow-400 fill-current scale-105'
                                : 'text-light-gray'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Titre */}
                  <div className="space-y-1.5">
                    <label htmlFor="review-title" className="text-xs font-bold text-medium-gray uppercase tracking-wider">
                      {language === 'fr' ? "Titre de l'avis (optionnel)" : "Review title (optional)"}
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      maxLength={150}
                      disabled={submitLoading}
                      value={submitTitle}
                      onChange={(e) => setSubmitTitle(e.target.value)}
                      placeholder={language === 'fr' ? "Ex: Très satisfait, Excellent produit..." : "Ex: Great quality, highly recommend..."}
                      className="w-full h-12 px-4 rounded-xl border border-light-gray focus:outline-none focus:border-primary-blue text-sm"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="review-body" className="text-xs font-bold text-medium-gray uppercase tracking-wider">
                      {language === 'fr' ? "Votre avis (10 caractères min.)" : "Your review (10 chars min.)"}
                    </label>
                    <textarea
                      id="review-body"
                      required
                      minLength={10}
                      maxLength={2000}
                      disabled={submitLoading}
                      rows={4}
                      value={submitBody}
                      onChange={(e) => setSubmitBody(e.target.value)}
                      placeholder={language === 'fr' ? "Rédigez votre avis ici. Décrivez la qualité du produit, la livraison..." : "Write your review here. Describe product quality, delivery..."}
                      className="w-full p-4 rounded-xl border border-light-gray focus:outline-none focus:border-primary-blue text-sm resize-none"
                    />
                  </div>

                  {/* Bouton Envoyer */}
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="w-full h-14 bg-primary-blue text-white rounded-xl font-display font-bold shadow-xl shadow-primary-blue/20 hover:bg-dark-gray transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitLoading ? '...' : (language === 'fr' ? 'Soumettre mon avis' : 'Submit my review')}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
