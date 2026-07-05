import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon,
  Tag,
  Save,
  Check,
  Star,
  Layers,
  Sparkles,
  Archive,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { useAppContext, Product } from '../../context/AppContext';
import {
  getAdminProducts,
  getAdminProductDetail,
  createAdminProduct,
  updateAdminProduct,
  archiveAdminProduct,
  publishAdminProduct,
  uploadProductImage,
  setMainProductImage,
  deleteProductImage,
  reorderProductImages,
  getAdminCategories,
  getPublicCategories,
  ProductPayload
} from '../../services/catalogueService';

interface AdminVariant {
  id?: number;
  size?: string;
  color?: string;
  colorHex?: string;
  stock?: number;
  alertThreshold?: number;
  extraPrice?: number;
  sku?: string;
  isActive?: boolean;
}

interface AdminProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

export const AdminCatalog = () => {
  const { refreshCatalog } = useAppContext();
  const [productList, setProductList] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Tous');
  const [selectedStock, setSelectedStock] = React.useState('Tous');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [activeFormTab, setActiveFormTab] = React.useState<'general' | 'variants' | 'images'>('general');
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form Fields State
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [shortDescription, setShortDescription] = React.useState('');
  const [longDescription, setLongDescription] = React.useState('');
  const [basePrice, setBasePrice] = React.useState<number>(0);
  const [promoPrice, setPromoPrice] = React.useState<number | null>(null);
  const [promoStartsAt, setPromoStartsAt] = React.useState('');
  const [promoEndsAt, setPromoEndsAt] = React.useState('');
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [categoryId, setCategoryId] = React.useState<number>(0);
  const [status, setStatus] = React.useState<'active' | 'draft' | 'archived'>('active');
  
  // Variants State
  const [variantsList, setVariantsList] = React.useState<AdminVariant[]>([]);
  // Temp New Variant State
  const [newVarSize, setNewVarSize] = React.useState('');
  const [newVarColor, setNewVarColor] = React.useState('');
  const [newVarColorHex, setNewVarColorHex] = React.useState('#000000');
  const [newVarStock, setNewVarStock] = React.useState<number>(10);
  const [newVarExtraPrice, setNewVarExtraPrice] = React.useState<number>(0);
  const [newVarSku, setNewVarSku] = React.useState('');

  // Images State
  const [imagesList, setImagesList] = React.useState<AdminProductImage[]>([]);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [pendingUploads, setPendingUploads] = React.useState<Array<{
    file: File;
    previewUrl: string;
    isMain: boolean;
    color: string;
  }>>([]);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // General Error message
  const [formError, setFormError] = React.useState('');
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 4000);
  };

  const formatDateTimeLocal = (dateStr: any) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'object' && dateStr.date) {
      dateStr = dateStr.date;
    }
    if (typeof dateStr === 'string') {
      return dateStr.substring(0, 16).replace(' ', 'T');
    }
    return '';
  };

  const loadData = async () => {
    setLoading(true);
    // Séparer les appels pour éviter qu'une erreur sur l'un bloque l'autre
    const [prodsResult, catsAdminResult] = await Promise.allSettled([
      getAdminProducts(),
      getAdminCategories()
    ]);

    if (prodsResult.status === 'fulfilled') {
      setProductList(prodsResult.value);
    } else {
      console.error('Erreur chargement produits admin:', prodsResult.reason);
    }

    if (catsAdminResult.status === 'fulfilled' && catsAdminResult.value.length > 0) {
      // getAdminCategories retourne une liste plate, on l'utilise directement
      setCategories(catsAdminResult.value);
    } else {
      // Fallback sur l'endpoint public (toujours disponible, sans auth)
      console.warn('Catégories admin indisponibles, utilisation de l\'endpoint public...');
      try {
        const publicCats = await getPublicCategories();
        // Convertir au format attendu par le select (id numérique, name, parent)
        const flatCats = publicCats.map(c => ({
          id: Number(c.id),
          name: c.name,
          slug: c.slug,
          parent: c.parentId ? { id: Number(c.parentId), name: '', slug: '' } : null,
          isActive: true,
          position: 0,
          productCount: c.productCount || 0,
          nameEn: c.description || null
        }));
        setCategories(flatCats);
      } catch (fallbackErr) {
        console.error('Erreur chargement catégories (fallback public):', fallbackErr);
      }
    }

    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = async (prodSummary: Product) => {
    setFormError('');
    setActiveFormTab('general');
    setLoading(true);
    setPendingUploads([]);
    try {
      const details = await getAdminProductDetail(Number(prodSummary.id));
      setEditingProduct(details);
      
      setName(details.name);
      setSlug(details.slug || '');
      setShortDescription(details.shortDescription || '');
      setLongDescription(details.longDescription || '');
      setBasePrice(details.basePrice);
      setPromoPrice(details.promoPrice);
      setPromoStartsAt(formatDateTimeLocal(details.promoStartsAt));
      setPromoEndsAt(formatDateTimeLocal(details.promoEndsAt));
      setMetaTitle(details.metaTitle || '');
      setMetaDescription(details.metaDescription || '');
      setCategoryId(details.category ? details.category.id : 0);
      setStatus(details.status || 'active');
      setVariantsList(details.variants || []);
      setImagesList(details.images || []);
      setIsFormOpen(true);
    } catch (err) {
      console.error('Erreur chargement details produit:', err);
      showToast('Impossible de charger les détails de ce produit.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormError('');
    setEditingProduct(null);
    setActiveFormTab('general');
    setPendingUploads([]);
    
    setName('');
    setSlug('');
    setShortDescription('');
    setLongDescription('');
    setBasePrice(0);
    setPromoPrice(null);
    setPromoStartsAt('');
    setPromoEndsAt('');
    setMetaTitle('');
    setMetaDescription('');
    setCategoryId(categories.length > 0 ? categories[0].id : 0);
    setStatus('active');
    setVariantsList([]);
    setImagesList([]);
    setIsFormOpen(true);
  };

  // Variant addition helper
  const addVariantToState = () => {
    const varObj: AdminVariant = {
      size: newVarSize.trim() || undefined,
      color: newVarColor.trim() || undefined,
      colorHex: newVarColor.trim() ? newVarColorHex : undefined,
      stock: newVarStock,
      alertThreshold: 5,
      extraPrice: newVarExtraPrice,
      sku: newVarSku.trim() || undefined,
      isActive: true
    };

    setVariantsList([...variantsList, varObj]);
    // reset input
    setNewVarSize('');
    setNewVarColor('');
    setNewVarSku('');
    setNewVarExtraPrice(0);
  };

  const removeVariantFromState = (index: number) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  // Drag and Drop reordering logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index || !editingProduct) return;

    const newList = [...imagesList];
    const draggedItem = newList[draggedIndex];
    newList.splice(draggedIndex, 1);
    newList.splice(index, 0, draggedItem);
    
    setImagesList(newList);
    setDraggedIndex(null);

    try {
      const ids = newList.map(img => img.id);
      await reorderProductImages(editingProduct.id, ids);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors du réordonnancement des images', 'error');
      // reload original images
      const details = await getAdminProductDetail(editingProduct.id);
      setImagesList(details.images || []);
    }
  };

  // Multiple Image Upload helpers
  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPending: Array<{ file: File; previewUrl: string; isMain: boolean; color: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newPending.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isMain: false,
        color: ''
      });
    }
    setPendingUploads([...pendingUploads, ...newPending]);
  };

  const handleRemovePending = (idx: number) => {
    URL.revokeObjectURL(pendingUploads[idx].previewUrl);
    setPendingUploads(pendingUploads.filter((_, i) => i !== idx));
  };

  const handleUpdatePending = (idx: number, fields: Partial<{ isMain: boolean; color: string }>) => {
    setPendingUploads(pendingUploads.map((item, i) => {
      if (i === idx) {
        return { ...item, ...fields };
      }
      if (fields.isMain === true) {
        return { ...item, isMain: false };
      }
      return item;
    }));
  };

  const handleUploadAllImages = async () => {
    if (pendingUploads.length === 0 || !editingProduct) return;

    setUploadingImage(true);
    try {
      for (const upload of pendingUploads) {
        await uploadProductImage(editingProduct.id, upload.file, upload.color || undefined, upload.isMain);
      }
      // Clean up object URLs
      pendingUploads.forEach(u => URL.revokeObjectURL(u.previewUrl));
      setPendingUploads([]);
      
      const details = await getAdminProductDetail(editingProduct.id);
      setImagesList(details.images || []);
      showToast('Toutes les images ont été téléversées avec succès.', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.message || "Erreur de téléversement de l'une des images", 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSetMainImage = async (imageId: number) => {
    if (!editingProduct) return;
    try {
      await setMainProductImage(editingProduct.id, imageId);
      const details = await getAdminProductDetail(editingProduct.id);
      setImagesList(details.images || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Erreur lors de la modification de l\'image principale', 'error');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editingProduct) return;
    if (window.confirm('Voulez-vous supprimer cette image ?')) {
      try {
        await deleteProductImage(editingProduct.id, imageId);
        const details = await getAdminProductDetail(editingProduct.id);
        setImagesList(details.images || []);
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Erreur lors de la suppression de l\'image', 'error');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Le nom du produit est obligatoire.');
      return;
    }
    if (basePrice <= 0) {
      setFormError('Le prix de base doit être supérieur à 0.');
      return;
    }
    if (categoryId === 0) {
      setFormError('Veuillez sélectionner une catégorie.');
      return;
    }

    setSubmitting(true);
    const payload: ProductPayload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      longDescription: longDescription.trim() || undefined,
      basePrice: Number(basePrice),
      promoPrice: promoPrice !== null ? Number(promoPrice) : null,
      promoStartsAt: promoStartsAt ? promoStartsAt.replace('T', ' ') + ':00' : null,
      promoEndsAt: promoEndsAt ? promoEndsAt.replace('T', ' ') + ':00' : null,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      categoryId: Number(categoryId),
      status: status,
      variants: variantsList
    };

    try {
      let savedProduct: Product;
      if (editingProduct) {
        savedProduct = await updateAdminProduct(editingProduct.id, payload);
      } else {
        savedProduct = await createAdminProduct(payload);
      }

      // Téléversement automatique des images en attente
      if (pendingUploads.length > 0) {
        setUploadingImage(true);
        try {
          for (const upload of pendingUploads) {
            await uploadProductImage(Number(savedProduct.id), upload.file, upload.color || undefined, upload.isMain);
          }
          // Nettoyage des URLs locales
          pendingUploads.forEach(u => URL.revokeObjectURL(u.previewUrl));
          setPendingUploads([]);
        } catch (err: any) {
          showToast("Le produit a bien été enregistré, mais une erreur est survenue lors du téléversement de certaines images.", "error");
        } finally {
          setUploadingImage(false);
        }
      }

      showToast('Produit enregistré avec succès.', 'success');
      setIsFormOpen(false);
      await loadData();
      await refreshCatalog();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erreur lors de la sauvegarde du produit.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveToggle = async (prod: Product) => {
    try {
      if (prod.status === 'active') {
        await archiveAdminProduct(Number(prod.id));
      } else {
        await publishAdminProduct(Number(prod.id));
      }
      await loadData();
      await refreshCatalog();
    } catch (err) {
      console.error('Erreur statut archive:', err);
    }
  };

  // Filter items
  const filteredProducts = productList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStock = selectedStock === 'Tous' || 
      (selectedStock === 'En rupture' && p.stock === 0) || 
      (selectedStock === 'Stock faible' && p.stock > 0 && p.stock < 10) || 
      (selectedStock === 'En stock' && p.stock >= 10);
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border text-sm font-bold uppercase tracking-wider
              ${toast.type === 'success' 
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' 
                : 'bg-red-500 text-white border-red-400 shadow-red-500/20'
              }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
             <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion des Produits</h1>
            <p className="text-xs text-medium-gray font-medium">{productList.length} produits enregistrés au catalogue</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenCreate}
            className="h-11 px-6 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary-blue/20"
          >
            <Plus className="w-5 h-5" />
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-gray flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-medium-gray" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, référence, marque..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-12 pr-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-medium-gray uppercase">Catégorie</span>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm font-bold transition-all min-w-[140px]"
            >
              <option value="Tous">Toutes</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-medium-gray uppercase">Stock</span>
            <select 
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm font-bold transition-all min-w-[140px]"
            >
              <option value="Tous">Tous les niveaux</option>
              <option value="En stock">En stock</option>
              <option value="Stock faible">Stock faible</option>
              <option value="En rupture">En rupture</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-medium-gray font-medium">Chargement du catalogue...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] text-[10px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
                <tr>
                  <th className="px-6 py-4">Produit</th>
                  <th className="px-6 py-4">Prix de base</th>
                  <th className="px-6 py-4">Promo</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-medium-gray italic font-medium">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-light-gray border border-light-gray/50 overflow-hidden shrink-0 shadow-sm relative flex items-center justify-center">
                            <img src={p.image} className="w-full h-full object-cover" alt={p.name} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-dark-gray truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-[9px] font-black bg-primary-blue/10 text-primary-blue px-1.5 py-0.5 rounded leading-none uppercase">{p.brand}</span>
                               <span className="text-[9px] font-bold text-medium-gray uppercase tracking-tighter italic">{p.category}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-dark-gray text-sm">
                        {p.price.toLocaleString()} F
                      </td>
                      <td className="px-6 py-4">
                        {p.originalPrice ? (
                          <span className="bg-red-50 text-red-600 text-xs font-black px-2 py-0.5 rounded border border-red-100">
                            En Promo
                          </span>
                        ) : (
                          <span className="text-xs text-medium-gray font-medium">Non</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock < 10 ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                          <span className={`text-sm font-black ${p.stock === 0 ? 'text-red-600' : p.stock < 10 ? 'text-orange-600' : 'text-dark-gray'}`}>
                            {p.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors" 
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleArchiveToggle(p)}
                            className={`p-2 rounded-lg transition-colors ${p.stock > 0 ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={p.stock > 0 ? "Archiver" : "Publier"}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- FORM MODAL --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-light-gray flex items-center justify-between bg-primary-blue/5">
                <div>
                   <h2 className="font-display font-black text-xl text-dark-gray">{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
                   <p className="text-xs text-medium-gray font-medium">Gérez les fiches techniques, tarifs, variantes et médias</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                  <Plus className="w-6 h-6 rotate-45 text-medium-gray" />
                </button>
              </div>

              {/* Tabs selector */}
              <div className="flex bg-[#F8FAFC] border-b border-light-gray px-6">
                <button 
                  onClick={() => setActiveFormTab('general')}
                  className={`h-12 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeFormTab === 'general' ? 'border-primary-blue text-primary-blue' : 'border-transparent text-medium-gray'}`}
                >
                  <Tag className="w-4 h-4" />
                  Général et prix
                </button>
                <button 
                  onClick={() => setActiveFormTab('variants')}
                  className={`h-12 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${activeFormTab === 'variants' ? 'border-primary-blue text-primary-blue' : 'border-transparent text-medium-gray'}`}
                >
                  <Layers className="w-4 h-4" />
                  Variantes ({variantsList.length})
                </button>
                <button 
                  disabled={!editingProduct}
                  onClick={() => setActiveFormTab('images')}
                  className={`h-12 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 disabled:opacity-50 ${activeFormTab === 'images' ? 'border-primary-blue text-primary-blue' : 'border-transparent text-medium-gray'}`}
                  title={!editingProduct ? "Créez le produit d'abord pour activer les photos" : ""}
                >
                  <ImageIcon className="w-4 h-4" />
                  Photos ({imagesList.length})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-[#F8FAFC]">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                    {formError}
                  </div>
                )}

                {/* Tab General */}
                {activeFormTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Nom du produit *</label>
                          <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Ex: T-Shirt Classique Coton" 
                            className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Slug (Optionnel)</label>
                          <input 
                            type="text" 
                            value={slug} 
                            onChange={(e) => setSlug(e.target.value)} 
                            placeholder="Ex: t-shirt-classique-coton" 
                            className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-mono" 
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Catégorie *</label>
                          <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(Number(e.target.value))} 
                            className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold"
                          >
                            <option value={0}>Sélectionner une catégorie</option>
                            {(() => {
                              const rootCategories = categories.filter(c => !c.parent);
                              return rootCategories.map(root => {
                                const children = categories.filter(c => c.parent && Number(c.parent.id) === Number(root.id));
                                if (children.length === 0) {
                                  return (
                                    <option key={root.id} value={root.id}>
                                      {root.name}
                                    </option>
                                  );
                                }
                                return (
                                  <optgroup key={root.id} label={root.name}>
                                    {children.map(sub => (
                                      <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                      </option>
                                    ))}
                                  </optgroup>
                                );
                              });
                            })()}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Statut catalogue</label>
                          <select 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value as any)} 
                            className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold"
                          >
                            <option value="active">Actif (Visible au public)</option>
                            <option value="draft">Brouillon (Masqué)</option>
                            <option value="archived">Archivé</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Prix de base (FCFA) *</label>
                            <input 
                              type="number" 
                              value={basePrice || ''} 
                              onChange={(e) => setBasePrice(Number(e.target.value))} 
                              className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-black" 
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Prix Promo (Optionnel)</label>
                            <input 
                              type="number" 
                              value={promoPrice || ''} 
                              onChange={(e) => setPromoPrice(e.target.value ? Number(e.target.value) : null)} 
                              placeholder="Sans réduction" 
                              className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-black" 
                            />
                            {basePrice > 0 && promoPrice !== null && promoPrice > 0 && promoPrice < basePrice && (
                              <span className="text-[10px] font-black text-green-600 block mt-1">
                                Remise calculée : -{Math.round(((basePrice - promoPrice) / basePrice) * 100)}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Début Promo</label>
                            <input 
                              type="datetime-local" 
                              value={promoStartsAt} 
                              onChange={(e) => setPromoStartsAt(e.target.value)} 
                              className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-xs font-bold" 
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Fin Promo</label>
                            <input 
                              type="datetime-local" 
                              value={promoEndsAt} 
                              onChange={(e) => setPromoEndsAt(e.target.value)} 
                              className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-xs font-bold" 
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
                          <span className="text-[10px] font-black uppercase text-primary-blue tracking-wider">SEO et Référencement</span>
                          <div className="space-y-1.5">
                            <input 
                              type="text" 
                              value={metaTitle} 
                              onChange={(e) => setMetaTitle(e.target.value)} 
                              placeholder="Meta Title (Optionnel)" 
                              className="w-full h-9 px-3 bg-white border border-light-gray rounded-lg outline-none focus:border-primary-blue transition-all text-xs font-medium" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <textarea 
                              rows={2}
                              value={metaDescription} 
                              onChange={(e) => setMetaDescription(e.target.value)} 
                              placeholder="Meta Description (Optionnel)" 
                              className="w-full p-2 bg-white border border-light-gray rounded-lg outline-none focus:border-primary-blue transition-all text-xs font-medium" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Description Courte</label>
                        <input 
                          type="text" 
                          value={shortDescription} 
                          onChange={(e) => setShortDescription(e.target.value)} 
                          placeholder="Description accrocheuse d'une ligne" 
                          className="w-full h-11 px-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-medium" 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Description Longue</label>
                        <textarea 
                          rows={4} 
                          value={longDescription} 
                          onChange={(e) => setLongDescription(e.target.value)} 
                          placeholder="Caractéristiques techniques complètes, entretien, spécifications..." 
                          className="w-full p-4 bg-white border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Variants */}
                {activeFormTab === 'variants' && (
                  <div className="space-y-6">
                    {/* Add Variant Form */}
                    <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-dark-gray uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary-blue" />
                        Ajouter une variante
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 items-end">
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-[9px] font-black uppercase text-medium-gray">Taille</label>
                          <input type="text" value={newVarSize} onChange={(e) => setNewVarSize(e.target.value)} placeholder="Ex: M, XL, 42" className="w-full h-10 px-3 bg-light-gray/30 border border-light-gray rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-[9px] font-black uppercase text-medium-gray">Couleur</label>
                          <input type="text" value={newVarColor} onChange={(e) => setNewVarColor(e.target.value)} placeholder="Ex: Rouge" className="w-full h-10 px-3 bg-light-gray/30 border border-light-gray rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-[9px] font-black uppercase text-medium-gray">Couleur Hex</label>
                          <div className="flex gap-2 items-center">
                            <input type="color" value={newVarColorHex} onChange={(e) => setNewVarColorHex(e.target.value)} className="w-10 h-10 p-0 border border-light-gray rounded-xl cursor-pointer" />
                            <span className="text-xs font-mono font-bold text-dark-gray">{newVarColorHex}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-[9px] font-black uppercase text-medium-gray">Stock initial</label>
                          <input type="number" value={newVarStock} onChange={(e) => setNewVarStock(Number(e.target.value))} className="w-full h-10 px-3 bg-light-gray/30 border border-light-gray rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <label className="text-[9px] font-black uppercase text-medium-gray">Prix suppl.</label>
                          <input type="number" value={newVarExtraPrice} onChange={(e) => setNewVarExtraPrice(Number(e.target.value))} className="w-full h-10 px-3 bg-light-gray/30 border border-light-gray rounded-xl text-xs font-bold outline-none" />
                        </div>
                        <div className="space-y-1.5 col-span-1">
                          <button 
                            type="button" 
                            onClick={addVariantToState}
                            disabled={!newVarSize.trim() && !newVarColor.trim()}
                            className="w-full h-10 bg-primary-blue text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                          >
                            Ajouter
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Variants list table */}
                    <div className="bg-white rounded-2xl border border-light-gray overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-[#F8FAFC] text-[9px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
                          <tr>
                            <th className="px-6 py-3">Taille</th>
                            <th className="px-6 py-3">Couleur</th>
                            <th className="px-6 py-3">Code Hex</th>
                            <th className="px-6 py-3">Stock</th>
                            <th className="px-6 py-3">Prix Supp.</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-gray text-xs">
                          {variantsList.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-medium-gray italic font-medium">
                                Aucune variante définie pour ce produit.
                              </td>
                            </tr>
                          ) : (
                            variantsList.map((v, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-6 py-3 font-bold text-dark-gray">{v.size || '-'}</td>
                                <td className="px-6 py-3 font-bold text-dark-gray">{v.color || '-'}</td>
                                <td className="px-6 py-3 font-mono">
                                  {v.colorHex ? (
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-4 h-4 rounded-full border border-light-gray shrink-0" style={{ backgroundColor: v.colorHex }} />
                                      {v.colorHex}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-6 py-3 font-black text-dark-gray">{v.stock}</td>
                                <td className="px-6 py-3 font-black text-primary-blue">+{v.extraPrice} F</td>
                                <td className="px-6 py-3 text-right">
                                  <button 
                                    type="button" 
                                    onClick={() => removeVariantFromState(idx)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Images */}
                {activeFormTab === 'images' && editingProduct && (
                  <div className="space-y-6">
                    {/* Upload Box */}
                    <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-dark-gray uppercase tracking-wider">
                        Sélectionner des images de produit
                      </h4>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <label className="h-12 px-6 bg-primary-blue text-white rounded-xl font-display font-black text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            Ajouter des fichiers
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={handleSelectFiles} 
                              className="hidden" 
                            />
                          </label>
                          {uploadingImage && (
                            <span className="text-xs text-medium-gray font-bold animate-pulse">Téléversement en cours...</span>
                          )}
                        </div>

                        {/* Queue of pending uploads */}
                        {pendingUploads.length > 0 && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-light-gray/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-light-gray pb-2">
                              <span className="text-[10px] font-black text-dark-gray uppercase tracking-widest">Images à téléverser ({pendingUploads.length})</span>
                              <button 
                                type="button" 
                                onClick={handleUploadAllImages}
                                disabled={uploadingImage}
                                className="px-4 py-2 bg-primary-green text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow shadow-primary-green/20"
                              >
                                {uploadingImage ? 'Téléversement...' : 'Lancer le téléversement'}
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {pendingUploads.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-3 bg-white border border-light-gray rounded-xl items-center relative group">
                                  <img src={item.previewUrl} className="w-16 h-16 object-cover rounded-lg border border-light-gray" alt="" />
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        id={`main-pending-${idx}`}
                                        checked={item.isMain}
                                        onChange={(e) => handleUpdatePending(idx, { isMain: e.target.checked })}
                                        className="rounded text-primary-blue focus:ring-primary-blue w-4 h-4" 
                                      />
                                      <label htmlFor={`main-pending-${idx}`} className="text-[10px] font-bold text-dark-gray cursor-pointer">Image principale</label>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[8px] font-black uppercase text-medium-gray block">Couleur associée (Optionnel)</label>
                                      <input 
                                        type="text" 
                                        value={item.color} 
                                        onChange={(e) => handleUpdatePending(idx, { color: e.target.value })}
                                        placeholder="Ex: Rouge, Blanc"
                                        className="w-full h-7 px-2 border border-light-gray rounded bg-light-gray/30 text-xs font-bold"
                                      />
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemovePending(idx)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded self-start absolute top-2 right-2"
                                  >
                                    <Plus className="w-4 h-4 rotate-45" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Existing Images list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-medium-gray uppercase tracking-widest block ml-1">Images existantes (Glisser-déposer pour réordonner)</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {imagesList.length === 0 ? (
                          <div className="col-span-full py-12 text-center text-medium-gray italic font-medium bg-white rounded-2xl border border-dashed border-light-gray">
                            Aucune image disponible. Ajoutez la première photo !
                          </div>
                        ) : (
                          imagesList.map((img, idx) => (
                            <div 
                              key={img.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, idx)}
                              onDragOver={(e) => handleDragOver(e, idx)}
                              onDrop={(e) => handleDrop(e, idx)}
                              className="bg-white rounded-2xl border border-light-gray overflow-hidden shadow-sm relative group cursor-grab active:cursor-grabbing transition-all hover:border-primary-blue hover:shadow-md"
                            >
                              <div className="aspect-square relative bg-slate-100">
                                <img src={img.url} className="w-full h-full object-cover select-none pointer-events-none" alt="" />
                                {img.isMain && (
                                  <span className="absolute top-2 left-2 bg-yellow-400 text-dark-gray text-[9px] font-black px-2 py-0.5 rounded shadow">
                                    PRINCIPALE
                                  </span>
                                )}
                              </div>
                              <div className="p-3 flex items-center justify-between border-t border-light-gray bg-white">
                                <button 
                                  type="button" 
                                  disabled={img.isMain}
                                  onClick={() => handleSetMainImage(img.id)}
                                  className="text-[10px] font-black text-primary-blue hover:underline disabled:opacity-30"
                                >
                                  Définir principale
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-light-gray flex items-center justify-end gap-3 shadow-lg">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="h-11 px-6 rounded-xl font-bold text-sm text-medium-gray hover:bg-light-gray transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  disabled={submitting}
                  onClick={handleFormSubmit}
                  className="h-11 px-8 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary-blue/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Enregistrement...' : editingProduct ? 'Enregistrer les modifications' : 'Publier le produit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
