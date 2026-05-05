import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit3, 
  Copy, 
  Archive, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { useAppContext, Product } from '../../context/AppContext';

export const AdminCatalog = () => {
  const { products, deleteProduct, upsertProduct } = useAppContext();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Tous');
  const [selectedStock, setSelectedStock] = React.useState('Tous');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesStock = selectedStock === 'Tous' || 
      (selectedStock === 'En rupture' && p.stock === 0) || 
      (selectedStock === 'Stock faible' && p.stock > 0 && p.stock < 10) || 
      (selectedStock === 'En stock' && p.stock >= 10);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProduct(id);
    }
  };

  const handleDuplicate = (product: Product) => {
    const duplicated = { ...product, id: `copy-${Date.now()}`, name: `${product.name} (Copie)` };
    upsertProduct(duplicated);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
             <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion des Produits</h1>
            <p className="text-xs text-medium-gray font-medium">{products.length} produits enregistrés au catalogue</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="h-11 px-6 bg-white border border-primary-blue text-primary-blue rounded-xl font-bold text-sm hover:bg-primary-blue/5 transition-all outline-none">
            Importer en Excel
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null);
              // In a real app we'd open a full form page. For this demo we just toggle.
              setIsFormOpen(true);
            }}
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
              {categories.map(c => <option key={c} value={c}>{c === 'Tous' ? 'Toutes' : (c as string).toUpperCase()}</option>)}
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[10px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
              <tr>
                <th className="w-12 px-6 py-4"><input type="checkbox" className="rounded" /></th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Ventes</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-primary-blue/5 transition-all group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-light-gray border border-light-gray/50 overflow-hidden shrink-0 shadow-sm relative">
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        {p.stock === 0 && (
                          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">LOW</span>
                          </div>
                        )}
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
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-dark-gray">{p.price.toLocaleString()} F</span>
                      {p.originalPrice && (
                        <span className="text-[10px] text-red-500 line-through font-bold">{p.originalPrice.toLocaleString()} F</span>
                      )}
                    </div>
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
                    <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold text-[10px] uppercase tracking-widest border border-green-100">
                      Actif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-medium-gray">
                    {Math.floor(Math.random() * 50)} <TrendingUp className="inline w-3 h-3 text-green-500 ml-1" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingProduct(p); setIsFormOpen(true); }}
                        className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition-colors" 
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => handleDuplicate(p)}
                         className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                         title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 bg-light-gray/30 border-t border-light-gray flex items-center justify-between">
           <p className="text-xs text-medium-gray font-medium">Affichage de 1 à {filteredProducts.length} sur {products.length} produits</p>
           <div className="flex gap-2">
              <button disabled className="p-2 rounded-lg border border-light-gray bg-white text-medium-gray disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button className="h-8 w-8 rounded-lg bg-primary-blue text-white text-xs font-bold ring-2 ring-primary-blue/20">1</button>
              <button className="h-8 w-8 rounded-lg bg-white border border-light-gray text-medium-gray text-xs font-bold hover:bg-light-gray transition-all">2</button>
              <button className="p-2 rounded-lg border border-light-gray bg-white text-medium-gray"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
      </div>

      {/* --- FORM MODAL (SIMPLIFIED FOR DEMO) --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-light-gray flex items-center justify-between bg-light-gray/20">
                <div>
                   <h2 className="font-display font-black text-xl text-dark-gray">{editingProduct ? 'Modifier le produit' : 'Nouveau Produit'}</h2>
                   <p className="text-xs text-medium-gray font-medium">Informations essentielles du catalogue</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                  <Plus className="w-6 h-6 rotate-45 text-medium-gray" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-[#F8FAFC]">
                {/* Form Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-primary-blue mb-2">
                        <Tag className="w-4 h-4 font-black" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest">Informations Générales</h4>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Nom du produit</label>
                        <input type="text" defaultValue={editingProduct?.name} className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Marque</label>
                            <input type="text" defaultValue={editingProduct?.brand} className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold" />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Catégorie</label>
                            <select defaultValue={editingProduct?.category} className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold uppercase">
                               {categories.filter(c => c !== 'Tous').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                         </div>
                      </div>
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-primary-blue mb-2">
                        <TrendingUp className="w-4 h-4 font-black" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest">Prix et Stock</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Prix normal (F)</label>
                          <input type="number" defaultValue={editingProduct?.price} className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-black" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Stock disponible</label>
                          <input type="number" defaultValue={editingProduct?.stock} className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-black" />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-light-gray shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-primary-blue mb-2">
                        <ImageIcon className="w-4 h-4 font-black" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest">Média</h4>
                      </div>
                      <div className="border-2 border-dashed border-light-gray rounded-2xl h-48 flex flex-col items-center justify-center p-6 text-center hover:border-primary-blue/50 hover:bg-primary-blue/5 transition-all cursor-pointer group">
                        <div className="p-4 bg-light-gray group-hover:bg-primary-blue/20 rounded-full mb-3 transition-colors">
                           <Plus className="w-8 h-8 text-medium-gray group-hover:text-primary-blue" />
                        </div>
                        <p className="text-xs font-bold text-dark-gray">Glissez une image ici</p>
                        <p className="text-[10px] text-medium-gray mt-1">PNG, JPG ou WebP (max 5MB)</p>
                      </div>
                      {editingProduct && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                           <div className="aspect-square relative rounded-lg overflow-hidden border border-light-gray group">
                              <img src={editingProduct.image} className="w-full h-full object-cover" />
                              <button className="absolute inset-0 bg-red-500/80 items-center justify-center hidden group-hover:flex">
                                 <Trash2 className="w-5 h-5 text-white" />
                              </button>
                           </div>
                        </div>
                      )}
                    </section>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-light-gray flex items-center justify-end gap-3 shadow-lg">
                <button onClick={() => setIsFormOpen(false)} className="h-11 px-6 rounded-xl font-bold text-sm text-medium-gray hover:bg-light-gray transition-all">
                  Annuler
                </button>
                <button onClick={() => setIsFormOpen(false)} className="h-11 px-8 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary-blue/20">
                  {editingProduct ? 'Enregistrer les modifications' : 'Publier le produit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
