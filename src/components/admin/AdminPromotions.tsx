import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Plus, Tag, Calendar, TrendingUp, X, Check, Save, Zap } from 'lucide-react';
import { useAppContext, Promotion } from '../../context/AppContext';

export const AdminPromotions = () => {
  const { promotions, upsertPromotion } = useAppContext();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState<Promotion | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified save
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600/10 text-red-600 rounded-xl">
             <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-dark-gray uppercase tracking-tighter">Gestion des Promotions</h1>
            <p className="text-xs text-medium-gray font-medium">Codes promo, remises automatiques et offres flash</p>
          </div>
        </div>
        <button 
          onClick={() => { setEditingPromo(null); setIsFormOpen(true); }}
          className="h-11 px-6 bg-red-600 text-white rounded-xl font-display font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
        >
          <Plus className="w-5 h-5" />
          Créer un Code Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-light-gray flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
             <Tag className="w-6 h-6" />
          </div>
          <div>
             <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest leading-none mb-1">Codes Actifs</p>
             <h3 className="text-2xl font-display font-black text-dark-gray leading-none">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-light-gray flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div>
             <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest leading-none mb-1">Remises Automatiques</p>
             <h3 className="text-2xl font-display font-black text-dark-gray leading-none">3</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-light-gray flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center border border-red-100">
             <Zap className="w-6 h-6" />
          </div>
          <div>
             <p className="text-[10px] font-black text-medium-gray uppercase tracking-widest leading-none mb-1">Offres Flash</p>
             <h3 className="text-2xl font-display font-black text-dark-gray leading-none">1</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-light-gray overflow-hidden">
        <div className="p-6 border-b border-light-gray">
           <h3 className="text-lg font-display font-black text-dark-gray">Codes Promotionnels</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-light-gray/20 text-[10px] font-black text-medium-gray uppercase tracking-widest border-b border-light-gray">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Valeur</th>
              <th className="px-6 py-4">Utilisations</th>
              <th className="px-6 py-4">Expiration</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {promotions.length === 0 ? (
               <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-medium-gray italic font-medium">Aucun code promo créé. Commencez par en créer un !</td></tr>
            ) : (
              promotions.map(p => (
                <tr key={p.id} className="hover:bg-red-50/30">
                  <td className="px-6 py-4">
                     <code className="bg-light-gray px-2 py-1 rounded font-mono font-bold text-dark-gray uppercase">{p.code}</code>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-medium-gray">{p.type === 'percentage' ? 'Pourcentage' : 'Montant Fixe'}</td>
                  <td className="px-6 py-4 text-sm font-black text-dark-gray">{p.value}{p.type === 'percentage' ? '%' : ' F'}</td>
                  <td className="px-6 py-4 text-xs font-medium text-medium-gray">{p.currentUses} / {p.maxUses || '∞'}</td>
                  <td className="px-6 py-4 text-xs text-medium-gray">{p.endDate}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {p.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="text-primary-blue hover:underline text-xs font-bold mr-4">Désactiver</button>
                     <button className="text-medium-gray hover:text-dark-gray text-xs font-bold">Modifier</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white rounded-2xl w-full max-w-[500px] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-light-gray bg-red-600/5">
                <h2 className="font-display font-black text-xl text-dark-gray uppercase tracking-tighter">Créer un Code Promo</h2>
                <p className="text-xs text-medium-gray">Définissez vos règles de réduction</p>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Code Promotionnel</label>
                       <div className="flex gap-2">
                          <input type="text" placeholder="EX: DG2025" className="flex-1 h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-red-600 transition-all font-mono font-bold uppercase" />
                          <button type="button" className="h-11 px-4 bg-light-gray/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-light-gray transition-all">Générer</button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Type</label>
                          <select className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-red-600 transition-all font-bold">
                             <option>Pourcentage (%)</option>
                             <option>Montant Fixe (F)</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Valeur</label>
                          <input type="number" placeholder="0" className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-red-600 transition-all font-black" />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Utilisation Max</label>
                       <input type="number" placeholder="Illimité si vide" className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-red-600 transition-all font-bold" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Date Début</label>
                          <input type="date" className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-red-600 transition-all font-bold text-xs" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-medium-gray ml-1">Date Fin</label>
                          <input type="date" className="w-full h-11 px-4 bg-light-gray/30 border border-light-gray rounded-xl outline-none focus:border-red-600 transition-all font-bold text-xs" />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-light-gray">
                    <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-medium-gray hover:bg-light-gray transition-all">Annuler</button>
                    <button type="submit" className="flex-1 h-12 bg-red-600 text-white rounded-xl font-display font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">Enregistrer</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
