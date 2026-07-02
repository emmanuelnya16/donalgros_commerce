import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderTree, Plus, Edit3, Trash2, X, Save, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  CategoryPayload
} from '../../services/catalogueService';

interface AdminCategoryItem {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  image: string | null;
  position: number;
  isActive: boolean;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  productCount: number;
}

export const AdminCategories = () => {
  const { refreshCatalog } = useAppContext();
  const [categoriesList, setCategoriesList] = React.useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<AdminCategoryItem | null>(null);

  // Form Fields
  const [name, setName] = React.useState('');
  const [nameEn, setNameEn] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [parentId, setParentId] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState(0);
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAdminCategories();
      setCategoriesList(data);
    } catch (err) {
      console.error('Erreur de chargement des catégories administration:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setNameEn(editingCategory.nameEn || '');
      setSlug(editingCategory.slug);
      setParentId(editingCategory.parent ? editingCategory.parent.id : null);
      setPosition(editingCategory.position);
      setIsActive(editingCategory.isActive);
    } else {
      setName('');
      setNameEn('');
      setSlug('');
      setParentId(null);
      setPosition(0);
      setIsActive(true);
    }
    setFormError('');
  }, [editingCategory, isFormOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Le nom est obligatoire.');
      return;
    }

    const payload: CategoryPayload = {
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      slug: slug.trim() || undefined,
      parentId: parentId,
      position: position,
      isActive: isActive
    };

    try {
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload);
      } else {
        await createAdminCategory(payload);
      }
      setIsFormOpen(false);
      await loadData();
      await refreshCatalog(); // Sync with global site navigation
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde.';
      setFormError(msg);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) {
      try {
        await deleteAdminCategory(id);
        await loadData();
        await refreshCatalog();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Impossible de supprimer cette catégorie (elle contient peut-être des produits ou des sous-catégories).';
        alert(msg);
      }
    }
  };

  const filteredCategories = categoriesList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.nameEn && c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-blue/10 text-primary-blue rounded-xl">
             <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion des Catégories</h1>
            <p className="text-xs text-medium-gray font-medium">{categoriesList.length} catégories définies dans le catalogue</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}
          className="h-11 px-6 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary-blue/20"
        >
          <Plus className="w-5 h-5" />
          Ajouter une catégorie
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-gray">
        <input 
          type="text" 
          placeholder="Rechercher une catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 px-4 bg-light-gray/20 border border-transparent focus:border-primary-blue focus:bg-white rounded-xl outline-none text-sm transition-all font-medium"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-medium-gray font-medium">Chargement des catégories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-light-gray/20 text-[10px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
                <tr>
                  <th className="px-6 py-4">Nom (FR)</th>
                  <th className="px-6 py-4">Nom (EN)</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Parente</th>
                  <th className="px-6 py-4 text-center">Position</th>
                  <th className="px-6 py-4 text-center">Produits</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray text-sm">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-medium-gray italic font-medium">
                      Aucune catégorie trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(cat => (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors font-medium">
                      <td className="px-6 py-4 font-bold text-dark-gray">{cat.name}</td>
                      <td className="px-6 py-4 text-medium-gray">{cat.nameEn || '-'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-medium-gray">{cat.slug}</td>
                      <td className="px-6 py-4">
                        {cat.parent ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-dark-gray px-2 py-0.5 rounded font-bold">
                            {cat.parent.name}
                          </span>
                        ) : (
                          <span className="text-xs text-medium-gray italic">Racine</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-dark-gray">{cat.position}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-50 text-primary-blue text-xs font-black px-2 py-1 rounded">
                          {cat.productCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${cat.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {cat.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setEditingCategory(cat); setIsFormOpen(true); }}
                            className="p-2 text-medium-gray hover:text-primary-blue hover:bg-primary-blue/5 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-2 text-medium-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl w-full max-w-[500px] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-light-gray flex items-center justify-between bg-primary-blue/5">
                <div>
                   <h2 className="font-display font-black text-xl text-dark-gray">{editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}</h2>
                   <p className="text-xs text-medium-gray font-medium">Définissez la structure de votre catalogue</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                  <Plus className="w-6 h-6 rotate-45 text-medium-gray" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-6">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                    {formError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Nom de la catégorie (FR) *</label>
                     <input 
                       type="text" 
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       placeholder="Ex: Chaussures" 
                       className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold"
                     />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Nom de la catégorie (EN)</label>
                     <input 
                       type="text" 
                       value={nameEn}
                       onChange={(e) => setNameEn(e.target.value)}
                       placeholder="Ex: Shoes" 
                       className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold"
                     />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Slug personnalisable (Optionnel)</label>
                     <input 
                       type="text" 
                       value={slug}
                       onChange={(e) => setSlug(e.target.value)}
                       placeholder="Ex: chaussures-sport" 
                       className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-mono"
                     />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Catégorie Parente</label>
                     <select 
                       value={parentId || ''}
                       onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                       className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-bold"
                     >
                        <option value="">Aucune (Catégorie Racine)</option>
                        {categoriesList
                          .filter(c => !editingCategory || c.id !== editingCategory.id) // Empêcher l'auto-parenté
                          .map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))
                        }
                     </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Position / Ordre</label>
                        <input 
                          type="number" 
                          value={position}
                          onChange={(e) => setPosition(Number(e.target.value))}
                          className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-primary-blue transition-all text-sm font-black"
                        />
                     </div>
                     <div className="space-y-1.5 flex flex-col justify-center pl-2">
                        <label className="text-[10px] font-black uppercase text-medium-gray mb-2">Visibilité publique</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-blue"></div>
                          <span className="ml-3 text-xs font-bold text-dark-gray">{isActive ? 'Visible' : 'Masquée'}</span>
                        </label>
                     </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-light-gray">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)} 
                    className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-medium-gray hover:bg-light-gray transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 h-12 bg-primary-blue text-white rounded-xl font-display font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary-blue/20 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
